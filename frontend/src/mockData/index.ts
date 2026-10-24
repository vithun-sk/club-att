import type { UserProfile } from '../types';
import { INITIAL_MEMBERS } from './members';
import { INITIAL_EVENTS } from './events';
import { INITIAL_CHECKINS } from './checkIns';
import { INITIAL_INTEGRITY_LOGS } from './integrity';
import { INITIAL_ACHIEVEMENTS } from './achievements';

export const DEMO_ADMIN_USER: UserProfile = {
  id: 'usr-admin-1',
  name: 'Alex Chen',
  email: 'alex.chen@clubpulse.edu',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  clubName: 'Google Developer Student Club (GDSC)',
  department: 'Computer Science & Eng',
  tier: 'Club President & Lead Organizer'
};

export const DEMO_STUDENT_USER: UserProfile = {
  id: 'usr-student-1',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@campus.edu',
  role: 'user',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
  clubName: 'Google Developer Student Club (GDSC)',
  studentId: 'CS2023-042',
  department: 'Computer Science',
  year: 'Junior (3rd Year)',
  points: 850,
  streak: 6,
  tier: 'Gold Tier Member (Top 5%)'
};

export {
  INITIAL_MEMBERS,
  INITIAL_EVENTS,
  INITIAL_CHECKINS,
  INITIAL_INTEGRITY_LOGS,
  INITIAL_ACHIEVEMENTS
};
