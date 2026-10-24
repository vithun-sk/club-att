import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Role } from '../src/users/entities/user.entity.js';
import { Event } from '../src/events/entities/event.entity.js';
import { Attendance } from '../src/attendance/entities/attendance.entity.js';
import * as bcrypt from 'bcrypt';

describe('Events and Member Management (E2E)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let adminUserId: number;
  let normalUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const userRepository = moduleFixture.get(getRepositoryToken(User));
    const eventRepository = moduleFixture.get(getRepositoryToken(Event));
    const attendanceRepository = moduleFixture.get(getRepositoryToken(Attendance));

    await attendanceRepository.clear();
    await eventRepository.clear();
    await userRepository.clear();

    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await userRepository.save({
      email: 'admin_batch4@clubpulse.com',
      password: hashedPassword,
      role: Role.ADMIN,
      name: 'Admin Batch4',
      studentId: 'CP-ADMIN',
      department: 'Computer Science',
    });
    adminUserId = adminUser.id;

    const normalUser = await userRepository.save({
      email: 'user_batch4@clubpulse.com',
      password: hashedPassword,
      role: Role.USER,
      name: 'Normal User Batch4',
      studentId: 'CP-0099',
      department: 'Data Science',
    });
    normalUserId = normalUser.id;

    // Login Admin
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin_batch4@clubpulse.com', password: 'password123' });
    adminToken = adminLogin.body.accessToken;

    // Login User
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user_batch4@clubpulse.com', password: 'password123' });
    userToken = userLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Event CRUD and Permissions', () => {
    let createdEventId: number;

    it('should forbid unauthenticated request from listing events', async () => {
      const res = await request(app.getHttpServer()).get('/events');
      expect(res.status).toBe(401);
    });

    it('should forbid normal user from creating an event (403)', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Unauthorized Event',
          date: '2026-11-20',
          category: 'Workshop',
        });

      expect(res.status).toBe(403);
    });

    it('should allow admin to create an event and persist in SQLite', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Full Stack NestJS Workshop',
          category: 'Workshop',
          date: '2026-11-25',
          time: '18:00 - 20:00',
          location: 'Lab 404',
          description: 'Hands on NestJS and React integration',
          capacity: 60,
          pointsAwarded: 75,
          qrRefreshInterval: 15,
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('Full Stack NestJS Workshop');
      expect(res.body.name).toBe('Full Stack NestJS Workshop');
      expect(res.body.capacity).toBe(60);
      expect(res.body.pointsAwarded).toBe(75);
      expect(res.body.actualAttendance).toBe(0);
      createdEventId = res.body.id;
    });

    it('should allow authenticated users to list events', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const found = res.body.find((e: any) => e.id === createdEventId);
      expect(found).toBeDefined();
      expect(found.title).toBe('Full Stack NestJS Workshop');
    });

    it('should allow authenticated users to retrieve a single event by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/events/${createdEventId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdEventId);
      expect(res.body.title).toBe('Full Stack NestJS Workshop');
    });

    it('should return 404 for non-existent event', async () => {
      const res = await request(app.getHttpServer())
        .get('/events/99999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('should forbid normal user from updating an event (403)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/events/${createdEventId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(403);
    });

    it('should allow admin to update an event', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/events/${createdEventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Advanced NestJS Architecture',
          capacity: 100,
          status: 'live',
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Advanced NestJS Architecture');
      expect(res.body.capacity).toBe(100);
      expect(res.body.status).toBe('live');
    });

    it('should forbid normal user from deleting an event (403)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/events/${createdEventId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to delete an event', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/events/${createdEventId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted successfully');

      // Verify it is no longer found
      const checkRes = await request(app.getHttpServer())
        .get(`/events/${createdEventId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(checkRes.status).toBe(404);
    });
  });

  describe('Member Management and Permissions', () => {
    let createdMemberId: string;

    it('should forbid normal user from listing all members (403)', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to list all members with attendance metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);

      const normal = res.body.find((m: any) => m.email === 'user_batch4@clubpulse.com');
      expect(normal).toBeDefined();
      expect(normal.name).toBe('Normal User Batch4');
      expect(normal.studentId).toBe('CP-0099');
      expect(normal.attendanceRate).toBeDefined();
      expect(normal.password).toBeUndefined(); // Security: password omitted
    });

    it('should allow normal user to view their own profile by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/${normalUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('user_batch4@clubpulse.com');
    });

    it('should forbid normal user from viewing another user profile by ID (403)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/${adminUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should forbid normal user from adding members (403)', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Member',
          email: 'unauthorized@clubpulse.com',
        });

      expect(res.status).toBe(403);
    });

    it('should allow admin to add a new member', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Elena Rostova',
          email: 'elena@clubpulse.com',
          studentId: 'CP-1024',
          department: 'Software Engineering',
          year: 'Junior (3rd Year)',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Elena Rostova');
      expect(res.body.email).toBe('elena@clubpulse.com');
      expect(res.body.studentId).toBe('CP-1024');
      expect(res.body.status).toBe('active');
      createdMemberId = res.body.id;
    });

    it('should forbid normal user from changing member status (403)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${createdMemberId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'at-risk' });

      expect(res.status).toBe(403);
    });

    it('should allow admin to change member status', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${createdMemberId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'at-risk' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('at-risk');

      // Verify persistence
      const getRes = await request(app.getHttpServer())
        .get(`/users/${createdMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.status).toBe('at-risk');
    });
  });
});
