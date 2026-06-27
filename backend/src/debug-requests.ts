import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  try {
    console.log('Bootstrapping app context...');
    const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
    const dataSource = app.get(DataSource);
    console.log('App context loaded, executing raw schema query...');
    const rows = await dataSource.query(`
      SELECT id, status, preferred_tutor_id FROM class_requests
    `);
    console.log('CLASS REQUESTS:', rows);
    await app.close();
  } catch (err) {
    console.error('CRITICAL SCHEMA ERROR:', err);
    process.exit(1);
  }
}

bootstrap();
