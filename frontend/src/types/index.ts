export type Role = 'admin' | 'user';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  clubName: string;
  studentId?: string;
  department?: string;
  year?: string;
  points?: number;
  streak?: number;
  tier?: string;
}

export interface AttendanceRecord {
  eventId: string;
  eventName: string;
  date: string;
  category: string;
  status: 'present' | 'absent' | 'excused';
  verifiedAt?: string;
  pointsEarned?: number;
}

export interface Member {
  id: string;
  studentId: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  year: string;
  joinedDate: string;
  totalEvents: number;
  attendedEvents: number;
  attendanceRate: number;
  currentStreak: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  status: 'active' | 'at-risk' | 'inactive';
  points: number;
  lastCheckIn: string;
  attendanceHistory: AttendanceRecord[];
}

export type EventCategory = 'Workshop' | 'Tech Talk' | 'Hackathon' | 'General Body' | 'Social';

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  description: string;
  capacity: number;
  rsvpCount: number;
  actualAttendance: number;
  pointsAwarded: number;
  qrRefreshInterval: number; // in seconds
  userRsvpd?: boolean;
}

export interface CheckIn {
  id: string;
  eventId: string;
  eventName: string;
  memberId: string;
  memberName: string;
  studentId: string;
  department: string;
  timestamp: string;
  method: 'dynamic_qr' | 'manual_override' | 'nfc_pass';
  status: 'verified' | 'flagged' | 'rejected';
  tokenHash: string;
}

export interface IntegrityLog {
  id: string;
  timestamp: string;
  type: 'duplicate_scan' | 'expired_token' | 'geo_mismatch' | 'rapid_burst';
  severity: 'high' | 'medium' | 'low';
  memberId: string;
  memberName: string;
  studentId: string;
  eventId: string;
  eventName: string;
  description: string;
  actionTaken: 'Blocked' | 'Flagged for Review' | 'Auto-invalidated';
  status: 'under_review' | 'resolved' | 'dismissed';
  evidenceDetails?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'attendance' | 'streak' | 'contribution';
  badgeIcon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  points: number;
}

export type AdminTab = 
  | 'dashboard'
  | 'members'
  | 'events'
  | 'qr-live'
  | 'analytics'
  | 'integrity'
  | 'reports';

export type UserTab = 
  | 'user-dashboard'
  | 'user-events'
  | 'user-badges'
  | 'user-pass';

export type ActivePage = 
  | 'landing'
  | 'login'
  | 'register'
  | AdminTab
  | UserTab;
