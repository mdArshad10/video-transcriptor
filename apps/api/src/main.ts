import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,               // auto-convert plain objects → DTO class instances
      whitelist: true,               // strip properties not in the DTO
      forbidNonWhitelisted: true,    // 400 if client sends unknown fields
      transformOptions: {
        enableImplicitConversion: true, // convert query/param primitives automatically
      },
    }),
  );
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
