import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật tính năng validate tự động trên toàn hệ thống
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động xóa các thuộc tính lạ không có trong DTO
    forbidNonWhitelisted: true, // Báo lỗi nếu Frontend cố tình truyền thuộc tính lạ lên
    transform: true, // Tự động ép kiểu dữ liệu từ chuỗi sang số nếu DTO khai báo là số
  }));
  // Bật CORS để cho phép Frontend gọi API
  app.enableCors();

  app.use(cookieParser()); // giúp nestJS đọc được cookie do frontend gửi 

  // Đổi cổng sang 3001 để không bị đụng với dự án TDTT đang chạy ở cổng 3000
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
