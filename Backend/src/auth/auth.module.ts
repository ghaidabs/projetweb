import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { RefreshToken } from 'src/users/entities/refresh-token.entity';
import { UserRegisteredListener } from 'src/events/user-registered.listener';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = (configService.get<string>('JWT_EXPIRATION') || '15m') as any;
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
    UsersModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UserRegisteredListener],
  exports: [AuthService],
})
export class AuthModule {}
