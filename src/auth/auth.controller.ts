import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ConfigService } from '@nestjs/config';

import {ApiTags} from "@nestjs/swagger";

import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  @Throttle({
    default: {limit: 5, ttl: 60000} // 5 req per minute
  })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({
    default: {limit: 5, ttl: 60000} // 5 req per minute
  })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Throttle({
    default: {limit: 10, ttl: 60000} // 5 req per minute
  })
  @Post('refresh')
  async refreshToken(@Body() dto: RefreshDto) {
    // decode (without full verification bypass) to extract sub/userId first
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return this.authService.refresh(payload.sub, dto.refreshToken);
  }
}