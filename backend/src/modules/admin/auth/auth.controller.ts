import {
  Controller,
  Post,
  Body
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.auth.dto';

@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    return {
      data: result,
      message: 'Đăng nhập thành công'
    }
  }
}
