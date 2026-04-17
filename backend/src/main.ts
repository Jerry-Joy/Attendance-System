import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

function buildCorsOrigins(): Array<string | RegExp> {
  const defaults = ['http://localhost:5173', 'http://localhost:8082'];
  const configured = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origins: Array<string | RegExp> = [...defaults, ...configured];
  if (process.env.CORS_ALLOW_NGROK !== 'false') {
    origins.push(/\.ngrok-free\.app$/);
  }
  return origins;
}

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
    origin: buildCorsOrigins(),
    credentials: true,
  });

  // Global prefix — all routes start with /api
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}/api`);
}
bootstrap();
