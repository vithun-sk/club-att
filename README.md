# ClubPulse — Smart Club Attendance Management System

ClubPulse is a full-stack web application designed to simplify student club management, event organization, attendance tracking, and member engagement. It provides separate experiences for administrators and members, with QR-based attendance verification and a centralized dashboard.

## Features

### Authentication and Authorization
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Role-based access for administrators and regular members.

### Event Management
- Create, view, update, and manage club events.
- Store event details such as title, date, time, location, category, and capacity.
- Track event attendance separately from event registration.

### QR-Based Attendance
- Generate QR codes for event check-ins.
- Use short-lived JWT tokens for attendance verification.
- Record attendance against the authenticated member and event.
- Prevent duplicate attendance records for the same member and event.

### Member Dashboard
- View membership information and attendance history.
- Display attendance statistics and participation information.
- View membership QR codes and available profile details.

### Badges, Streaks, and Rewards
- Display points and attendance streaks.
- Show badges and member rankings.
- Provide a foundation for encouraging consistent participation through gamification.

*The accuracy of streaks, badge unlocks, points, and leaderboard data depends on their backend integration and calculation.*

### Integrity and Anti-Proxy Monitoring
- Provide an interface for reviewing attendance-related security incidents.
- Filter incidents by type and inspect their details.
- Resolve or dismiss incidents from the interface.
- Export audit information as CSV.

*Live incident collection and persistent incident resolution must be connected to backend security logging before these features can be considered fully operational.*

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| UI and Icons | Custom CSS, Lucide React |
| QR Scanning | html5-qrcode |
| QR Generation | qrcode |
| Backend | Node.js, NestJS, TypeScript |
| Database | SQLite |
| ORM | TypeORM |
| Authentication | JWT, Passport, bcrypt |
| Validation | class-validator, class-transformer |

## Project Structure

```text
ClubPulse/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── user/
│   │   ├── types/
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── events/
│   │   ├── attendance/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── ...
│
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- A code editor such as Visual Studio Code
- A modern browser such as Chrome or Edge

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ClubPulse
```

Replace `<your-repository-url>` with your actual Git repository URL.

### 2. Start the Backend

Open a terminal in the backend directory:

```bash
cd backend
npm install
npm run start:dev
```

The backend API is configured to run at:

`http://localhost:3000`

### 3. Start the Frontend

Open a second terminal in the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal, usually:

`http://localhost:5173`

Keep both terminals running while using the application.

## Database

ClubPulse uses SQLite with TypeORM for data persistence.

The backend is configured to use a database file named `clubpulse.sqlite`. Database tables are configured through TypeORM entity synchronization for development.

**Important:** Automatic schema synchronization is intended for development. Production deployments should use controlled database migrations and appropriate backup procedures.

## API Overview

The backend includes modules for authentication, users, events, and attendance.

| Area | Purpose |
|---|---|
| Authentication | Register and authenticate users |
| Users | Retrieve and manage member information with authorization checks |
| Events | Create, retrieve, update, and delete events |
| Attendance | Generate event QR tokens and record verified attendance |

The exact endpoints, request bodies, and authorization requirements should be checked in the corresponding controllers and DTOs under `backend/src/`.

## Security Considerations

- Passwords are hashed before storage.
- Protected routes use JWT authentication and role-based authorization.
- Attendance QR tokens expire after a limited period.
- Duplicate attendance is checked before creating a new attendance record.
- Membership identification QR codes are distinct from event attendance tokens.

QR expiration alone cannot prevent every form of proxy attendance. Stronger anti-proxy controls require additional server-side validation, reliable audit logging, and appropriate verification rules.

## Current Development Notes

The following areas require end-to-end verification before being treated as complete:

- Persistent event reservations and available-seat counts.
- Accurate attendance streak and reward calculations.
- Backend-backed badge unlocking and leaderboard data.
- Persistent integrity incident logging and resolution.
- Consistent dashboard metrics derived from database records.

Reservations and attendance are separate concepts: reserving a seat should not automatically mark a member as present.

## Running Tests and Builds

### Backend

```bash
cd backend
npm run build
npm run test
npm run test:e2e
```

### Frontend

```bash
cd frontend
npm run build
npm run lint
```

These commands run the available project checks. Successful execution should be verified in the local environment before reporting the application as fully tested.

## Future Enhancements

- Database-backed event reservations with capacity enforcement.
- Real-time available-seat updates.
- Persistent security audit logs and incident investigation.
- Attendance trend analytics and member engagement insights.
- Reliable streak and reward calculations based on actual attendance.
- Notifications for event registrations and upcoming events.
- Production deployment with environment-based configuration and database migrations.

## License

This project is currently intended for development and demonstration. Add an appropriate license before distributing it publicly.

---

**ClubPulse — Smarter Club Management. Verified Attendance. Better Engagement.**
