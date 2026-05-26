import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Body(ValidationPipe) refreshTokenDto: RefreshTokenDto,
    @CurrentUser() user: User,
  ) {
    if (!refreshTokenDto.refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.authService.logout(refreshTokenDto.refreshToken);
  }
}

