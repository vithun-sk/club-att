import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { User } from '../users/entities/user.entity.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private jwtService: JwtService,
  ) {}

  generateQrToken(eventId: number): string {
    return this.jwtService.sign({ eventId }, { expiresIn: '5m' });
  }

  async markAttendance(user: User, token: string): Promise<Attendance> {
    const payload = this.jwtService.verify(token);
    const eventId = payload.eventId;

    const existing = await this.attendanceRepository.findOne({
      where: { user: { id: user.id }, event: { id: eventId } },
    });

    if (existing) {
      throw new Error('Already marked attendance for this event');
    }

    const attendance = this.attendanceRepository.create({
      user,
      event: { id: eventId } as Event,
    });

    return await this.attendanceRepository.save(attendance);
  }
}
