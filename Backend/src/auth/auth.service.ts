import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as jwt from 'jsonwebtoken';
import { RefreshToken } from 'src/users/entities/refresh-token.entity';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRegisteredEvent } from 'src/events/user.events';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, phone } = registerDto;

    // Create user with role 'user' by default
    const user = await this.usersService.create(name, email, password, phone, 'user');

    // Emit user.registered event
    this.eventEmitter.emit(
      'user.registered',
      new UserRegisteredEvent(user.id, user.email, user.name, user.role, user.createdAt),
    );

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    // Save refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    // Save refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || '';
    if (!refreshSecret) {
      throw new UnauthorizedException('Refresh secret not configured');
    }

    try {
      // Verify JWT signature
      jwt.verify(refreshToken, refreshSecret);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify refresh token exists and is not revoked
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: {
        token: refreshToken,
        isRevoked: false,
      },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }

    // Check if token is expired (as backup)
    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Get user
    const user = await this.usersService.findById(tokenRecord.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new tokens
    const newTokens = this.generateTokens(user.id, user.email);

    // Revoke old refresh token and save new one
    await this.refreshTokenRepository.update(tokenRecord.id, {
      isRevoked: true,
    });
    await this.saveRefreshToken(user.id, newTokens.refreshToken);

    return {
      message: 'Token refreshed successfully',
      ...newTokens,
    };
  }

  async logout(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid refresh token');
    }

    // Revoke refresh token
    await this.refreshTokenRepository.update(tokenRecord.id, {
      isRevoked: true,
    });

    return { message: 'Logout successful' };
  }

  private generateTokens(userId: number, email: string) {
    const expiresIn = this.configService.get<string>('JWT_EXPIRATION') || '15m';
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default_refresh_secret';

    // Access token using JwtService (configured secret)
    const accessToken = this.jwtService.sign(
      { sub: userId, email } as any,
      { expiresIn: expiresIn as any },
    );

    // Refresh token using jsonwebtoken library (different secret)
    const refreshToken = jwt.sign(
      { sub: userId, email },
      refreshSecret,
      { expiresIn: refreshExpiresIn } as any,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private async saveRefreshToken(userId: number, token: string) {
    const refreshExpiration = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );
    
    // Parse expiration string (e.g., "7d" -> 7 days)
    const match = refreshExpiration.match(/^(\d+)([dwh])$/);
    let expirationMs = 7 * 24 * 60 * 60 * 1000; // default 7 days

    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      
      if (unit === 'd') {
        expirationMs = value * 24 * 60 * 60 * 1000;
      } else if (unit === 'w') {
        expirationMs = value * 7 * 24 * 60 * 60 * 1000;
      } else if (unit === 'h') {
        expirationMs = value * 60 * 60 * 1000;
      }
    }

    const expiresAt = new Date(Date.now() + expirationMs);

    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }
}
