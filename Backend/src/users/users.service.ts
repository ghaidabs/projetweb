import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    name: string,
    email: string,
    password: string,
    phone?: string,
    role: string = 'user',
  ) {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findById(id: number) {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async validatePassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async verifyEmail(userId: number) {
    return this.usersRepository.update(userId, {
      isEmailVerified: true,
    });
  }

  async updateUser(userId: number, updateData: Partial<User>) {
    return this.usersRepository.update(userId, updateData);
  }

  async updateUserProfile(userId: number, updateData: any) {
    // Find user first
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update only the allowed fields
    const allowedFields = ['name', 'profileImage', 'phone', 'emergencyContact', 'emergencyPhone'];
    const updatePayload: any = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updatePayload[field] = updateData[field];
      }
    }

    if (Object.keys(updatePayload).length > 0) {
      await this.usersRepository.update(userId, updatePayload);
    }

    // Return updated user
    return this.findById(userId);
  }
}

