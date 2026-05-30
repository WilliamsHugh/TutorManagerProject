import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorController } from './tutor.controller';
import { PublicTutorController } from './public-tutor.controller';
import { TutorsService } from './tutors.service';

// Entities
import { Class } from '../classes/entities/class.entity';
import { Schedule } from '../classes/entities/schedule.entity';
import { LearningReport } from '../classes/entities/learning-report.entity';
import { ClassRequest } from '../classes/entities/class-request.entity';
import { User } from '../users/entities/user.entity';
import { Tutor } from '../users/entities/tutor.entity';
import { Student } from '../users/entities/student.entity';
import { Subject } from '../subjects/subject.entity';
import { Role } from '../users/entities/role.entity';
import { Notification } from '../notifications/notification.entity';
import { TutorSubject } from './tutor-subject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Class,
      Schedule,
      LearningReport,
      ClassRequest,
      User,
      Tutor,
      Student,
      Subject,
      Role,
      Notification,
      TutorSubject,
    ]),
  ],
  controllers: [TutorController, PublicTutorController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}
