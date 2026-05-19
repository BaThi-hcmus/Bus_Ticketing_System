import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Bật CORS để cho phép Frontend gọi API
  app.enableCors();

  // Đổi cổng sang 3001 để không bị đụng với dự án TDTT đang chạy ở cổng 3000
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
