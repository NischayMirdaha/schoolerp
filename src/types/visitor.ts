export interface CreateVisitorLogRequest {
  visitorName: string;
  phone?: string | null;
  address?: string | null;
  purpose?: string | null;
  personToMeetId?: number | null;
  inTime?: string | null;
}

export interface GroupVisitorItemRequest {
  visitorName: string;
  phone?: string | null;
  address?: string | null;
}

export interface CreateGroupVisitorLogRequest {
  visitors: GroupVisitorItemRequest[];
  purpose?: string | null;
  personToMeetId?: number | null;
  inTime?: string | null;
}

export interface UpdateVisitorLogRequest {
  visitorName: string;
  phone?: string | null;
  address?: string | null;
  purpose?: string | null;
  personToMeetId?: number | null;
  inTime?: string | null;
}

export interface VisitorLogResponse {
  id: number;
  groupId: string;
  visitorName: string;
  phone?: string | null;
  address?: string | null;
  purpose?: string | null;
  personToMeetId?: number | null;
  personToMeetName?: string | null;
  inTime: string;
  outTime?: string | null;
  recordedBy?: number | null;
  createdAt: string;
}

export interface GroupVisitorLogResponse {
  groupId: string;
  visitorCount: number;
  visitors: VisitorLogResponse[];
}