import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from './entities/user.entity.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberStatusDto } from './dto/update-member-status.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return {
      message: 'Profile retrieved successfully',
      user: req.user,
    };
  }

  @Get('admin-dashboard-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminTest(@Request() req: any) {
    return {
      message: 'Welcome Admin!',
      user: req.user,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllMembers() {
    return this.usersService.findAllMembers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOneMember(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    // Only admins or the user themselves may view their member record
    if (req.user?.role !== Role.ADMIN && req.user?.id !== id) {
      throw new ForbiddenException('You do not have permission to view this member profile');
    }
    return this.usersService.findMemberById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createMember(@Body() createDto: CreateMemberDto) {
    return this.usersService.createMember(createDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMemberStatusDto,
  ) {
    return this.usersService.updateMemberStatus(id, updateDto);
  }
}
