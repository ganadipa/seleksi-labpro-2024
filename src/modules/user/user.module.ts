import { Module } from '@nestjs/common';
import { UserRepository } from './repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserRepository, UserService],

  exports: [UserRepository],
})
export class UserModule {}
