import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Role } from 'src/database/entities/role.entity';
import { Permission } from 'src/database/entities/permission.entity';
import { RolePermission } from 'src/database/entities/rolePermissions.entity';

@Global()
@Module({
  imports: [
    // Khai báo toàn cục để mọi endpoint có thể dùng được PermissionGuard
    TypeOrmModule.forFeature([User, Role, Permission, RolePermission]),
    // Khai báo toàn cục để mọi endpoint có thể dùng được JwtModule (phục vụ CustomJwtGuard)
    JwtModule.registerAsync({
      imports: [ConfigModule], // Khai báo cho JwtModule biết nó cần dùng chung đồ của ConfigModule
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    TypeOrmModule.forFeature([User])
  ],
  exports: [JwtModule, TypeOrmModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
