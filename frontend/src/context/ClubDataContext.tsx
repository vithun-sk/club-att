import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Member, EventItem, CheckIn, IntegrityLog, Achievement } from '../types';
import {
  INITIAL_CHECKINS,
  INITIAL_INTEGRITY_LOGS,
  INITIAL_ACHIEVEMENTS,
} from '../mockData';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import {
  fetchEvents,
  createEventApi,
  updateEventApi,
  deleteEventApi,
  fetchMembers,
  createMemberApi,
  updateMemberStatusApi,
} from '../api/client';

interface ClubDataContextType {
  members: Member[];
  events: EventItem[];
  checkIns: CheckIn[];
  integrityLogs: IntegrityLog[];
  achievements: Achievement[];
  isLoadingEvents: boolean;
  isLoadingMembers: boolean;
  eventError: string | null;
  memberError: string | null;
  refreshEvents: () => Promise<void>;
  refreshMembers: () => Promise<void>;
  addEvent: (eventData: Omit<EventItem, 'id' | 'actualAttendance'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<EventItem>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addMember: (memberData: {
    name: string;
    email: string;
    studentId?: string;
    department?: string;
    year?: string;
    status?: 'active' | 'at-risk' | 'inactive';
  }) => Promise<void>;
  updateMemberStatus: (id: string, status: 'active' | 'at-risk' | 'inactive') => Promise<void>;
  toggleRSVP: (eventId: string) => void;
  simulateCheckIn: (eventId: string, memberId: string) => boolean;
  resolveAnomaly: (id: string, newStatus: 'resolved' | 'dismissed') => void;
  exportMembersCSV: () => void;
  exportEventsCSV: () => void;
  exportIntegrityCSV: () => void;
}

const ClubDataContext = createContext<ClubDataContextType | undefined>(undefined);

export const ClubDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { token, role, isAuthenticated } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>(INITIAL_CHECKINS);
  const [integrityLogs, setIntegrityLogs] = useState<IntegrityLog[]>(INITIAL_INTEGRITY_LOGS);
  const [achievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);

  // Fetch real events from backend
  const refreshEvents = useCallback(async () => {
    if (!token) return;
    setIsLoadingEvents(true);
    setEventError(null);
    try {
      const backendEvents = await fetchEvents(token);
      setEvents(backendEvents);
    } catch (err: any) {
      const msg = err?.message || 'Failed to load events';
      setEventError(msg);
      showToast('Error', msg, 'error');
    } finally {
      setIsLoadingEvents(false);
    }
  }, [token, showToast]);

  // Fetch real members from backend (Admin only)
  const refreshMembers = useCallback(async () => {
    if (!token || role !== 'admin') {
      setIsLoadingMembers(false);
      return;
    }
    setIsLoadingMembers(true);
    setMemberError(null);
    try {
      const backendMembers = await fetchMembers(token);
      setMembers(backendMembers);
    } catch (err: any) {
      const msg = err?.message || 'Failed to load members';
      setMemberError(msg);
      showToast('Error', msg, 'error');
    } finally {
      setIsLoadingMembers(false);
    }
  }, [token, role, showToast]);

  // Initial load when user authenticates
  useEffect(() => {
    if (isAuthenticated && token) {
      refreshEvents();
      if (role === 'admin') {
        refreshMembers();
      }
    } else {
      setEvents([]);
      setMembers([]);
    }
  }, [isAuthenticated, token, role, refreshEvents, refreshMembers]);

  // Add event -> POST /events
  const addEvent = async (eventData: Omit<EventItem, 'id' | 'actualAttendance'>) => {
    if (!token) {
      showToast('Auth Error', 'You must be logged in to create events.', 'error');
      return;
    }

    try {
      const created = await createEventApi(eventData, token);
      setEvents((prev) => [created, ...prev.filter((e) => e.id !== created.id)]);
      showToast('Event Created', `"${created.title}" has been successfully scheduled.`, 'success');
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to create event', 'error');
      throw err;
    }
  };

  // Update event -> PATCH /events/:id
  const updateEvent = async (id: string, updates: Partial<EventItem>) => {
    if (!token) {
      showToast('Auth Error', 'You must be logged in to update events.', 'error');
      return;
    }

    try {
      const updated = await updateEventApi(id, updates, token);
      setEvents((prev) => prev.map((ev) => (ev.id === id ? updated : ev)));
      showToast('Event Updated', `"${updated.title}" details were successfully saved.`, 'info');
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to update event', 'error');
      throw err;
    }
  };

  // Delete event -> DELETE /events/:id
  const deleteEvent = async (id: string) => {
    if (!token) {
      showToast('Auth Error', 'You must be logged in to delete events.', 'error');
      return;
    }

    try {
      await deleteEventApi(id, token);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      showToast('Event Deleted', 'Event was successfully removed.', 'info');
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to delete event', 'error');
      throw err;
    }
  };

  // Add member -> POST /users
  const addMember = async (memberData: {
    name: string;
    email: string;
    studentId?: string;
    department?: string;
    year?: string;
    status?: 'active' | 'at-risk' | 'inactive';
  }) => {
    if (!token) {
      showToast('Auth Error', 'You must be logged in as admin to add members.', 'error');
      return;
    }

    try {
      const created = await createMemberApi(memberData, token);
      setMembers((prev) => [created, ...prev.filter((m) => m.id !== created.id)]);
      showToast('Member Added', `${created.name} (${created.studentId}) registered to club roster.`, 'success');
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to add member', 'error');
      throw err;
    }
  };

  // Update member status -> PATCH /users/:id/status
  const updateMemberStatus = async (id: string, status: 'active' | 'at-risk' | 'inactive') => {
    if (!token) {
      showToast('Auth Error', 'You must be logged in as admin to modify members.', 'error');
      return;
    }

    try {
      const updated = await updateMemberStatusApi(id, status, token);
      setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
      showToast('Status Updated', `Member status changed to ${status}.`, 'info');
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to update member status', 'error');
      throw err;
    }
  };

  const toggleRSVP = (eventId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const nextRsvpd = !ev.userRsvpd;
          const nextCount = nextRsvpd ? ev.rsvpCount + 1 : Math.max(0, ev.rsvpCount - 1);
          showToast(
            nextRsvpd ? 'RSVP Confirmed!' : 'RSVP Cancelled',
            nextRsvpd ? `You are registered for "${ev.title}".` : `Registration withdrawn.`,
            nextRsvpd ? 'success' : 'info',
          );
          return { ...ev, userRsvpd: nextRsvpd, rsvpCount: nextCount };
        }
        return ev;
      }),
    );
  };

  const simulateCheckIn = (eventId: string, memberId: string): boolean => {
    const targetEvent = events.find((e) => e.id === eventId);
    const targetMember = members.find((m) => m.id === memberId);

    if (!targetEvent || !targetMember) return false;

    const alreadyIn = checkIns.some((c) => c.eventId === eventId && c.memberId === memberId);
    if (alreadyIn) {
      showToast('Duplicate Scan Detected', `${targetMember.name} has already checked in!`, 'warning');
      return false;
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newCheckIn: CheckIn = {
      id: `chk-${Date.now().toString(36)}`,
      eventId,
      eventName: targetEvent.title,
      memberId: targetMember.id,
      memberName: targetMember.name,
      studentId: targetMember.studentId,
      department: targetMember.department,
      timestamp: timeStr,
      method: 'dynamic_qr',
      status: 'verified',
      tokenHash: `qr_tok_${Math.random().toString(36).substring(2, 10)}_seq${checkIns.length + 1}`,
    };

    setCheckIns((prev) => [newCheckIn, ...prev]);
    showToast('Check-In Verified!', `${targetMember.name} attendance confirmed`, 'success');
    return true;
  };

  const resolveAnomaly = (id: string, newStatus: 'resolved' | 'dismissed') => {
    setIntegrityLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, status: newStatus } : log)),
    );
    showToast('Anomaly Record Updated', `Log ${id} marked as ${newStatus}.`, 'info');
  };

  // CSV download helper
  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Completed', `Downloaded "${filename}".`, 'success');
  };

  const exportMembersCSV = () => {
    const headers = [
      'Student ID',
      'Full Name',
      'Email',
      'Department',
      'Year',
      'Attendance Rate (%)',
      'Attended Events',
      'Streak',
      'Risk Level',
      'Status',
      'Points',
    ];
    const rows = members.map((m) => [
      m.studentId,
      `"${m.name}"`,
      m.email,
      `"${m.department}"`,
      `"${m.year}"`,
      `${m.attendanceRate}%`,
      m.attendedEvents,
      m.currentStreak,
      m.riskLevel.toUpperCase(),
      m.status.toUpperCase(),
      m.points,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`ClubPulse_Members_Roster_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const exportEventsCSV = () => {
    const headers = [
      'Event ID',
      'Title',
      'Category',
      'Date',
      'Time',
      'Location',
      'Status',
      'Capacity',
      'RSVPs',
      'Attended',
      'Attendance Rate (%)',
    ];
    const rows = events.map((e) => [
      e.id,
      `"${e.title}"`,
      e.category,
      e.date,
      `"${e.time}"`,
      `"${e.location}"`,
      e.status.toUpperCase(),
      e.capacity,
      e.rsvpCount,
      e.actualAttendance,
      e.capacity > 0 ? `${Math.round((e.actualAttendance / e.capacity) * 100)}%` : '0%',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`ClubPulse_Events_Summary_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const exportIntegrityCSV = () => {
    const headers = [
      'Log ID',
      'Timestamp',
      'Anomaly Type',
      'Severity',
      'Student ID',
      'Student Name',
      'Event',
      'Action Taken',
      'Status',
    ];
    const rows = integrityLogs.map((i) => [
      i.id,
      i.timestamp,
      i.type.toUpperCase(),
      i.severity.toUpperCase(),
      i.studentId,
      `"${i.memberName}"`,
      `"${i.eventName}"`,
      `"${i.actionTaken}"`,
      i.status.toUpperCase(),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`ClubPulse_Integrity_Audit_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <ClubDataContext.Provider
      value={{
        members,
        events,
        checkIns,
        integrityLogs,
        achievements,
        isLoadingEvents,
        isLoadingMembers,
        eventError,
        memberError,
        refreshEvents,
        refreshMembers,
        addEvent,
        updateEvent,
        deleteEvent,
        addMember,
        updateMemberStatus,
        toggleRSVP,
        simulateCheckIn,
        resolveAnomaly,
        exportMembersCSV,
        exportEventsCSV,
        exportIntegrityCSV,
      }}
    >
      {children}
    </ClubDataContext.Provider>
  );
};

export const useClubData = (): ClubDataContextType => {
  const context = useContext(ClubDataContext);
  if (!context) {
    throw new Error('useClubData must be used within a ClubDataProvider');
  }
  return context;
};
