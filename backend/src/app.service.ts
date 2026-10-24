import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from './users/entities/user.entity.js';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const adminEmail = (this.configService.get<string>('ADMIN_EMAIL') || 'Admin@gmail.com').trim().toLowerCase();
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || 'admin123';

    const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminUser = this.userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'System Administrator',
        role: Role.ADMIN,
      });
      await this.userRepository.save(adminUser);
      console.log(`[Bootstrap] Default development admin account created: ${adminEmail}`);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
