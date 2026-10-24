import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from './entities/user.entity.js';
import { Attendance } from '../attendance/entities/attendance.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberStatusDto } from './dto/update-member-status.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async create(user: Partial<User>): Promise<User> {
    if (typeof user.password !== 'string' || user.password.length === 0) {
      throw new BadRequestException('A valid password is required');
    }

    if (typeof user.email !== 'string' || user.email.trim().length === 0) {
      throw new BadRequestException('A valid email is required');
    }

    const emailTrimmed = user.email.trim().toLowerCase();

    const existingUser = await this.findOneByEmail(emailTrimmed);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = this.usersRepository.create({
      email: emailTrimmed,
      password: hashedPassword,
      name: user.name || 'New Member',
      role: Role.USER, // Hardcoded to USER for public registrations
      studentId: user.studentId,
      department: user.department || 'Computer Science',
      year: user.year || 'Sophomore (2nd Year)',
      status: user.status || 'active',
    });

    return this.usersRepository.save(newUser);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  private mapMemberResponse(user: User, totalEventsCount: number) {
    const attendances = user.attendances || [];
    const attendedCount = attendances.length;
    const attendanceRate = totalEventsCount > 0
      ? Math.round((attendedCount / totalEventsCount) * 100)
      : (attendedCount > 0 ? 100 : 0);

    const riskLevel: 'low' | 'medium' | 'high' =
      attendanceRate >= 75 ? 'low' : attendanceRate >= 50 ? 'medium' : 'high';

    const latestAttendance = attendances.length > 0
      ? attendances.reduce((latest, current) => {
          return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
        })
      : null;

    const lastCheckIn = latestAttendance
      ? new Date(latestAttendance.timestamp).toISOString().slice(0, 16).replace('T', ' ')
      : 'Never';

    const attendanceHistory = attendances.map((att) => {
      const ev = att.event;
      return {
        eventId: String(ev ? ev.id : ''),
        eventName: ev ? ev.name : 'Unknown Event',
        date: ev && ev.date ? (ev.date instanceof Date ? ev.date.toISOString().slice(0, 10) : String(ev.date).slice(0, 10)) : '',
        category: ev ? (ev as any).category || 'Workshop' : 'Workshop',
        status: 'present' as const,
        verifiedAt: new Date(att.timestamp).toLocaleTimeString(),
        pointsEarned: ev ? (ev as any).pointsAwarded || 50 : 50,
      };
    });

    const points = attendances.reduce((sum, att) => {
      const pts = att.event ? (att.event as any).pointsAwarded || 50 : 50;
      return sum + pts;
    }, 50);

    return {
      id: String(user.id),
      studentId: user.studentId || `CP-${user.id.toString().padStart(4, '0')}`,
      name: user.name || 'Member',
      email: user.email,
      role: user.role,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`,
      department: user.department || 'Computer Science',
      year: user.year || 'Sophomore (2nd Year)',
      joinedDate: '2026-09-01',
      totalEvents: totalEventsCount,
      attendedEvents: attendedCount,
      attendanceRate,
      currentStreak: attendedCount > 0 ? attendedCount : 0,
      riskLevel,
      riskFactors: attendanceRate < 60 ? ['Low session attendance'] : [],
      status: (user.status as 'active' | 'at-risk' | 'inactive') || 'active',
      points,
      lastCheckIn,
      attendanceHistory,
    };
  }

  async findAllMembers() {
    const totalEventsCount = await this.eventsRepository.count();
    const users = await this.usersRepository.find({
      relations: { attendances: { event: true } },
      order: { id: 'ASC' },
    });

    return users.map((u) => this.mapMemberResponse(u, totalEventsCount));
  }

  async findMemberById(id: number) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const totalEventsCount = await this.eventsRepository.count();
    const user = await this.usersRepository.findOne({
      where: { id: numericId },
      relations: { attendances: { event: true } },
    });

    if (!user) {
      throw new NotFoundException(`Member with ID ${numericId} not found`);
    }

    return this.mapMemberResponse(user, totalEventsCount);
  }

  async createMember(createDto: CreateMemberDto) {
    const emailTrimmed = createDto.email.trim().toLowerCase();
    const existing = await this.findOneByEmail(emailTrimmed);
    if (existing) {
      throw new BadRequestException('Member with this email already exists');
    }

    const defaultPassword = createDto.password || 'ClubPulse2026!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = this.usersRepository.create({
      email: emailTrimmed,
      name: createDto.name.trim(),
      password: hashedPassword,
      studentId: createDto.studentId?.trim() || undefined,
      department: createDto.department?.trim() || 'Computer Science',
      year: createDto.year?.trim() || 'Sophomore (2nd Year)',
      status: 'active',
      role: Role.USER,
    });

    const saved = await this.usersRepository.save(user);
    if (!saved.studentId) {
      saved.studentId = `CP-${saved.id.toString().padStart(4, '0')}`;
      await this.usersRepository.save(saved);
    }

    const totalEventsCount = await this.eventsRepository.count();
    return this.mapMemberResponse(saved, totalEventsCount);
  }

  async updateMemberStatus(id: number, updateDto: UpdateMemberStatusDto) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.usersRepository.findOne({
      where: { id: numericId },
      relations: { attendances: { event: true } },
    });

    if (!user) {
      throw new NotFoundException(`Member with ID ${numericId} not found`);
    }

    user.status = updateDto.status;
    const saved = await this.usersRepository.save(user);

    const totalEventsCount = await this.eventsRepository.count();
    return this.mapMemberResponse(saved, totalEventsCount);
  }
}
