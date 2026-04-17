import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

// Entities
import { Role } from './users/entities/role.entity';
import { User } from './users/entities/user.entity';
import { Tutor } from './users/entities/tutor.entity';
import { Student } from './users/entities/student.entity';
import { Subject } from './subjects/subject.entity';
import { TutorSubject } from './tutors/tutor-subject.entity';
import { ClassRequest } from './classes/class-request.entity';
import { Class } from './classes/class.entity';
import { Schedule } from './classes/schedule.entity';
import { LearningReport } from './classes/learning-report.entity';
import { Review } from './classes/review.entity';
import { Notification } from './notifications/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [
          Role, User, Tutor, Student,
          Subject, TutorSubject,
          ClassRequest, Class, Schedule,
          LearningReport, Review, Notification,
        ],
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule { }