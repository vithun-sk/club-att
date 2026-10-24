import type { IntegrityLog } from '../types';

export const INITIAL_INTEGRITY_LOGS: IntegrityLog[] = [
  {
    id: 'int-001',
    timestamp: '2026-10-24 17:42:18',
    type: 'duplicate_scan',
    severity: 'high',
    memberId: 'mem-3',
    memberName: 'Rohan Verma',
    studentId: 'CS2024-089',
    eventId: 'ev-1',
    eventName: 'Full-Stack Next.js 15 & Server Actions Workshop',
    description: 'Concurrent check-in attempt detected using same QR cryptographic token from 2 distinct IP addresses within 1.4 seconds.',
    evidenceDetails: 'IP 1: 192.168.1.104 (Campus Wi-Fi AP-East), IP 2: 152.58.12.9 (Cellular Gateway - Off Campus)',
    actionTaken: 'Blocked',
    status: 'under_review'
  },
  {
    id: 'int-002',
    timestamp: '2026-10-24 17:38:05',
    type: 'expired_token',
    severity: 'medium',
    memberId: 'mem-7',
    memberName: 'Tarun Deshmukh',
    studentId: 'ME2023-077',
    eventId: 'ev-1',
    eventName: 'Full-Stack Next.js 15 & Server Actions Workshop',
    description: 'Scanned QR token timestamp expired 42 seconds ago (validity window: 10 seconds). Likely forwarded photo or screenshot.',
    evidenceDetails: 'Token issued at 17:37:10, submitted at 17:38:05. Token signature invalid for epoch window.',
    actionTaken: 'Auto-invalidated',
    status: 'flagged for Review' as any
  },
  {
    id: 'int-003',
    timestamp: '2026-10-14 09:14:22',
    type: 'geo_mismatch',
    severity: 'high',
    memberId: 'mem-11',
    memberName: 'Nikhil Joseph',
    studentId: 'DS2025-019',
    eventId: 'ev-2',
    eventName: 'Generative AI & LLM Systems Sprint',
    description: 'Geo-fence verification failed: Reported client location is 4.2 km outside campus venue boundary during check-in.',
    evidenceDetails: 'Device GPS: (12.9812, 77.5944), Venue Geofence: (12.9345, 77.6101, radius 150m)',
    actionTaken: 'Blocked',
    status: 'resolved'
  },
  {
    id: 'int-004',
    timestamp: '2026-10-14 09:21:49',
    type: 'rapid_burst',
    severity: 'medium',
    memberId: 'mem-3',
    memberName: 'Rohan Verma',
    studentId: 'CS2024-089',
    eventId: 'ev-2',
    eventName: 'Generative AI & LLM Systems Sprint',
    description: 'Rapid scan burst: 5 failed token submissions submitted within 8 seconds from single mobile client.',
    evidenceDetails: 'User agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X), Rate limit threshold exceeded.',
    actionTaken: 'Flagged for Review',
    status: 'resolved'
  },
  {
    id: 'int-005',
    timestamp: '2026-10-05 18:04:11',
    type: 'expired_token',
    severity: 'low',
    memberId: 'mem-5',
    memberName: 'Vikram Sengupta',
    studentId: 'DS2024-061',
    eventId: 'ev-3',
    eventName: 'Cloud Native Microservices with Docker & K8s',
    description: 'Scanned 1.5s after rotation interval transition during network jitter.',
    evidenceDetails: 'Latency compensation applied on second scan; student subsequently verified normally.',
    actionTaken: 'Auto-invalidated',
    status: 'dismissed'
  }
];
