import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Role } from 'src/database/entities/role.entity';
import { Permission } from 'src/database/entities/permission.entity';
import { RolePermission } from 'src/database/entities/rolePermissions.entity';

@Global()
@Module({
  imports: [
    // Khai báo toàn cục để mọi endpoint có thể dùng được PermissionGuard
    TypeOrmModule.forFeature([User, Role, Permission, RolePermission]),
  ],
  exports: [TypeOrmModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
