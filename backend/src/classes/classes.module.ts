import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import { Class } from './class.entity';
import { Schedule } from './schedule.entity';
import { ClassRequest } from './class-request.entity';
import { LearningReport } from './learning-report.entity';
import { Review } from './review.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { Tutor } from '../users/entities/tutor.entity';
import { Student } from '../users/entities/student.entity';
import { Subject } from '../subjects/subject.entity';
import { Notification } from '../notifications/notification.entity';

@Module({
  imports: [
    // Kết nối các Entity liên quan đến lớp học vào database
    TypeOrmModule.forFeature([Class, Schedule, ClassRequest, LearningReport, Review, User, Role, Tutor, Student, Subject, Notification]),
  ],
  providers: [ClassesService],
  exports: [ClassesService], // Export ra để TutorsModule có thể gọi được ClassesService
})
export class ClassesModule {}