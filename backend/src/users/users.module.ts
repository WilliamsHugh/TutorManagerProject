import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Student } from './entities/student.entity';
import { Tutor } from './entities/tutor.entity';
import { Subject } from '../subjects/subject.entity';
import { TutorSubject } from '../tutors/tutor-subject.entity';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, Role, Student, Tutor, Subject, TutorSubject
    ])
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}