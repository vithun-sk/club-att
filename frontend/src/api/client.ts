import type { EventItem, Member } from '../types';

export const API_BASE_URL = 'http://localhost:3000';

export interface ScanAttendanceSuccessResponse {
  message: string;
  attendance: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
    event: {
      id: number;
      name?: string;
      date?: string;
    };
    createdAt?: string;
  };
}

export interface GenerateQrResponse {
  token: string;
}

export type ScanErrorCode =
  | 'DUPLICATE_ATTENDANCE'
  | 'EXPIRED_TOKEN'
  | 'INVALID_TOKEN'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'UNKNOWN';

export class AttendanceApiError extends Error {
  code: ScanErrorCode;
  statusCode: number;

  constructor(message: string, code: ScanErrorCode, statusCode: number = 400) {
    super(message);
    this.name = 'AttendanceApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function classifyAttendanceError(
  rawMessage: string,
  statusCode: number = 400,
): { code: ScanErrorCode; displayMessage: string } {
  const msg = (rawMessage || '').toLowerCase();

  if (statusCode === 403 || msg.includes('forbidden')) {
    return {
      code: 'FORBIDDEN',
      displayMessage: 'Forbidden: You do not have administrator permissions for this action.',
    };
  }

  if (statusCode === 404 || msg.includes('not found')) {
    return {
      code: 'NOT_FOUND',
      displayMessage: rawMessage || 'Requested resource not found.',
    };
  }

  if (msg.includes('already marked attendance') || msg.includes('duplicate')) {
    return {
      code: 'DUPLICATE_ATTENDANCE',
      displayMessage: 'Duplicate Attendance: You have already marked attendance for this event.',
    };
  }

  if (msg.includes('jwt expired') || msg.includes('expired')) {
    return {
      code: 'EXPIRED_TOKEN',
      displayMessage: 'Expired Token: This QR code has expired. Please ask for the active QR code.',
    };
  }

  if (
    msg.includes('jwt malformed') ||
    msg.includes('invalid') ||
    msg.includes('signature') ||
    msg.includes('token is required')
  ) {
    return {
      code: 'INVALID_TOKEN',
      displayMessage: 'Invalid QR Code: The scanned token is malformed, unrecognized, or tampered with.',
    };
  }

  if (statusCode === 401 || msg.includes('unauthorized')) {
    return {
      code: 'UNAUTHORIZED',
      displayMessage: 'Unauthorized: Please log in again to proceed.',
    };
  }

  return {
    code: 'UNKNOWN',
    displayMessage: rawMessage || 'An unexpected error occurred.',
  };
}

/* =========================================================================
   Event Management APIs
   ========================================================================= */

export async function fetchEvents(authToken: string): Promise<EventItem[]> {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json().catch(() => []);
  if (!response.ok) {
    const rawMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || `HTTP ${response.status}`);
    const { displayMessage, code } = classifyAttendanceError(rawMsg, response.status);
    throw new AttendanceApiError(displayMessage, code, response.status);
  }

  return (data as any[]).map((e) => ({
    id: String(e.id),
    title: e.title || e.name,
    category: e.category || 'Workshop',
    date: e.date,
    time: e.time || '17:00 - 19:00',
    location: e.location || 'Innovation Lab Hall B',
    status: e.status || 'upcoming',
    description: e.description || '',
    capacity: Number(e.capacity ?? 80),
    rsvpCount: Number(e.rsvpCount ?? 0),
    actualAttendance: Number(e.actualAttendance ?? 0),
    pointsAwarded: Number(e.pointsAwarded ?? 50),
    qrRefreshInterval: Number(e.qrRefreshInterval ?? 10),
  }));
}

export async function fetchEventById(id: string | number, authToken: string): Promise<EventItem> {
  const numericId = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, ''), 10) || 1;
  const response = await fetch(`${API_BASE_URL}/events/${numericId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const rawMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || `HTTP ${response.status}`);
    const { displayMessage, code } = classifyAttendanceError(rawMsg, response.status);
    throw new AttendanceApiError(displayMessage, code, response.status);
  }

  return {
    id: String(data.id),
    title: data.title || data.name,
    category: data.category || 'Workshop',
    date: data.date,
    time: data.time || '17:00 - 19:00',
    location: data.location || 'Innovation Lab Hall B',
    status: data.status || 'upcoming',
    description: data.description || '',
    capacity: Number(data.capacity ?? 80),
    rsvpCount: Number(data.rsvpCount ?? 0),
    actualAttendance: Number(data.actualAttendance ?? 0),
    pointsAwarded: Number(data.pointsAwarded ?? 50),
    qrRefreshInterval: Number(data.qrRefreshInterval ?? 10),
  };
}

export async function createEventApi(
  eventData: Omit<EventItem, 'id' | 'actualAttendance'>,
  authToken: string,
): Promise<EventItem> {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      title: eventData.title,
      name: eventData.title,
      category: eventData.category,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      status: eventData.status,
      description: eventData.description,
      capacity: Number(eventData.capacity),
      pointsAwarded: Number(eventData.pointsAwarded),
      qrRefreshInterval: Number(eventData.qrRefreshInterval),
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const rawMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || `HTTP ${response.status}`);
    const { displayMessage, code } = classifyAttendanceError(rawMsg, response.status);
    throw new AttendanceApiError(displayMessage, code, response.status);
  }

  return {
    id: String(data.id),
    title: data.title || data.name,
    category: data.category || 'Workshop',
    date: data.date,
    time: data.time || '17:00 - 19:00',
    location: data.location || 'Innovation Lab Hall B',
    status: data.status || 'upcoming',
    description: data.description || '',
    capacity: Number(data.capacity ?? 80),
    rsvpCount: 0,
    actualAttendance: Number(data.actualAttendance ?? 0),
    pointsAwarded: Number(data.pointsAwarded ?? 50),
    qrRefreshInterval: Number(data.qrRefreshInterval ?? 10),
  };
}

export async function updateEventApi(
  id: string | number,
  updates: Partial<EventItem>,
  authToken: string,
): Promise<EventItem> {
  const numericId = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, ''), 10) || 1;
  const payload: any = { ...updates };
  if (updates.title) {
    payload.name = updates.title;
  }

  const response = await fetch(`${API_BASE_URL}/events/${numericId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const rawMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || `HTTP ${response.status}`);
    const { displayMessage, code } = classifyAttendanceError(rawMsg, response.status);
    throw new AttendanceApiError(displayMessage, code, response.status);
  }

  return {
    id: String(data.id),
    title: data.title || data.name,
    category: data.category || 'Workshop',
    date: data.date,
    time: data.time || '17:00 - 19:00',
    location: data.location || 'Innovation Lab Hall B',
    status: data.status || 'upcoming',
    description: data.description || '',
    capacity: Number(data.capacity ?? 80),
    rsvpCount: Number(data.rsvpCount ?? 0),
    actualAttendance: Number(data.actualAttendance ?? 0),
    pointsAwarded: Number(data.pointsAwarded ?? 50),
    qrRefreshInterval: Number(data.qrRefreshInterval ?? 10),
  };
}

export async function deleteEventApi(
  id: string | number,
  authToken: string,
): Promise<{ message: string; id: number }> {
  const numericId = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, ''), 10) || 1;
  const response = await fetch(`${API_BASE_URL}/events/${numericId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const rawMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || `HTTP ${response.status}`);
    const { displayMessage, code } = classifyAttendanceError(rawMsg, response.status);
    throw new AttendanceApiError(displayMessage, code, response.status);
  }

  return data;
}

/* =========================================================================
   Member Management APIs
   ========================================================================= */

export async function fetchMembers(authToken: string): Promise<Member[]> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json().catch(() => []);
  if (!response.ok) {
    const rawMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || `HTTP ${response.status}`);
    const { displayMessage, code } = classifyAttendanceError(rawMsg, response.status);
    throw new AttendanceApiError(displayMessage, code, response.status);
  }

  return (data as any[]).map((m) => ({
    id: String(m.id),
    studentId: m.studentId || `CP-${m.id}`,
    name: m.name || 'Member',
    email: m.email,
    avatar: m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    department: m.department || 'Computer Science',
    year: m.year || 'Sophomore (2nd Year)',
    joinedDate: m.joinedDate || '2026-09-01',
    totalEvents: Number(m.totalEvents ?? 0),
    attendedEvents: Number(m.attendedEvents ?? 0),
    attendanceRate: Number(m.attendanceRate ?? 0),
    currentStreak: Number(m.currentStreak ?? 0),
    riskLevel: m.riskLevel || 'low',
    riskFactors: m.riskFactors || [],
    status: m.status || 'active',
    points: Number(m.points ?? 50),
    lastCheckIn: m.lastCheckIn || 'Never',
    attendanceHistory: m.attendanceHistory || [],
  }));
}

export async function createMemberApi(
  memberData: { name: string; email: string; studentId?: string; department?: string; year?: string },
  authToken: string,
): Promise<Member> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(memberData),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const rawMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || `HTTP ${response.status}`);
    const { displayMessage, code } = classifyAttendanceError(rawMsg, response.status);
    throw new AttendanceApiError(displayMessage, code, response.status);
  }

  return {
    id: String(data.id),
    studentId: data.studentId || `CP-${data.id}`,
    name: data.name,
    email: data.email,
    avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    department: data.department || 'Computer Science',
    year: data.year || 'Sophomore (2nd Year)',
    joinedDate: data.joinedDate || '2026-09-01',
    totalEvents: Number(data.totalEvents ?? 0),
    attendedEvents: Number(data.attendedEvents ?? 0),
    attendanceRate: Number(data.attendanceRate ?? 0),
    currentStreak: Number(data.currentStreak ?? 0),
    riskLevel: data.riskLevel || 'low',
    riskFactors: data.riskFactors || [],
    status: data.status || 'active',
    points: Number(data.points ?? 50),
    lastCheckIn: data.lastCheckIn || 'Never',
    attendanceHistory: data.attendanceHistory || [],
  };
}

export async function updateMemberStatusApi(
  id: string | number,
  status: 'active' | 'at-risk' | 'inactive',
  authToken: string,
): Promise<Member> {
  const numericId = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, ''), 10) || 1;
  const response = await fetch(`${API_BASE_URL}/users/${numericId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const rawMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || `HTTP ${response.status}`);
    const { displayMessage, code } = classifyAttendanceError(rawMsg, response.status);
    throw new AttendanceApiError(displayMessage, code, response.status);
  }

  return {
    id: String(data.id),
    studentId: data.studentId || `CP-${data.id}`,
    name: data.name,
    email: data.email,
    avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    department: data.department || 'Computer Science',
    year: data.year || 'Sophomore (2nd Year)',
    joinedDate: data.joinedDate || '2026-09-01',
    totalEvents: Number(data.totalEvents ?? 0),
    attendedEvents: Number(data.attendedEvents ?? 0),
    attendanceRate: Number(data.attendanceRate ?? 0),
    currentStreak: Number(data.currentStreak ?? 0),
    riskLevel: data.riskLevel || 'low',
    riskFactors: data.riskFactors || [],
    status: data.status || 'active',
    points: Number(data.points ?? 50),
    lastCheckIn: data.lastCheckIn || 'Never',
    attendanceHistory: data.attendanceHistory || [],
  };
}

/* =========================================================================
   Attendance & QR APIs
   ========================================================================= */

export async function generateQrToken(eventId: number | string, authToken: string): Promise<GenerateQrResponse> {
  const numericId = typeof eventId === 'number' ? eventId : parseInt(String(eventId).replace(/\D/g, ''), 10) || 1;
  const response = await fetch(`${API_BASE_URL}/attendance/qr/${numericId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const rawMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || `HTTP ${response.status}`);
    const { displayMessage, code } = classifyAttendanceError(rawMsg, response.status);
    throw new AttendanceApiError(displayMessage, code, response.status);
  }

  return data as GenerateQrResponse;
}

export async function scanAttendance(token: string, authToken: string): Promise<ScanAttendanceSuccessResponse> {
  const trimmed = (token || '').trim();
  if (!trimmed) {
    throw new AttendanceApiError('Token cannot be empty.', 'INVALID_TOKEN', 400);
  }

  const response = await fetch(`${API_BASE_URL}/attendance/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ token: trimmed }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const rawMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || `HTTP ${response.status}`);
    const { displayMessage, code } = classifyAttendanceError(rawMsg, response.status);
    throw new AttendanceApiError(displayMessage, code, response.status);
  }

  return data as ScanAttendanceSuccessResponse;
}

export async function getBackendEvents(authToken: string) {
  return fetchEvents(authToken);
}
