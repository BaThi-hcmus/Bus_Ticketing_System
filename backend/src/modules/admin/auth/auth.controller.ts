import {
  Controller,
  Post,
  Body,
  Res
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.auth.dto';
import express from 'express';

@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: express.Response
  ) {
    const result = await this.authService.login(loginDto);

    // Cất Access Token vào Cookie (Mọi API đều được đính kèm nhờ path: '/')
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: true, // Chỉ chạy qua HTTPS (khi deploy thực tế)
      sameSite: 'lax',
      path: '/', // Có mặt trên mọi API
      maxAge: 15 * 60 * 1000, // TTL: 15 phút (tính bằng mili-giây)
    });

    // 2. Cất Refresh Token vào Cookie (Chỉ API refresh mới được cõng theo nhờ path: '/admin/auth/refresh')
    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/admin/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000, // TTL: 30 ngày
    });

    return {
      message: 'Đăng nhập thành công'
    }
  }
}
