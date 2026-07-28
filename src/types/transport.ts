export interface DriverResponse {
  id: number;
  schoolId: number;
  name: string;
  phone: string;
  address?: string | null;
  licenseNumber?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface VehicleResponse {
  id: number;
  schoolId: number;
  busName: string;
  plateNumber?: string | null;
  capacity?: number | null;
  driverId?: number | null;
  driverName?: string | null;
  driverPhone?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CheckpointResponse {
  id: number;
  routeId: number;
  name: string;
  orderNo: number;
  createdAt: string;
}

export interface RouteResponse {
  id: number;
  schoolId: number;
  name: string;
  vehicleId?: number | null;
  vehicleName?: string | null;
  vehiclePlateNumber?: string | null;
  isActive: boolean;
  checkpoints: CheckpointResponse[];
  createdAt: string;
}

export interface TripCheckpointLogResponse {
  id: number;
  tripId: number;
  checkpointId: number;
  checkpointName: string;
  checkpointOrderNo: number;
  reachedAt: string;
  loggedBy?: number | null;
}

export interface TripResponse {
  id: number;
  schoolId: number;
  routeId: number;
  routeName: string;
  tripType: 'morning_pickup' | 'afternoon_drop';
  status: 'in_progress' | 'completed';
  startedAt: string;
  endedAt?: string | null;
  startedBy?: number | null;
  checkpointLogs: TripCheckpointLogResponse[];
  createdAt: string;
}

export interface TransportAlertResponse {
  id: number;
  schoolId: number;
  routeId: number;
  routeName: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  sentBy?: number | null;
  sentAt: string;
}

export interface CreateVehicleRequest {
  busName: string;
  plateNumber?: string | null;
  capacity?: number | null;
  driverId?: number | null;
}

export interface StudentCheckpointTrackingDto {
  checkpointId: number;
  checkpointName: string;
  orderNo: number;
  isReached: boolean;
  reachedAt?: string | null;
}

export interface StudentTransportTrackingResponse {
  studentId: number;
  studentName: string;
  routeId: number;
  routeName: string;
  assignedCheckpointId?: number | null;
  assignedCheckpointName?: string | null;
  direction: string;
  vehicleId?: number | null;
  busName?: string | null;
  plateNumber?: string | null;
  driverId?: number | null;
  driverName?: string | null;
  driverPhone?: string | null;
  activeTripId?: number | null;
  tripType?: string | null;
  tripStatus: string;
  checkpoints: StudentCheckpointTrackingDto[];
}


// ── Drivers (create / update / toggle) — FIX (#12) ──────────────────────────
export interface CreateDriverRequest {
  name: string;
  phone: string;
  address?: string | null;
  licenseNumber?: string | null;
}

export interface UpdateDriverRequest {
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  licenseNumber?: string | null;
}

export interface UpdateVehicleRequest {
  busName?: string | null;
  plateNumber?: string | null;
  capacity?: number | null;
  driverId?: number | null;
}
// ── Student transport assignment — FIX (#12) ────────────────────────────────
/** BE validator accepts only these three values. */
export type TransportDirection = 'pickup' | 'drop' | 'both';

export interface AssignStudentTransportRequest {
  studentId: number;
  routeId: number;
  checkpointId?: number | null;
  direction: TransportDirection;
}

export interface StudentTransportAssignmentResponse {
  id: number;
  schoolId: number;
  studentId: number;
  studentName: string;
  admissionNo: string;
  routeId: number;
  routeName: string;
  checkpointId?: number | null;
  checkpointName?: string | null;
  direction: string;
  createdAt: string;
}