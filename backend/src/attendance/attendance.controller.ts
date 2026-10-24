import { Controller, Post, Body, UseGuards, Request, Param, BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/entities/user.entity.js';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('qr/:eventId')
  generateQrToken(@Param('eventId') eventId: string) {
    const token = this.attendanceService.generateQrToken(Number(eventId));
    return { token };
  }

  @UseGuards(JwtAuthGuard)
  @Post('scan')
  async scanAttendance(@Request() req: any, @Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    try {
      const attendance = await this.attendanceService.markAttendance(req.user, token);
      return { message: 'Attendance recorded successfully', attendance };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
