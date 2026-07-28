import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { TokenStorage } from './storage';

/** Backend port. Kept in one place so it isn't repeated across fallbacks. */
const API_PORT = 5265;

function getBaseUrl(): string {
  // 1. Explicit override.
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL.trim().replace(/\/+$/, '');
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    // Fallbacks for dev-client / bare builds where expoConfig is not populated.
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost ??
    (Constants.manifest2 as { extra?: { expoGo?: { debuggerHost?: string } } } | undefined)
      ?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const withoutScheme = hostUri.replace(/^[a-z]+:\/\//i, '');
    const bracketed = withoutScheme.match(/^\[(.+)\]/); // IPv6
    const hostIp = bracketed ? bracketed[1] : withoutScheme.split(':')[0];

    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1' && hostIp !== '::1') {
      return `http://${hostIp}:${API_PORT}/api`;
    }
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}/api`;
  }

  return `http://localhost:${API_PORT}/api`;
}

/** The resolved base URL — exported so a "cannot connect" screen can display it. */
export const API_BASE_URL = getBaseUrl();

export function parseErrorMessage(data: any, defaultMessage: string = 'An unexpected error occurred.'): string {
  if (!data) return defaultMessage;
  if (data.errors && typeof data.errors === 'object') {
    const errorList: string[] = [];
    Object.keys(data.errors).forEach((key) => {
      const val = data.errors[key];
      if (Array.isArray(val)) {
        errorList.push(...val);
      } else if (typeof val === 'string') {
        errorList.push(val);
      }
    });
    if (errorList.length > 0) {
      return errorList.join('\n');
    }
  }
  return data.detail || data.title || data.message || defaultMessage;
}

/** Builds a helpful message for a failed response, distinguishing common statuses. */
function fallbackMessageFor(status: number, endpoint: string): string {
  if (status === 404) return `Not found (404): ${endpoint}`;
  if (status === 403) return 'You do not have permission to perform this action.';
  return `Request failed (${status})`;
}

class ApiClient {
  private refreshPromise: Promise<boolean> | null = null;
  private onSessionExpiredCallbacks: Array<() => void> = [];

  public onSessionExpired(callback: () => void): () => void {
    this.onSessionExpiredCallbacks.push(callback);
    return () => {
      this.onSessionExpiredCallbacks = this.onSessionExpiredCallbacks.filter((cb) => cb !== callback);
    };
  }

  private notifySessionExpired() {
    this.onSessionExpiredCallbacks.forEach((cb) => {
      try {
        cb();
      } catch {}
    });
  }

  private get baseUrl(): string {
    return getBaseUrl();
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "bypass-tunnel-reminder": "true",
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const token = await TokenStorage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token.trim()}`;
    }

    return headers;
  }

  private async buildHeaders(options: RequestInit): Promise<Record<string, string>> {
    const base = await this.getHeaders();
    const merged: Record<string, string> = {
      ...base,
      ...(options.headers as Record<string, string> | undefined),
    };

    if (options.body instanceof FormData) {
      delete merged['Content-Type'];
      // Guard against a differently-cased override slipping through.
      Object.keys(merged).forEach((k) => {
        if (k.toLowerCase() === 'content-type') delete merged[k];
      });
    }

    return merged;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const finalHeaders = await this.buildHeaders(options);

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers: finalHeaders,
      });
    } catch (networkError: any) {
      throw new Error(
        `Cannot connect to API server at ${this.baseUrl}. ` +
        `Ensure the backend is running and reachable from your network.`
      );
    }

    if (
      response.status === 401 &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/refresh-token') &&
      !endpoint.includes('/auth/logout')
    ) {
      const refreshed = await this.attemptTokenRefresh();

      if (!refreshed) {
        await TokenStorage.clearSession();
        this.notifySessionExpired();
        throw new Error('Session expired. Please log in again.');
      }

      // Rebuild through the same helper so FormData uploads keep working
      // after a token refresh.
      const retryHeaders = await this.buildHeaders(options);
      let retryResponse: Response;
      try {
        retryResponse = await fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      } catch {
        throw new Error(`Connection lost while retrying request to ${this.baseUrl}.`);
      }

      if (retryResponse.status === 204) return {} as T;

      if (!retryResponse.ok) {
        // Still 401 after a successful refresh means the new token is also
        // rejected — treat it as a dead session rather than a generic error.
        if (retryResponse.status === 401) {
          await TokenStorage.clearSession();
          this.notifySessionExpired();
          throw new Error('Session expired. Please log in again.');
        }

        const errorData = await retryResponse.json().catch(() => ({}));
        throw new Error(
          parseErrorMessage(errorData, fallbackMessageFor(retryResponse.status, endpoint))
        );
      }

      return retryResponse.json();
    }

    // ── 204 No Content ─────────────────────────────────────────────────────
    if (response.status === 204) {
      return {} as T;
    }

    // ── Any other non-2xx ──────────────────────────────────────────────────
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(parseErrorMessage(errorData, fallbackMessageFor(response.status, endpoint)));
    }

    return response.json();
  }

  private async attemptTokenRefresh(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const currentRefreshToken = await TokenStorage.getRefreshToken();
        if (!currentRefreshToken) return false;

        const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentRefreshToken }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        await TokenStorage.updateTokens(data.accessToken, data.refreshToken, data.accessTokenExpiry, data.activeRole);
        return true;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async refreshSession(): Promise<boolean> {
    return this.attemptTokenRefresh();
  }
}

export const api = new ApiClient();