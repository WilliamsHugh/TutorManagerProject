import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClassesModule } from './classes/classes.module';
import { TutorsModule } from './tutors/tutors.module';

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
        url: config.get('DATABASE_URL'),
        host: !config.get('DATABASE_URL') ? config.get('DB_HOST') : undefined,
        port: !config.get('DATABASE_URL') ? config.get<number>('DB_PORT') : undefined,
        username: !config.get('DATABASE_URL') ? config.get('DB_USERNAME') : undefined,
        password: !config.get('DATABASE_URL') ? config.get('DB_PASSWORD') : undefined,
        database: !config.get('DATABASE_URL') ? config.get('DB_NAME') : undefined,
        entities: [
          Role, User, Tutor, Student,
          Subject, TutorSubject,
          ClassRequest, Class, Schedule,
          LearningReport, Review, Notification,
        ],
        synchronize: true,
        ssl: config.get('DATABASE_URL') ? { rejectUnauthorized: false } : false,
      }),
    }),
    AuthModule,
    UsersModule,
    ClassesModule,
    TutorsModule,
  ],
})
export class AppModule { }