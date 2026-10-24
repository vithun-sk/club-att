import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { Attendance } from '../../attendance/entities/attendance.entity.js';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ default: 'Workshop' })
  category: string;

  @Column({ default: '17:00 - 19:00' })
  time: string;

  @Column({ default: 'Innovation Lab Hall B' })
  location: string;

  @Column({ default: 'upcoming' })
  status: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ default: 80 })
  capacity: number;

  @Column({ default: 50 })
  pointsAwarded: number;

  @Column({ default: 10 })
  qrRefreshInterval: number;

  @OneToMany(() => Attendance, (attendance) => attendance.event, { cascade: true })
  attendances: Relation<Attendance[]>;
}
