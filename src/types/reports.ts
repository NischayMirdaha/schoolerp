export interface StudentAttendanceReportRow {
  studentId: number;
  studentName: string;
  admissionNo: string;
  className: string;
  sectionName?: string | null;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
}

export interface FeeCollectionReportRow {
  feeHeadName: string;
  totalCharged: number;
  totalCollected: number;
  totalOutstanding: number;
}

export interface DailyCollectionReportRow {
  receiptId: number;
  receiptNumber: string;
  paymentDate: string;
  studentId: number;
  studentName: string;
  className: string;
  paymentMethod: string;
  referenceNumber?: string | null;
  amount: number;
}

export interface LibraryReportSummary {
  totalCatalogBooks: number;
  totalCopies: number;
  availableCopies: number;
  currentlyIssuedCopies: number;
  overdueCopiesCount: number;
}

export interface VisitorReportSummary {
  totalVisitorsCount: number;
  openVisitsCount: number;
  closedVisitsCount: number;
}

export interface TransportTripReportSummary {
  totalTripsCount: number;
  morningPickupsCount: number;
  afternoonDropsCount: number;
  completedTripsCount: number;
  inProgressTripsCount: number;
}