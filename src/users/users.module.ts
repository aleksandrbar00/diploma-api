import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { PasswordService } from './password.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, PasswordService],
  controllers: [UsersController],
  exports: [UsersService, PasswordService],
})
export class UsersModule {}
