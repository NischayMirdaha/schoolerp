import { api } from './api';
import { downloadAndOpenPdf } from './fileDownload';
import { PagedResult } from '../types/common';
import {
  ChildFeeSummaryResponse,
  SubmitPaymentClaimRequest,
  StudentLedgerResponse,
  LedgerEntryResponse,
  FeeHeadResponseDto,
  CreateFeeHeadRequestDto,
  SetFeeHeadClassAmountRequestDto,
  FeeHeadClassAmountResponseDto,
  PostPeriodicChargesRequestDto,
  PostChargesResponseDto,
  PostOpeningBalanceRequestDto,
  PostLedgerAdjustmentRequestDto,
  EnterDirectPaymentRequestDto,
  ApprovePaymentResponseDto,
  DiscountResponseDto,
  GetDefaultersResponseDto,
  RequestStudentDiscountRequestDto,
} from '../types/fee';

export const feeService = {
  async getChildFeeSummary(studentId: number): Promise<ChildFeeSummaryResponse> {
    return api.request<ChildFeeSummaryResponse>(`/fee-summary/${studentId}`);
  },

  async submitPaymentClaim(studentId: number, request: SubmitPaymentClaimRequest): Promise<LedgerEntryResponse> {
    return api.request<LedgerEntryResponse>('/fee-payments/claim', {
      method: 'POST',
      body: JSON.stringify({ ...request, studentId }),
    });
  },

  async getStudentLedger(studentId: number, page = 1, pageSize = 20): Promise<StudentLedgerResponse> {
    return api.request<StudentLedgerResponse>(`/fee-ledger/${studentId}?page=${page}&pageSize=${pageSize}`);
  },

    /**
   * Downloads the PDF fee receipt (§10.7) and opens the OS share sheet.
   *
   * FIX (#6): replaces `getReceiptPdfUrl`, which only returned a relative path
   * string and was never called from anywhere in the app.
   */
  async downloadReceipt(receiptId: number, receiptNumber?: string | null): Promise<string> {
    const name = receiptNumber ? `receipt-${receiptNumber}.pdf` : `receipt-${receiptId}.pdf`;
    return downloadAndOpenPdf(`/fee-receipts/${receiptId}/pdf`, name);
  },

  async listFeeHeads(): Promise<FeeHeadResponseDto[]> {
    return api.request<FeeHeadResponseDto[]>('/fee-heads');
  },

  async createFeeHead(request: CreateFeeHeadRequestDto): Promise<FeeHeadResponseDto> {
    return api.request<FeeHeadResponseDto>('/fee-heads', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async setFeeHeadClassAmount(feeHeadId: number, request: SetFeeHeadClassAmountRequestDto): Promise<FeeHeadClassAmountResponseDto> {
    return api.request<FeeHeadClassAmountResponseDto>(`/fee-heads/${feeHeadId}/class-amounts`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async postPeriodicCharges(
  request: PostPeriodicChargesRequestDto
): Promise<PostChargesResponseDto> {
  return api.request<PostChargesResponseDto>('/fee-ledger/charges', {
    method: 'POST',
    body: JSON.stringify(request),
  });
},

async postOpeningBalance(
  request: PostOpeningBalanceRequestDto
): Promise<LedgerEntryResponse> {
  return api.request<LedgerEntryResponse>('/fee-ledger/opening-balance', {
    method: 'POST',
    body: JSON.stringify(request),
  });
},

async postLedgerAdjustment(
  request: PostLedgerAdjustmentRequestDto
): Promise<LedgerEntryResponse> {
  return api.request<LedgerEntryResponse>('/fee-ledger/adjustments', {
    method: 'POST',
    body: JSON.stringify(request),
  });
},

async enterDirectPayment(
  request: EnterDirectPaymentRequestDto
): Promise<ApprovePaymentResponseDto> {
  return api.request<ApprovePaymentResponseDto>('/fee-payments/direct', {
    method: 'POST',
    body: JSON.stringify(request),
  });
},

  async listPendingPayments(page = 1, pageSize = 20): Promise<PagedResult<LedgerEntryResponse>> {
    return api.request<PagedResult<LedgerEntryResponse>>(`/fee-payments/pending?page=${page}&pageSize=${pageSize}`);
  },

  async approvePayment(ledgerId: number): Promise<void> {
    return api.request<void>(`/fee-payments/${ledgerId}/approve`, {
      method: 'POST',
    });
  },

  async rejectPayment(ledgerId: number, reason: string): Promise<void> {
    return api.request<void>(`/fee-payments/${ledgerId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async requestDiscount(
  request: RequestStudentDiscountRequestDto
): Promise<DiscountResponseDto> {
  return api.request<DiscountResponseDto>('/discounts/request', {
    method: 'POST',
    body: JSON.stringify(request),
  });
},

  async listDiscounts(
    filters: {
      studentId?: number;
      academicYearId?: number;
      status?: 'pending' | 'approved';
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<PagedResult<DiscountResponseDto>> {
    const params = new URLSearchParams({
      page: String(filters.page ?? 1),
      pageSize: String(filters.pageSize ?? 20),
    });

    if (filters.studentId) {
      params.set('studentId', String(filters.studentId));
    }

    if (filters.academicYearId) {
      params.set(
        'academicYearId',
        String(filters.academicYearId)
      );
    }

    if (filters.status) {
      params.set('status', filters.status);
    }

    return api.request<PagedResult<DiscountResponseDto>>(
      `/discounts?${params.toString()}`
    );
  },

  async approveDiscount(discountId: number): Promise<void> {
    return api.request<void>(`/discounts/${discountId}/approve`, {
      method: 'POST',
    });
  },

  async rejectDiscount(discountId: number): Promise<void> {
    return api.request<void>(`/discounts/${discountId}/reject`, {
      method: 'POST',
    });
  },

  async getDefaulters(classId?: number, minAmount?: number, agingBucket?: string, page = 1, pageSize = 20): Promise<GetDefaultersResponseDto> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (classId) params.set('classId', String(classId));
    if (minAmount) params.set('minAmount', String(minAmount));
    if (agingBucket) params.set('agingBucket', agingBucket);

    return api.request<GetDefaultersResponseDto>(`/fee-reports/defaulters?${params.toString()}`);
  },

  async setExamEligibility(studentId: number, examAllowed: boolean): Promise<void> {
    return api.request<void>(`/students/${studentId}/exam-eligibility`, {
      method: 'PUT',
      body: JSON.stringify({ examAllowed }),
    });
  },
};