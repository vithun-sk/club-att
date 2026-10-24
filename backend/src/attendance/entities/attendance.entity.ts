import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import type { User } from '../../users/entities/user.entity.js';
import type { Event } from '../../events/entities/event.entity.js';

@Entity()
@Unique(['user', 'event'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('User', (user: User) => user.attendances, { onDelete: 'CASCADE' })
  user: Relation<any>;

  @ManyToOne('Event', (event: Event) => event.attendances, { onDelete: 'CASCADE' })
  event: Relation<any>;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
