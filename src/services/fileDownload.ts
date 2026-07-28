import { Platform } from 'react-native';
import { fetch } from 'expo/fetch';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_BASE_URL, api, parseErrorMessage } from './api';
import { TokenStorage } from './storage';

/** Sub-folder inside the OS cache dir where generated PDFs are staged. */
const DOWNLOAD_DIR = 'downloads';

/** Strips characters that are illegal in file names on Android/iOS. */
function safeFileName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  const withExt = cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`;
  return withExt || 'document.pdf';
}

/** Resolves a relative endpoint (`/fee-receipts/1/pdf`) against the live API base URL. */
function resolveUrl(endpointPath: string): string {
  const path = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  return `${API_BASE_URL}${path}`;
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: 'application/pdf',
    'bypass-tunnel-reminder': 'true',
  };

  const token = await TokenStorage.getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }

  return headers;
}

/**
 * Reads a failed response body and turns it into a human message.
 * The PDF endpoints return RFC-7807 ProblemDetails on 400/403/404/422.
 */
async function errorFromResponse(response: Response, endpointPath: string): Promise<Error> {
  let payload: any = null;
  try {
    payload = JSON.parse(await response.text());
  } catch {
    payload = null;
  }

  if (response.status === 404) {
    return new Error(
      parseErrorMessage(payload, 'This document is not available yet. It may not have been generated or published.')
    );
  }
  if (response.status === 403) {
    return new Error(parseErrorMessage(payload, 'You do not have permission to download this document.'));
  }
  if (response.status === 422) {
    return new Error(parseErrorMessage(payload, 'This document cannot be generated with the current data.'));
  }

  return new Error(parseErrorMessage(payload, `Download failed (${response.status}): ${endpointPath}`));
}

/** Fetches the PDF bytes with the Bearer token, refreshing the session once on a 401. */
async function fetchPdfBytes(endpointPath: string): Promise<Uint8Array> {
  const url = resolveUrl(endpointPath);

  let response: Response;
  try {
    response = await fetch(url, { headers: await authHeaders() });
  } catch {
    throw new Error(
      `Cannot connect to the API server at ${API_BASE_URL}. ` +
        `Ensure the backend is running and reachable from your network.`
    );
  }

  // Mirror ApiClient.request: one silent refresh + retry before giving up.
  if (response.status === 401) {
    const refreshed = await api.refreshSession();
    if (!refreshed) {
      await TokenStorage.clearSession();
      throw new Error('Session expired. Please log in again.');
    }

    try {
      response = await fetch(url, { headers: await authHeaders() });
    } catch {
      throw new Error(`Connection lost while retrying the download from ${API_BASE_URL}.`);
    }

    if (response.status === 401) {
      await TokenStorage.clearSession();
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    throw await errorFromResponse(response, endpointPath);
  }

  return new Uint8Array(await response.arrayBuffer());
}

/** Web: no expo-file-system. Trigger a normal browser download from an in-memory blob. */
function saveOnWeb(bytes: Uint8Array, fileName: string): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
}

/**
 * Downloads an authenticated PDF from the API and opens the OS share / "Open with" sheet.
 *
 * Replaces the old `openReportInBrowser`, which hardcoded `localhost:5265` and sent no
 * Authorization header — every call would have 401'd even on the emulator.
 *
 * @param endpointPath API-relative path, e.g. `/fee-receipts/12/pdf`
 * @param fileName     Suggested file name; `.pdf` is appended when missing.
 * @returns The local `file://` URI of the saved PDF (empty string on web).
 */
export async function downloadAndOpenPdf(endpointPath: string, fileName: string): Promise<string> {
  const bytes = await fetchPdfBytes(endpointPath);
  const safeName = safeFileName(fileName);

  if (Platform.OS === 'web') {
    saveOnWeb(bytes, safeName);
    return '';
  }

  const directory = new Directory(Paths.cache, DOWNLOAD_DIR);
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }

  const file = new File(directory, safeName);
  if (file.exists) {
    file.delete();
  }
  file.create({ overwrite: true, intermediates: true });
  file.write(bytes);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: safeName,
    });
  }

  return file.uri;
}

export const fileDownload = { downloadAndOpenPdf };