import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'CAI_KHOA_BI_MAT_SIEU_BAO_MAT_CUA_BAN', // Nên cấu hình trong file .env
      signOptions: { expiresIn: '1d' }, // Token có hiệu lực trong 1 ngày
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
