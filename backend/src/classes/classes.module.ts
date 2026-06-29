import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassRequest } from './entities/class-request.entity';
import { Class } from './entities/class.entity';
import { Schedule } from './entities/schedule.entity';
import { LearningReport } from './entities/learning-report.entity';
import { Review } from './entities/review.entity';
import { Student } from '../users/entities/student.entity';
import { Tutor } from '../users/entities/tutor.entity';
import { Subject } from '../subjects/subject.entity';
import { User } from '../users/entities/user.entity';
import { TutorSubject } from '../tutors/tutor-subject.entity';
import { ClassRequestsController } from './class-requests.controller';
import { PublicClassRequestsController } from './public-class-requests.controller';
import { ClassRequestsService } from './class-requests.service';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { ReviewsController } from './reviews.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassRequest,
      Class,
      Schedule,
      LearningReport,
      Review,
      Student,
      Tutor,
      Subject,
      User,
      TutorSubject,
    ]),
  ],
  controllers: [
    ClassRequestsController,
    PublicClassRequestsController,
    ClassesController,
    ReviewsController,
  ],
  providers: [ClassRequestsService, ClassesService],
  exports: [ClassRequestsService, ClassesService],
})
export class ClassesModule {}
