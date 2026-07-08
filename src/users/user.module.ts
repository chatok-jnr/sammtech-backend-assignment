import { Module } from '@nestjs/common';
import { UserController } from './dto/user.controller';
import { UserService } from './dto/user.service';

@Module({
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}