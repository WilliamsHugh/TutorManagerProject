import { Module } from '@nestjs/common';
import { TutorController } from './tutor.controller';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [
    ClassesModule, // Import ClassesModule để sử dụng ClassesService
  ],
  controllers: [TutorController],
})
export class TutorsModule {}