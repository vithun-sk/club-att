import React, { createContext, useContext, useState } from 'react';
import type { Member, EventItem, CheckIn, IntegrityLog, Achievement } from '../types';
import {
  INITIAL_MEMBERS,
  INITIAL_EVENTS,
  INITIAL_CHECKINS,
  INITIAL_INTEGRITY_LOGS,
  INITIAL_ACHIEVEMENTS
} from '../mockData';
import { useToast } from './ToastContext';

interface ClubDataContextType {
  members: Member[];
  events: EventItem[];
  checkIns: CheckIn[];
  integrityLogs: IntegrityLog[];
  achievements: Achievement[];
  addEvent: (eventData: Omit<EventItem, 'id' | 'actualAttendance'>) => void;
  updateEvent: (id: string, updates: Partial<EventItem>) => void;
  addMember: (memberData: Omit<Member, 'id' | 'attendanceHistory' | 'totalEvents' | 'attendedEvents' | 'attendanceRate' | 'currentStreak' | 'points' | 'lastCheckIn'>) => void;
  updateMemberStatus: (id: string, status: 'active' | 'at-risk' | 'inactive') => void;
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
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [checkIns, setCheckIns] = useState<CheckIn[]>(INITIAL_CHECKINS);
  const [integrityLogs, setIntegrityLogs] = useState<IntegrityLog[]>(INITIAL_INTEGRITY_LOGS);
  const [achievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  const addEvent = (eventData: Omit<EventItem, 'id' | 'actualAttendance'>) => {
    const newEvent: EventItem = {
      ...eventData,
      id: `ev-${Date.now().toString(36)}`,
      actualAttendance: 0
    };
    setEvents((prev) => [newEvent, ...prev]);
    showToast('Event Created', `"${newEvent.title}" has been successfully scheduled.`, 'success');
  };

  const updateEvent = (id: string, updates: Partial<EventItem>) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...updates } : ev))
    );
    showToast('Event Updated', 'Event details were successfully saved.', 'info');
  };

  const addMember = (
    memberData: Omit<Member, 'id' | 'attendanceHistory' | 'totalEvents' | 'attendedEvents' | 'attendanceRate' | 'currentStreak' | 'points' | 'lastCheckIn'>
  ) => {
    const newMember: Member = {
      ...memberData,
      id: `mem-${Date.now().toString(36)}`,
      totalEvents: events.filter(e => e.status === 'completed' || e.status === 'live').length,
      attendedEvents: 0,
      attendanceRate: 0,
      currentStreak: 0,
      points: 50,
      lastCheckIn: 'Never',
      attendanceHistory: []
    };
    setMembers((prev) => [newMember, ...prev]);
    showToast('Member Added', `${newMember.name} (${newMember.studentId}) registered to club roster.`, 'success');
  };

  const updateMemberStatus = (id: string, status: 'active' | 'at-risk' | 'inactive') => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const riskLevel = status === 'at-risk' ? 'high' : status === 'inactive' ? 'high' : 'low';
          return { ...m, status, riskLevel };
        }
        return m;
      })
    );
    showToast('Status Updated', `Member status changed to ${status}.`, 'info');
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
            nextRsvpd ? 'success' : 'info'
          );
          return { ...ev, userRsvpd: nextRsvpd, rsvpCount: nextCount };
        }
        return ev;
      })
    );
  };

  const simulateCheckIn = (eventId: string, memberId: string): boolean => {
    const targetEvent = events.find((e) => e.id === eventId);
    const targetMember = members.find((m) => m.id === memberId);

    if (!targetEvent || !targetMember) return false;

    // Check if already checked in to this event
    const alreadyIn = checkIns.some(
      (c) => c.eventId === eventId && c.memberId === memberId
    );
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
      tokenHash: `qr_tok_${Math.random().toString(36).substring(2, 10)}_seq${checkIns.length + 1}`
    };

    setCheckIns((prev) => [newCheckIn, ...prev]);

    // Update event attendance count
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, actualAttendance: e.actualAttendance + 1 } : e
      )
    );

    // Update member points and streak
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const newAttended = m.attendedEvents + 1;
          const total = Math.max(m.totalEvents, newAttended);
          const newRate = Math.round((newAttended / total) * 100);
          return {
            ...m,
            attendedEvents: newAttended,
            attendanceRate: newRate,
            currentStreak: m.currentStreak + 1,
            points: m.points + targetEvent.pointsAwarded,
            lastCheckIn: `Today at ${timeStr}`,
            riskLevel: newRate >= 75 ? 'low' : newRate >= 60 ? 'medium' : 'high',
            status: newRate >= 60 ? 'active' : 'at-risk'
          };
        }
        return m;
      })
    );

    showToast('Check-In Verified!', `${targetMember.name} attendance confirmed (+${targetEvent.pointsAwarded} pts)`, 'success');
    return true;
  };

  const resolveAnomaly = (id: string, newStatus: 'resolved' | 'dismissed') => {
    setIntegrityLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, status: newStatus } : log))
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
    const headers = ['Student ID', 'Full Name', 'Email', 'Department', 'Year', 'Attendance Rate (%)', 'Attended Events', 'Streak', 'Risk Level', 'Status', 'Points'];
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
      m.points
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`ClubPulse_Members_Roster_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const exportEventsCSV = () => {
    const headers = ['Event ID', 'Title', 'Category', 'Date', 'Time', 'Location', 'Status', 'Capacity', 'RSVPs', 'Attended', 'Attendance Rate (%)'];
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
      e.capacity > 0 ? `${Math.round((e.actualAttendance / e.capacity) * 100)}%` : '0%'
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(`ClubPulse_Events_Summary_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const exportIntegrityCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Anomaly Type', 'Severity', 'Student ID', 'Student Name', 'Event', 'Action Taken', 'Status'];
    const rows = integrityLogs.map((i) => [
      i.id,
      i.timestamp,
      i.type.toUpperCase(),
      i.severity.toUpperCase(),
      i.studentId,
      `"${i.memberName}"`,
      `"${i.eventName}"`,
      `"${i.actionTaken}"`,
      i.status.toUpperCase()
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
        addEvent,
        updateEvent,
        addMember,
        updateMemberStatus,
        toggleRSVP,
        simulateCheckIn,
        resolveAnomaly,
        exportMembersCSV,
        exportEventsCSV,
        exportIntegrityCSV
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
