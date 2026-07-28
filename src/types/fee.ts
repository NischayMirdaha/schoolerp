export interface ChildFeeSummaryResponse {
  studentId: number;
  studentName: string;
  admissionNo: string;
  className?: string | null;
  sectionName?: string | null;
  currentBalance: number;
  currentCreditBalance: number;
  schoolBankName?: string | null;
  schoolBankAccountNumber?: string | null;
  schoolBankAccountName?: string | null;
  schoolBankBranch?: string | null;
  qrCodePath?: string | null;
}

export interface SubmitPaymentClaimRequest {
  studentId?: number | null;
  amount: number;
  paymentMethod: 'cash' | 'cheque' | 'bank' | 'other';
  paymentDate: string; // YYYY-MM-DD
  referenceNumber: string;
  note?: string | null;
}

export interface LedgerEntryResponse {
  id: number;
  studentId: number;
  academicYearId: number;
  feeHeadId?: number | null;
  feeHeadName?: string | null;
  transactionType: string;
  description?: string | null;
  amount: number;
  balanceAfter: number;
  creditBalanceAfter: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod?: string | null;
  referenceNumber?: string | null;
  paymentDate?: string | null;
  transactionDate: string;
  createdBy?: number | null;/** FIX (#6): present only on approved payments that generated a receipt (§10.7). */
  receiptId?: number | null;
  receiptNumber?: string | null;
}

export interface FeeBalanceDto {
  currentBalance: number;
  currentCreditBalance: number;
}

export interface StudentLedgerResponse {
  entries: {
    items: LedgerEntryResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
  };
  balance: FeeBalanceDto;
}

export interface FeeHeadResponseDto {
  id: number;
  schoolId: number;
  name: string;
  cycle: 'monthly' | 'yearly';
  dueDay?: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateFeeHeadRequestDto {
  name: string;
  cycle: 'monthly' | 'yearly';
  dueDay?: number | null;
}

export interface FeeHeadClassAmountResponseDto {
  id: number;
  feeHeadId: number;
  classId: number;
  academicYearId: number;
  amount: number;
}

export interface SetFeeHeadClassAmountRequestDto {
  classId: number;
  academicYearId: number;
  amount: number;
}

export interface PostPeriodicChargesRequestDto {
  feeHeadId: number;
  academicYearId: number;
  classId?: number | null;
  sectionId?: number | null;
  studentIds?: number[] | null;
  year: number;
  month?: number | null;
}

export interface PostChargesResponseDto {
  chargedCount: number;
  skippedCount: number;
  skippedStudentIds: number[];
  referenceNumber: string;
}

export interface PostOpeningBalanceRequestDto {
  studentId: number;
  academicYearId: number;
  amount: number;
  description?: string | null;
}

export interface EnterDirectPaymentRequestDto {
  studentId: number;
  academicYearId: number;
  amount: number;
  paymentMethod: 'cash' | 'cheque' | 'bank' | 'other';
  paymentDate: string; // YYYY-MM-DD
  referenceNumber?: string | null;
  note?: string | null;
}

export interface ApprovePaymentResponseDto {
  ledgerId: number;
  receiptId: number;
  receiptNumber: string;
  amount: number;
  newBalance: number;
  newCreditBalance: number;
}

export interface PostLedgerAdjustmentRequestDto {
  studentId: number;
  academicYearId: number;
  type: 'credit' | 'waived';
  amount: number;
  description?: string | null;
}

export interface RequestStudentDiscountRequestDto {
  studentId?: number | null;
  academicYearId: number;
  percentage: number;
  mode: 'proportional' | 'lump_sum';
  reason?: string | null;
}

export interface DiscountResponseDto {
  id: number;
  studentId: number;
  studentName?: string | null;
  classId: number;
  academicYearId: number;
  percentage: number;
  mode: string;
  reason?: string | null;
  requestedBy?: number | null;
  isApproved: boolean;
  approvedBy?: number | null;
  approvedAt?: string | null;
}

export interface DefaulterStudentResponseDto {
  studentId: number;
  studentName: string;
  admissionNo: string;
  classId: number;
  className: string;
  sectionId?: number | null;
  sectionName?: string | null;
  totalDues: number;
  creditBalance: number;
  lastPaymentDate?: string | null;
  daysOverdue: number;
  agingBucket: string;
}

export interface DefaultersSummaryResponseDto {
  totalDefaultersCount: number;
  totalOverdueAmount: number;
  days0To30Amount: number;
  days31To60Amount: number;
  days61To90Amount: number;
  over90Amount: number;
}

export interface GetDefaultersResponseDto {
  students: {
    items: DefaulterStudentResponseDto[];
    totalCount: number;
    page: number;
    pageSize: number;
  };
  summary: DefaultersSummaryResponseDto;
}