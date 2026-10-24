import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { Attendance } from '../../attendance/entities/attendance.entity.js';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'simple-enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ nullable: true })
  studentId: string;

  @Column({ default: 'Computer Science' })
  department: string;

  @Column({ default: 'Sophomore (2nd Year)' })
  year: string;

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => Attendance, (attendance) => attendance.user)
  attendances: Relation<Attendance[]>;
}
