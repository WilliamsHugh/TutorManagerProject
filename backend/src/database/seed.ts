import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TutorsService } from '../tutors/tutors.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const tutorsService = app.get(TutorsService);

  console.log('--- Starting Database Seeding ---');

  // Seed basic mock data (Users, Classes, etc.)
  console.log('Seeding mock data...');
  await tutorsService.seedMockData();

  // Seed earnings test data
  console.log('Seeding earnings test data...');
  // await tutorsService.seedEarningsTestData(); // Uncomment if this is public

  console.log('--- Database Seeding Completed ---');
  await app.close();
}

bootstrap().catch(err => {
  console.error('Seeding failed', err);
  process.exit(1);
});
