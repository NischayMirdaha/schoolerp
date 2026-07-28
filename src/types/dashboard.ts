export interface PrincipalDashboardResponse {
  totalActiveStudents: number;
  todayTeacherPresentCount: number;
  todayTeacherTotalCount: number;
  todayStudentAttendancePercentage: number;
  pendingDiscountsCount: number;
  monthFeeCollection: number;
  upcomingExamsCount: number;
  activeTransportTripsCount: number;
  activeAnnouncementsCount: number;
}

export interface AccountantDashboardResponse {
  pendingPaymentsCount: number;
  todayFeeCollection: number;
  monthToDateFeeCollection: number;
  totalOutstandingDues: number;
  feeDefaultersCount: number;
}

export interface TeacherDashboardResponse {
  todayScheduledPeriodsCount: number;
  todayAssignedHomeworkCount: number;
  recentlyPublishedResultsCount: number;
}

export interface ClassStudentCountDto {
  classId: number;
  className: string;
  activeStudentsCount: number;
}

export interface ReceptionDashboardResponse {
  admissionsThisMonth: number;
  todayVisitorsCount: number;
  openVisitorsCount: number;
  classStudentCounts: ClassStudentCountDto[];
}

export interface LibrarianDashboardResponse {
  booksCurrentlyIssued: number;
  overdueBooksCount: number;
  recentlyReturnedThisWeek: number;
}

export interface TransportDashboardResponse {
  activeTripsCount: number;
  vehiclesInServiceCount: number;
  totalRoutesCount: number;
  totalAssignedStudentsCount: number;
}

export interface StudentDashboardResponse {
  todayScheduledPeriodsCount: number;
  dueHomeworkCount: number;
  latestAnnouncementsCount: number;
  latestResultExamName?: string | null;
  latestResultPercentage?: number | null;
}

export interface ParentChildDashboardResponse {
  studentId: number;
  studentName: string;
  dueHomeworkCount: number;
  outstandingFeeBalance: number;
  activeTransportStatus?: string | null;
  latestResultExamName?: string | null;
  latestResultPercentage?: number | null;
}