import type { Member } from '../types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    studentId: 'CS2023-042',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    department: 'Computer Science',
    year: 'Junior (3rd Year)',
    joinedDate: '2025-08-15',
    totalEvents: 18,
    attendedEvents: 17,
    attendanceRate: 94,
    currentStreak: 6,
    riskLevel: 'low',
    riskFactors: [],
    status: 'active',
    points: 850,
    lastCheckIn: '2026-10-22 17:35',
    attendanceHistory: [
      { eventId: 'ev-1', eventName: 'Full-Stack Next.js Intensive', date: '2026-10-22', category: 'Workshop', status: 'present', verifiedAt: '17:35:12', pointsEarned: 50 },
      { eventId: 'ev-2', eventName: 'AI & LLM Hackathon Sprint', date: '2026-10-14', category: 'Hackathon', status: 'present', verifiedAt: '09:12:44', pointsEarned: 100 },
      { eventId: 'ev-3', eventName: 'Cloud Native & Docker Demo', date: '2026-10-05', category: 'Tech Talk', status: 'present', verifiedAt: '18:02:19', pointsEarned: 50 },
      { eventId: 'ev-4', eventName: 'Git & GitHub Workflows', date: '2026-09-24', category: 'Workshop', status: 'present', verifiedAt: '16:55:04', pointsEarned: 50 }
    ]
  },
  {
    id: 'mem-2',
    studentId: 'CS2023-118',
    name: 'Diya Patel',
    email: 'diya.patel@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    department: 'Data Science',
    year: 'Junior (3rd Year)',
    joinedDate: '2025-08-20',
    totalEvents: 18,
    attendedEvents: 16,
    attendanceRate: 89,
    currentStreak: 4,
    riskLevel: 'low',
    riskFactors: [],
    status: 'active',
    points: 780,
    lastCheckIn: '2026-10-22 17:41',
    attendanceHistory: [
      { eventId: 'ev-1', eventName: 'Full-Stack Next.js Intensive', date: '2026-10-22', category: 'Workshop', status: 'present', verifiedAt: '17:41:09', pointsEarned: 50 },
      { eventId: 'ev-2', eventName: 'AI & LLM Hackathon Sprint', date: '2026-10-14', category: 'Hackathon', status: 'present', verifiedAt: '09:18:22', pointsEarned: 100 },
      { eventId: 'ev-3', eventName: 'Cloud Native & Docker Demo', date: '2026-10-05', category: 'Tech Talk', status: 'present', verifiedAt: '18:10:30', pointsEarned: 50 }
    ]
  },
  {
    id: 'mem-3',
    studentId: 'CS2024-089',
    name: 'Rohan Verma',
    email: 'rohan.v@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    department: 'Computer Science',
    year: 'Sophomore (2nd Year)',
    joinedDate: '2025-09-02',
    totalEvents: 18,
    attendedEvents: 9,
    attendanceRate: 50,
    currentStreak: 0,
    riskLevel: 'high',
    riskFactors: [
      'Missed 3 consecutive technical workshops',
      'Attendance fell below 65% minimum club threshold',
      'No RSVP responses in last 3 weeks'
    ],
    status: 'at-risk',
    points: 390,
    lastCheckIn: '2026-09-24 17:10',
    attendanceHistory: [
      { eventId: 'ev-1', eventName: 'Full-Stack Next.js Intensive', date: '2026-10-22', category: 'Workshop', status: 'absent' },
      { eventId: 'ev-2', eventName: 'AI & LLM Hackathon Sprint', date: '2026-10-14', category: 'Hackathon', status: 'absent' },
      { eventId: 'ev-3', eventName: 'Cloud Native & Docker Demo', date: '2026-10-05', category: 'Tech Talk', status: 'absent' },
      { eventId: 'ev-4', eventName: 'Git & GitHub Workflows', date: '2026-09-24', category: 'Workshop', status: 'present', verifiedAt: '17:10:02', pointsEarned: 50 }
    ]
  },
  {
    id: 'mem-4',
    studentId: 'AI2024-015',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
    department: 'Artificial Intelligence',
    year: 'Sophomore (2nd Year)',
    joinedDate: '2025-08-25',
    totalEvents: 18,
    attendedEvents: 15,
    attendanceRate: 83,
    currentStreak: 3,
    riskLevel: 'low',
    riskFactors: [],
    status: 'active',
    points: 710,
    lastCheckIn: '2026-10-22 17:39',
    attendanceHistory: [
      { eventId: 'ev-1', eventName: 'Full-Stack Next.js Intensive', date: '2026-10-22', category: 'Workshop', status: 'present', verifiedAt: '17:39:55', pointsEarned: 50 },
      { eventId: 'ev-2', eventName: 'AI & LLM Hackathon Sprint', date: '2026-10-14', category: 'Hackathon', status: 'present', verifiedAt: '09:05:18', pointsEarned: 100 },
      { eventId: 'ev-3', eventName: 'Cloud Native & Docker Demo', date: '2026-10-05', category: 'Tech Talk', status: 'excused' }
    ]
  },
  {
    id: 'mem-5',
    studentId: 'DS2024-061',
    name: 'Vikram Sengupta',
    email: 'vikram.s@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    department: 'Data Science',
    year: 'Sophomore (2nd Year)',
    joinedDate: '2025-09-10',
    totalEvents: 18,
    attendedEvents: 11,
    attendanceRate: 61,
    currentStreak: 1,
    riskLevel: 'medium',
    riskFactors: [
      'Attendance dropped 18% in the past 30 days',
      'Consecutive absences at mid-week sessions'
    ],
    status: 'at-risk',
    points: 480,
    lastCheckIn: '2026-10-22 17:48',
    attendanceHistory: [
      { eventId: 'ev-1', eventName: 'Full-Stack Next.js Intensive', date: '2026-10-22', category: 'Workshop', status: 'present', verifiedAt: '17:48:20', pointsEarned: 50 },
      { eventId: 'ev-2', eventName: 'AI & LLM Hackathon Sprint', date: '2026-10-14', category: 'Hackathon', status: 'absent' },
      { eventId: 'ev-3', eventName: 'Cloud Native & Docker Demo', date: '2026-10-05', category: 'Tech Talk', status: 'absent' }
    ]
  },
  {
    id: 'mem-6',
    studentId: 'CS2025-003',
    name: 'Kavya Nair',
    email: 'kavya.nair@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    department: 'Computer Science',
    year: 'Freshman (1st Year)',
    joinedDate: '2025-10-01',
    totalEvents: 18,
    attendedEvents: 18,
    attendanceRate: 100,
    currentStreak: 8,
    riskLevel: 'low',
    riskFactors: [],
    status: 'active',
    points: 920,
    lastCheckIn: '2026-10-22 17:31',
    attendanceHistory: [
      { eventId: 'ev-1', eventName: 'Full-Stack Next.js Intensive', date: '2026-10-22', category: 'Workshop', status: 'present', verifiedAt: '17:31:02', pointsEarned: 50 },
      { eventId: 'ev-2', eventName: 'AI & LLM Hackathon Sprint', date: '2026-10-14', category: 'Hackathon', status: 'present', verifiedAt: '08:58:33', pointsEarned: 100 }
    ]
  },
  {
    id: 'mem-7',
    studentId: 'ME2023-077',
    name: 'Tarun Deshmukh',
    email: 'tarun.d@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250',
    department: 'Mechanical Eng.',
    year: 'Junior (3rd Year)',
    joinedDate: '2025-08-12',
    totalEvents: 18,
    attendedEvents: 6,
    attendanceRate: 33,
    currentStreak: 0,
    riskLevel: 'high',
    riskFactors: [
      'Zero attendance recorded in last 45 days',
      'Multiple expired QR scan attempts logged'
    ],
    status: 'inactive',
    points: 210,
    lastCheckIn: '2026-08-30 18:20',
    attendanceHistory: [
      { eventId: 'ev-1', eventName: 'Full-Stack Next.js Intensive', date: '2026-10-22', category: 'Workshop', status: 'absent' },
      { eventId: 'ev-2', eventName: 'AI & LLM Hackathon Sprint', date: '2026-10-14', category: 'Hackathon', status: 'absent' }
    ]
  },
  {
    id: 'mem-8',
    studentId: 'CS2023-144',
    name: 'Sneha Kulkarni',
    email: 'sneha.k@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    department: 'Computer Science',
    year: 'Junior (3rd Year)',
    joinedDate: '2025-08-18',
    totalEvents: 18,
    attendedEvents: 14,
    attendanceRate: 78,
    currentStreak: 2,
    riskLevel: 'low',
    riskFactors: [],
    status: 'active',
    points: 660,
    lastCheckIn: '2026-10-22 17:44',
    attendanceHistory: [
      { eventId: 'ev-1', eventName: 'Full-Stack Next.js Intensive', date: '2026-10-22', category: 'Workshop', status: 'present', verifiedAt: '17:44:19', pointsEarned: 50 },
      { eventId: 'ev-2', eventName: 'AI & LLM Hackathon Sprint', date: '2026-10-14', category: 'Hackathon', status: 'present', verifiedAt: '09:25:01', pointsEarned: 100 }
    ]
  },
  {
    id: 'mem-9',
    studentId: 'IT2024-032',
    name: 'Aditya Rao',
    email: 'aditya.rao@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250',
    department: 'Information Tech',
    year: 'Sophomore (2nd Year)',
    joinedDate: '2025-09-15',
    totalEvents: 18,
    attendedEvents: 12,
    attendanceRate: 67,
    currentStreak: 2,
    riskLevel: 'medium',
    riskFactors: [
      'Marginal attendance (67% vs 65% cutoff)',
      'Unexcused absence on hands-on sessions'
    ],
    status: 'active',
    points: 540,
    lastCheckIn: '2026-10-22 17:52',
    attendanceHistory: [
      { eventId: 'ev-1', eventName: 'Full-Stack Next.js Intensive', date: '2026-10-22', category: 'Workshop', status: 'present', verifiedAt: '17:52:11', pointsEarned: 50 }
    ]
  },
  {
    id: 'mem-10',
    studentId: 'CS2024-201',
    name: 'Pooja Reddy',
    email: 'pooja.reddy@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?auto=format&fit=crop&q=80&w=250',
    department: 'Computer Science',
    year: 'Sophomore (2nd Year)',
    joinedDate: '2025-09-01',
    totalEvents: 18,
    attendedEvents: 16,
    attendanceRate: 89,
    currentStreak: 5,
    riskLevel: 'low',
    riskFactors: [],
    status: 'active',
    points: 790,
    lastCheckIn: '2026-10-22 17:33',
    attendanceHistory: [
      { eventId: 'ev-1', eventName: 'Full-Stack Next.js Intensive', date: '2026-10-22', category: 'Workshop', status: 'present', verifiedAt: '17:33:41', pointsEarned: 50 }
    ]
  },
  {
    id: 'mem-11',
    studentId: 'DS2025-019',
    name: 'Nikhil Joseph',
    email: 'nikhil.j@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
    department: 'Data Science',
    year: 'Freshman (1st Year)',
    joinedDate: '2025-10-05',
    totalEvents: 18,
    attendedEvents: 8,
    attendanceRate: 44,
    currentStreak: 0,
    riskLevel: 'high',
    riskFactors: [
      'Missed 4 events in the past 6 weeks',
      'Engagement dropped significantly after midterms'
    ],
    status: 'at-risk',
    points: 310,
    lastCheckIn: '2026-09-18 16:45',
    attendanceHistory: [
      { eventId: 'ev-1', eventName: 'Full-Stack Next.js Intensive', date: '2026-10-22', category: 'Workshop', status: 'absent' }
    ]
  },
  {
    id: 'mem-12',
    studentId: 'AI2023-098',
    name: 'Meera Chawla',
    email: 'meera.c@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    department: 'Artificial Intelligence',
    year: 'Junior (3rd Year)',
    joinedDate: '2025-08-10',
    totalEvents: 18,
    attendedEvents: 17,
    attendanceRate: 94,
    currentStreak: 7,
    riskLevel: 'low',
    riskFactors: [],
    status: 'active',
    points: 890,
    lastCheckIn: '2026-10-22 17:36',
    attendanceHistory: [
      { eventId: 'ev-1', eventName: 'Full-Stack Next.js Intensive', date: '2026-10-22', category: 'Workshop', status: 'present', verifiedAt: '17:36:15', pointsEarned: 50 }
    ]
  }
];
