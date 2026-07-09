import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserController{

    constructor(
        private userService: UserService
    ){}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@CurrentUser() user: {userId: string, email: string}) {
        return this.userService.getProfile(user.userId);
    }
}