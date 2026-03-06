import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe — auto-validates DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — allow both frontends
  app.enableCors({
    origin: [
      'http://localhost:5173',        // Lecturer web app (Vite)
      'http://localhost:8082',        // Student mobile app (Expo)
      'http://192.168.100.153:3001',  // LAN access from phone
      /\.ngrok-free\.app$/,           // Expo tunnel URLs
    ],
    credentials: true,
  });

  // Global prefix — all routes start with /api
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}/api`);
}
bootstrap();
