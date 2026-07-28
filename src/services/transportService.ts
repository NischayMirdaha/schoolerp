import { api } from './api';
import { PagedResult } from '../types/common';
import {
  DriverResponse,
  VehicleResponse,
  RouteResponse,
  CheckpointResponse,
  TripResponse,
  TransportAlertResponse,
  TripCheckpointLogResponse,
  StudentTransportTrackingResponse,
  CreateDriverRequest,
  UpdateDriverRequest,
  UpdateVehicleRequest,
  AssignStudentTransportRequest,
  StudentTransportAssignmentResponse,
} from '../types/transport';

export const transportService = {
  // ── Drivers ─────────────────────────────────────────────────────────────
  async listDrivers(search?: string, isActive?: boolean): Promise<PagedResult<DriverResponse>> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (isActive !== undefined) params.set('isActive', String(isActive));

    return api.request<PagedResult<DriverResponse>>(`/drivers?${params.toString()}`);
  },

  
  /** FIX (#12): create driver — POST /api/drivers previously had no client method. */
  async createDriver(request: CreateDriverRequest): Promise<DriverResponse> {
    return api.request<DriverResponse>('/drivers', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /** FIX (#12): update driver — PUT /api/drivers/{id}. */
  async updateDriver(id: number, request: UpdateDriverRequest): Promise<DriverResponse> {
    return api.request<DriverResponse>(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  /** FIX (#12): toggle driver active — PUT /api/drivers/{id}/active. */
  async setDriverActive(id: number, isActive: boolean): Promise<DriverResponse> {
    return api.request<DriverResponse>(`/drivers/${id}/active`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },

  // ── Vehicles ────────────────────────────────────────────────────────────
  async listVehicles(search?: string, isActive?: boolean): Promise<PagedResult<VehicleResponse>> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (isActive !== undefined) params.set('isActive', String(isActive));

    return api.request<PagedResult<VehicleResponse>>(`/vehicles?${params.toString()}`);
  },

  async createVehicle(request: { busName: string; plateNumber?: string; capacity?: number; driverId?: number | null }): Promise<VehicleResponse> {
    return api.request<VehicleResponse>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /** FIX (#12): update vehicle (incl. assigning a driver) — PUT /api/vehicles/{id}. */
  async updateVehicle(id: number, request: UpdateVehicleRequest): Promise<VehicleResponse> {
    return api.request<VehicleResponse>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  /** FIX (#12): toggle vehicle active — PUT /api/vehicles/{id}/active. */
  async setVehicleActive(id: number, isActive: boolean): Promise<VehicleResponse> {
    return api.request<VehicleResponse>(`/vehicles/${id}/active`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },

  async getStudentTransportTracking(studentId: number): Promise<StudentTransportTrackingResponse> {
    return api.request<StudentTransportTrackingResponse>(`/parents/me/children/${studentId}/transport`);
  },

  // ── Routes & Checkpoints ────────────────────────────────────────────────
  async listRoutes(search?: string, isActive?: boolean): Promise<PagedResult<RouteResponse>> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (isActive !== undefined) params.set('isActive', String(isActive));

    return api.request<PagedResult<RouteResponse>>(`/routes?${params.toString()}`);
  },

  /** Create a route. POST /api/routes already existed but had no client method. */
  async createRoute(name: string, vehicleId?: number | null): Promise<RouteResponse> {
    return api.request<RouteResponse>('/routes', {
      method: 'POST',
      body: JSON.stringify({ name, vehicleId: vehicleId ?? null }),
    });
  },

  async addCheckpoint(routeId: number, name: string, orderNo: number): Promise<CheckpointResponse> {
    return api.request<CheckpointResponse>(`/routes/${routeId}/checkpoints`, {
      method: 'POST',
      body: JSON.stringify({ name, orderNo }),
    });
  },

  // ── Trips & Tracking ────────────────────────────────────────────────────
  /** NEW: backs active-trip recovery after an app restart. */
  async listTrips(
    routeId?: number,
    status?: 'in_progress' | 'completed'
  ): Promise<PagedResult<TripResponse>> {
    const params = new URLSearchParams();
    if (routeId !== undefined) params.set('routeId', String(routeId));
    if (status) params.set('status', status);

    return api.request<PagedResult<TripResponse>>(`/trips?${params.toString()}`);
  },

  async startTrip(routeId: number, tripType: 'morning_pickup' | 'afternoon_drop'): Promise<TripResponse> {
    return api.request<TripResponse>('/trips/start', {
      method: 'POST',
      body: JSON.stringify({ routeId, tripType }),
    });
  },

  async logTripCheckpoint(tripId: number, checkpointId: number): Promise<TripCheckpointLogResponse> {
    return api.request<TripCheckpointLogResponse>(`/trips/${tripId}/checkpoints`, {
      method: 'POST',
      body: JSON.stringify({ checkpointId }),
    });
  },

  async endTrip(tripId: number): Promise<TripResponse> {
    return api.request<TripResponse>(`/trips/${tripId}/end`, {
      method: 'POST',
    });
  },

  // ── Transport Alerts ────────────────────────────────────────────────────
  async sendAlert(
    routeId: number,
    severity: 'info' | 'warning' | 'critical',
    title: string,
    message: string
  ): Promise<TransportAlertResponse> {
    return api.request<TransportAlertResponse>('/transport/alerts', {
      method: 'POST',
      body: JSON.stringify({ routeId, severity, title, message }),
    });
  },
  
  // ── Student Assignments ───────────────────────────────────────────────────
  /** FIX (#12): assign a student to a route/checkpoint — POST /api/transport/assignments. */
  async assignStudent(request: AssignStudentTransportRequest): Promise<StudentTransportAssignmentResponse> {
    return api.request<StudentTransportAssignmentResponse>('/transport/assignments', {
      method: 'POST',
      body: JSON.stringify({
        studentId: request.studentId,
        routeId: request.routeId,
        checkpointId: request.checkpointId ?? null,
        direction: request.direction,
      }),
    });
  },
};