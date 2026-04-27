import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import { Class } from './class.entity';
import { Schedule } from './schedule.entity';
import { ClassRequest } from './class-request.entity';
import { LearningReport } from './learning-report.entity';
import { Review } from './review.entity';

@Module({
  imports: [
    // Kết nối các Entity liên quan đến lớp học vào database
    TypeOrmModule.forFeature([Class, Schedule, ClassRequest, LearningReport, Review]),
  ],
  providers: [ClassesService],
  exports: [ClassesService], // Export ra để TutorsModule có thể gọi được ClassesService
})
export class ClassesModule {}