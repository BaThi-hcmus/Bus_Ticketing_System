import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission } from './database/entities/permission.entity';
import { Repository } from 'typeorm';

const permissionMappings = {
  'bus:create': 'Tạo xe bus',
  'bus:delete': 'Xóa xe bus',
  'bus:edit': 'Sửa xe bus',
  'bus:view': 'Xem danh sách xe bus',
  
  'permission:assign': 'Phân quyền',
  'permission:create': 'Tạo quyền mới',
  'permission:delete': 'Xóa quyền',
  'permission:edit': 'Sửa quyền',
  'permission:view': 'Xem danh sách quyền',
  
  'role:create': 'Tạo vai trò',
  'role:delete': 'Xóa vai trò',
  'role:edit': 'Sửa vai trò',
  'role:view': 'Xem danh sách vai trò',
  
  'route:create': 'Tạo tuyến đường',
  'route:delete': 'Xóa tuyến đường',
  'route:edit': 'Sửa tuyến đường',
  'route:view': 'Xem danh sách tuyến đường',
  
  'station:create': 'Tạo trạm dừng',
  'station:delete': 'Xóa trạm dừng',
  'station:edit': 'Sửa trạm dừng',
  'station:view': 'Xem danh sách trạm dừng',
  
  'user:create': 'Tạo người dùng',
  'user:delete': 'Xóa người dùng',
  'user:edit': 'Sửa người dùng',
  'user:view': 'Xem danh sách người dùng'
};

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const permissionRepo = app.get<Repository<Permission>>(getRepositoryToken(Permission));

  const permissions = await permissionRepo.find();
  
  let updatedCount = 0;
  for (const perm of permissions) {
    if (permissionMappings[perm.name]) {
      perm.displayName = permissionMappings[perm.name];
      await permissionRepo.save(perm);
      updatedCount++;
      console.log(`Updated: ${perm.name} -> ${perm.displayName}`);
    } else {
        // Fallback for any unknown permissions
        if (!perm.displayName) {
            perm.displayName = perm.name;
            await permissionRepo.save(perm);
        }
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} permissions.`);
  
  await app.close();
  process.exit(0);
}

bootstrap();
