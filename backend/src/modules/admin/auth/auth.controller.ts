import {
  Controller,
  Post,
  Body,
  Res,
  Req
} from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.auth.dto';
import express from 'express';
import type { Request } from 'express'

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
    response.cookie('session_id', result.sessionId, {
      httpOnly: true,
      secure: true, // Chỉ chạy qua HTTPS (khi deploy thực tế)
      sameSite: 'lax',
      path: '/', // Có mặt trên mọi API
      maxAge: 24 * 60 * 60 * 1000, // TTL: 1 ngày
    });

    return {
      message: 'Đăng nhập thành công'
    }
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) response: express.Response,
    @Req() request: Request
  ) {
    const result = await this.authService.logout(request);

    // set lại thời gian hết hạn cho session_id
    response.cookie('session_id', '', {
      httpOnly: true,
      secure: true, // Chỉ chạy qua HTTPS (khi deploy thực tế)
      sameSite: 'lax',
      path: '/', // Có mặt trên mọi API
      maxAge: 0, // TTL: 15 phút (tính bằng mili-giây)
    });

    return {
      message: 'Đăng xuất thành công'
    }
  }
}
