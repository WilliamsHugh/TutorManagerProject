import './polyfill';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS cho Next.js frontend
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    whitelist: true 
  }));

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
  console.log(`Backend running on http://localhost:3001`);
}
bootstrap();