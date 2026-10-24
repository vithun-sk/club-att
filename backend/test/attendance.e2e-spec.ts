import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Role } from '../src/users/entities/user.entity.js';
import { Event } from '../src/events/entities/event.entity.js';
import { Attendance } from '../src/attendance/entities/attendance.entity.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

describe('Attendance & QR Flow (E2E)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;
  let testEvent: Event;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get(JwtService);

    const userRepository = moduleFixture.get(getRepositoryToken(User));
    const eventRepository = moduleFixture.get(getRepositoryToken(Event));
    const attendanceRepository = moduleFixture.get(getRepositoryToken(Attendance));

    await attendanceRepository.clear();
    await eventRepository.clear();
    await userRepository.clear();

    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await userRepository.save({
      email: 'admin@clubpulse.com',
      password: hashedPassword,
      role: Role.ADMIN,
      name: 'Admin User',
    });

    const normalUser = await userRepository.save({
      email: 'user@clubpulse.com',
      password: hashedPassword,
      role: Role.USER,
      name: 'Normal User',
    });

    testEvent = await eventRepository.save({
      name: 'Tech Meetup',
      date: new Date(),
    });

    // Login Admin
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@clubpulse.com', password: 'password123' });
    adminToken = adminLogin.body.accessToken;

    // Login User
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@clubpulse.com', password: 'password123' });
    userToken = userLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should allow admin to generate QR token for an event', async () => {
    const res = await request(app.getHttpServer())
      .post(`/attendance/qr/${testEvent.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('should forbid non-admin from generating QR token', async () => {
    const res = await request(app.getHttpServer())
      .post(`/attendance/qr/${testEvent.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow user to scan valid QR token and record attendance', async () => {
    const qrToken = jwtService.sign({ eventId: testEvent.id }, { expiresIn: '5m' });

    const res = await request(app.getHttpServer())
      .post('/attendance/scan')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ token: qrToken });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Attendance recorded successfully');
  });

  it('should reject duplicate attendance scan for the same user and event', async () => {
    const qrToken = jwtService.sign({ eventId: testEvent.id }, { expiresIn: '5m' });

    const res = await request(app.getHttpServer())
      .post('/attendance/scan')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ token: qrToken });

    expect(res.status).toBe(400);
  });

  it('should reject expired QR token', async () => {
    const expiredToken = jwtService.sign({ eventId: testEvent.id }, { expiresIn: '-1s' });

    const res = await request(app.getHttpServer())
      .post('/attendance/scan')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ token: expiredToken });

    expect(res.status).toBe(400);
  });

  it('should reject invalid/tampered QR token', async () => {
    const res = await request(app.getHttpServer())
      .post('/attendance/scan')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ token: 'invalid.jwt.token' });

    expect(res.status).toBe(400);
  });
});
