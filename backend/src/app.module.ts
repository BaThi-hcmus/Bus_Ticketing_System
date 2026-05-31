import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BusModule } from './modules/admin/bus/bus.module';
import { RouteModule } from './modules/admin/route/route.module';
import { StationModule } from './modules/admin/station/station.module';
import { AuthModule } from './modules/admin/auth/auth.module';
import { UserModule } from './modules/admin/user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { RoleModule } from './modules/admin/role/role.module';
import { PermissionModule } from './modules/admin/permission/permission.module';
import { CategoryPermissionModule } from './modules/admin/category-permission/category-permission.module';

@Module({
  imports: [
    // 1. Load file .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 2. Cấu hình TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT', '1433'), 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // đường dẫn tới các file entity định nghĩa schema
        synchronize: true, // Tự động tạo bảng dựa trên code Entity (Chỉ dùng khi Dev)
        extra: {
          trustServerCertificate: true, // Quan trọng để tránh lỗi SSL trên Local
        },
      }),
    }),
    // cache - redis
    CacheModule.registerAsync({
      isGlobal: true, // Để các module khác (Auth, User...) đều dùng được mà không cần import lại
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        }),
      }),
    }),
    BusModule,
    RouteModule,
    StationModule,
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    CategoryPermissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
