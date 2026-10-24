import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from './entities/user.entity.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(user: Partial<User>): Promise<User> {
    if (
      typeof user.password !== 'string' ||
      user.password.length === 0
    ) {
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
      role: Role.USER, // Hardcoded to USER for public registrations
    });

    return this.usersRepository.save(newUser);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
