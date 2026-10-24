import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { User } from './users/entities/user.entity.js';
import { Event } from './events/entities/event.entity.js';
import { Attendance } from './attendance/entities/attendance.entity.js';
import { EventsModule } from './events/events.module.js';
import { AttendanceModule } from './attendance/attendance.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'clubpulse.sqlite',
      entities: [User, Event, Attendance],
      synchronize: true, // Auto-create tables (dev only)
    }),
    TypeOrmModule.forFeature([User, Event, Attendance]),
    UsersModule,
    AuthModule,
    EventsModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
