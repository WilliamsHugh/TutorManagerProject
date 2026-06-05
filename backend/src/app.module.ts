import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClassesModule } from './classes/classes.module';
import { TutorsModule } from './tutors/tutors.module';
import { ReportsModule } from './reports/reports.module';
import { SubjectsModule } from './subjects/subjects.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';

// Entities
import { Role } from './users/entities/role.entity';
import { User } from './users/entities/user.entity';
import { Tutor } from './users/entities/tutor.entity';
import { Student } from './users/entities/student.entity';
import { Subject } from './subjects/subject.entity';
import { TutorSubject } from './tutors/tutor-subject.entity';
import { ClassRequest } from './classes/entities/class-request.entity';
import { Class } from './classes/entities/class.entity';
import { Schedule } from './classes/entities/schedule.entity';
import { LearningReport } from './classes/entities/learning-report.entity';
import { Review } from './classes/entities/review.entity';
import { Notification } from './notifications/notification.entity';
import { Otp } from './auth/entities/otp.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get('DATABASE_URL');

        return {
          type: 'postgres',
          url: dbUrl,
          host: !dbUrl ? config.get('DB_HOST') : undefined,
          port: !dbUrl ? config.get<number>('DB_PORT') : undefined,
          username: !dbUrl ? config.get('DB_USERNAME') : undefined,
          password: !dbUrl ? config.get('DB_PASSWORD') : undefined,
          database: !dbUrl ? config.get('DB_NAME') : undefined,

          entities: [
            Role,
            User,
            Tutor,
            Student,
            Subject,
            TutorSubject,
            ClassRequest,
            Class,
            Schedule,
            LearningReport,
            Review,
            Notification,
            Otp,
            RefreshToken,
          ],
          synchronize: true,
          autoLoadEntities: true,
          ssl: dbUrl ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    AuthModule,
    UsersModule,
    ClassesModule,
    TutorsModule,
    ReportsModule,
    SubjectsModule,
    NotificationsModule,
    UploadModule,
  ],
})
export class AppModule {}
