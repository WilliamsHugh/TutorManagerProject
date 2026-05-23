import { Module } from '@nestjs/common';
import { TutorController } from './tutor.controller';
import { PublicTutorController } from './public-tutor.controller';
import { TutorsService } from './tutors.service';

@Module({
  imports: [],
  controllers: [TutorController, PublicTutorController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}