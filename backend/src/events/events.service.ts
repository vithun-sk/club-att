import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity.js';
import { Attendance } from '../attendance/entities/attendance.entity.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  private mapEventResponse(event: Event) {
    const actualAttendance = event.attendances ? event.attendances.length : 0;
    const dateStr = event.date instanceof Date
      ? event.date.toISOString().slice(0, 10)
      : String(event.date).slice(0, 10);

    return {
      id: event.id,
      name: event.name,
      title: event.name,
      category: event.category || 'Workshop',
      date: dateStr,
      time: event.time || '17:00 - 19:00',
      location: event.location || 'Innovation Lab Hall B',
      status: event.status || 'upcoming',
      description: event.description || '',
      capacity: event.capacity ?? 80,
      actualAttendance,
      rsvpCount: 0,
      pointsAwarded: event.pointsAwarded ?? 50,
      qrRefreshInterval: event.qrRefreshInterval ?? 10,
      attendances: event.attendances || [],
    };
  }

  async findAll() {
    const events = await this.eventsRepository.find({
      relations: { attendances: { user: true } },
      order: { id: 'DESC' },
    });
    return events.map((e) => this.mapEventResponse(e));
  }

  async findOne(id: number) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid event ID');
    }

    const event = await this.eventsRepository.findOne({
      where: { id: numericId },
      relations: { attendances: { user: true } },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${numericId} not found`);
    }

    return this.mapEventResponse(event);
  }

  async create(createDto: CreateEventDto | { name: string; date: string | Date }) {
    const rawName = (createDto as any).title || (createDto as any).name;
    if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
      throw new BadRequestException('Event title or name is required');
    }

    if (!createDto.date) {
      throw new BadRequestException('Event date is required');
    }

    const parsedDate = new Date(createDto.date);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid date format for event');
    }

    const dto = createDto as CreateEventDto;

    const event = this.eventsRepository.create({
      name: rawName.trim(),
      date: parsedDate,
      category: dto.category || 'Workshop',
      time: dto.time || '17:00 - 19:00',
      location: dto.location || 'Innovation Lab Hall B',
      status: dto.status || 'upcoming',
      description: dto.description || '',
      capacity: dto.capacity !== undefined ? Number(dto.capacity) : 80,
      pointsAwarded: dto.pointsAwarded !== undefined ? Number(dto.pointsAwarded) : 50,
      qrRefreshInterval: dto.qrRefreshInterval !== undefined ? Number(dto.qrRefreshInterval) : 10,
    });

    const saved = await this.eventsRepository.save(event);
    return this.mapEventResponse(saved);
  }

  async update(id: number, updateDto: UpdateEventDto) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid event ID');
    }

    const event = await this.eventsRepository.findOne({
      where: { id: numericId },
      relations: { attendances: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${numericId} not found`);
    }

    const rawName = updateDto.title || updateDto.name;
    if (rawName !== undefined) {
      if (!rawName.trim()) {
        throw new BadRequestException('Event title cannot be empty');
      }
      event.name = rawName.trim();
    }

    if (updateDto.date !== undefined) {
      const parsedDate = new Date(updateDto.date);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date format for event');
      }
      event.date = parsedDate;
    }

    if (updateDto.category !== undefined) event.category = updateDto.category;
    if (updateDto.time !== undefined) event.time = updateDto.time;
    if (updateDto.location !== undefined) event.location = updateDto.location;
    if (updateDto.status !== undefined) event.status = updateDto.status;
    if (updateDto.description !== undefined) event.description = updateDto.description;
    if (updateDto.capacity !== undefined) event.capacity = Number(updateDto.capacity);
    if (updateDto.pointsAwarded !== undefined) event.pointsAwarded = Number(updateDto.pointsAwarded);
    if (updateDto.qrRefreshInterval !== undefined) event.qrRefreshInterval = Number(updateDto.qrRefreshInterval);

    const saved = await this.eventsRepository.save(event);
    return this.mapEventResponse(saved);
  }

  async remove(id: number) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid event ID');
    }

    const event = await this.eventsRepository.findOne({
      where: { id: numericId },
      relations: { attendances: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${numericId} not found`);
    }

    // Clear any attendances linked to this event before deleting
    await this.attendanceRepository.delete({ event: { id: numericId } });
    await this.eventsRepository.remove(event);

    return { message: 'Event deleted successfully', id: numericId };
  }
}
