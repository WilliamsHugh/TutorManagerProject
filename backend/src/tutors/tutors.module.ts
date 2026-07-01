import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesModule } from '../classes/classes.module';
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
import { Review } from '../classes/entities/review.entity';
import { Setting } from '../settings/setting.entity';

import { NotificationsModule } from '../notifications/notifications.module';

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
      Review,
      Setting,
    ]),
    forwardRef(() => ClassesModule),
    NotificationsModule,
  ],
  controllers: [TutorController, PublicTutorController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}
