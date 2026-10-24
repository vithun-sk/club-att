import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Event } from '../../events/entities/event.entity.js';

@Entity()
@Unique(['user', 'event'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.attendances, { onDelete: 'CASCADE' })
  user: Relation<User>;

  @ManyToOne(() => Event, (event) => event.attendances, { onDelete: 'CASCADE' })
  event: Relation<Event>;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
