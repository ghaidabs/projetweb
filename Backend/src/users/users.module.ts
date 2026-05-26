import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken])],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
