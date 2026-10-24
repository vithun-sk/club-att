import type { Achievement } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'First Step Pulse',
    description: 'Attended your first club event and verified attendance.',
    category: 'attendance',
    badgeIcon: 'Zap',
    unlocked: true,
    unlockedAt: '2025-08-15',
    progress: 1,
    maxProgress: 1,
    points: 50
  },
  {
    id: 'ach-2',
    title: 'Streak Master (5 Weeks)',
    description: 'Maintained an unbroken 5-event attendance streak.',
    category: 'streak',
    badgeIcon: 'Flame',
    unlocked: true,
    unlockedAt: '2026-10-14',
    progress: 6,
    maxProgress: 5,
    points: 150
  },
  {
    id: 'ach-3',
    title: 'Hackathon Warrior',
    description: 'Participated and checked in for an all-day hackathon or sprint.',
    category: 'attendance',
    badgeIcon: 'Award',
    unlocked: true,
    unlockedAt: '2026-10-14',
    progress: 1,
    maxProgress: 1,
    points: 100
  },
  {
    id: 'ach-4',
    title: 'Early Bird Check-In',
    description: 'Check in within the first 5 minutes of QR activation at 3 events.',
    category: 'attendance',
    badgeIcon: 'Sparkles',
    unlocked: true,
    unlockedAt: '2026-10-22',
    progress: 3,
    maxProgress: 3,
    points: 75
  },
  {
    id: 'ach-5',
    title: 'Ironclad Century (10 Events)',
    description: 'Attend 10 total workshops, talks, or club events.',
    category: 'attendance',
    badgeIcon: 'CheckCircle2',
    unlocked: true,
    unlockedAt: '2026-09-24',
    progress: 17,
    maxProgress: 10,
    points: 200
  },
  {
    id: 'ach-6',
    title: 'Legendary Streak (10 Weeks)',
    description: 'Reach a phenomenal 10 consecutive event attendance streak.',
    category: 'streak',
    badgeIcon: 'Flame',
    unlocked: false,
    progress: 6,
    maxProgress: 10,
    points: 300
  },
  {
    id: 'ach-7',
    title: 'Polymath Builder',
    description: 'Attend at least one event in 4 different categories.',
    category: 'contribution',
    badgeIcon: 'Award',
    unlocked: false,
    progress: 3,
    maxProgress: 4,
    points: 120
  }
];
