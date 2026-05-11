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
import { Otp } from './auth/entities/otp.entity';

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
          // Ưu tiên sử dụng DATABASE_URL nếu có (ví dụ từ Supabase)
          url: dbUrl,
          // Nếu không có URL thì dùng các biến lẻ (localhost)
          host: !dbUrl ? config.get('DB_HOST') : undefined,
          port: !dbUrl ? config.get<number>('DB_PORT') : undefined,
          username: !dbUrl ? config.get('DB_USERNAME') : undefined,
          password: !dbUrl ? config.get('DB_PASSWORD') : undefined,
          database: !dbUrl ? config.get('DB_NAME') : undefined,
          
          entities: [
            Role, User, Tutor, Student,
            Subject, TutorSubject,
            ClassRequest, Class, Schedule,
            LearningReport, Review, Notification,
            Otp
          ],
          synchronize: true, // Chỉ dùng trong môi trường phát triển
          autoLoadEntities: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule { }