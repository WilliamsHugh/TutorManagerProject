import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Tutor, ApprovalStatus } from './entities/tutor.entity';
import { Student } from './entities/student.entity';
import { Subject } from '../subjects/subject.entity';
import { Class } from '../classes/entities/class.entity';
import { ClassRequest } from '../classes/entities/class-request.entity';
import { TutorSubject } from '../tutors/tutor-subject.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, RoleType } from '../auth/decorators/roles.decorator';
import * as bcrypt from 'bcryptjs';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN, RoleType.STAFF)
export class AdminController {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
    @InjectRepository(Tutor) private tutorsRepo: Repository<Tutor>,
    @InjectRepository(Student) private studentsRepo: Repository<Student>,
    @InjectRepository(Subject) private subjectsRepo: Repository<Subject>,
    @InjectRepository(Class) private classesRepo: Repository<Class>,
    @InjectRepository(ClassRequest)
    private requestsRepo: Repository<ClassRequest>,
    @InjectRepository(TutorSubject)
    private tutorSubjectsRepo: Repository<TutorSubject>,
  ) {}

  // ----------------------------------------------------
  // QUẢN LÝ TÀI KHOẢN (USERS)
  // ----------------------------------------------------

  @Get('users')
  async getAllUsers() {
    return this.usersRepo.find({
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
  }

  @Post('users')
  async createUser(@Body() body: any) {
    const { email, password, fullName, phone, address, roleName } = body;
    if (!email || !password || !fullName || !roleName) {
      throw new ConflictException('Thiếu thông tin bắt buộc');
    }
    const existing = await this.usersRepo.findOneBy({ email });
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }

    let role = await this.rolesRepo.findOneBy({ name: roleName });
    if (!role) {
      role = await this.rolesRepo.save(
        this.rolesRepo.create({
          name: roleName,
          description: `Vai trò ${roleName}`,
        }),
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({
      email,
      passwordHash: hashedPassword,
      fullName,
      phone,
      address,
      role,
      isActive: true,
    });

    const savedUser = await this.usersRepo.save(user);

    if (roleName === 'tutor') {
      await this.tutorsRepo.save(
        this.tutorsRepo.create({
          user: savedUser,
          approvalStatus: ApprovalStatus.PENDING,
        }),
      );
    } else if (roleName === 'student') {
      await this.studentsRepo.save(
        this.studentsRepo.create({
          user: savedUser,
        }),
      );
    }

    const { passwordHash, ...result } = savedUser;
    return result;
  }

  @Patch('users/:id/status')
  async toggleUserStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
    @Request() req: any,
  ) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    user.isActive = body.isActive;
    user.lockedBy = body.isActive ? null : req.user;
    return this.usersRepo.save(user);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    // Delete student or tutor records related to the user first to clear foreign constraints
    await this.studentsRepo.delete({ user: { id } });
    await this.tutorsRepo.delete({ user: { id } });

    await this.usersRepo.delete({ id });
    return { success: true, message: 'Xóa người dùng thành công' };
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    if (body.fullName !== undefined) user.fullName = body.fullName;
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.address !== undefined) user.address = body.address;
    if (body.email !== undefined) {
      const existing = await this.usersRepo.findOneBy({ email: body.email });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email đã được sử dụng');
      }
      user.email = body.email;
    }
    if (body.isActive !== undefined) user.isActive = body.isActive;

    if (body.roleName && user.role.name !== body.roleName) {
      let role = await this.rolesRepo.findOneBy({ name: body.roleName });
      if (!role) {
        role = await this.rolesRepo.save(
          this.rolesRepo.create({
            name: body.roleName,
            description: `Vai trò ${body.roleName}`,
          }),
        );
      }
      user.role = role;
    }

    const saved = await this.usersRepo.save(user);
    const { passwordHash, ...result } = saved;
    return result;
  }

  // ----------------------------------------------------
  // QUẢN LÝ HỌC VIÊN (STUDENTS)
  // ----------------------------------------------------

  @Get('students')
  async getAllStudents() {
    const students = await this.studentsRepo.find({
      relations: ['user'],
      order: { user: { createdAt: 'DESC' } },
    });

    return students.map((student) => ({
      id: student.id,
      gradeLevel: student.gradeLevel,
      schoolName: student.schoolName,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      user: {
        id: student.user.id,
        fullName: student.user.fullName,
        email: student.user.email,
        phone: student.user.phone,
        address: student.user.address,
        avatarUrl: student.user.avatarUrl,
        isActive: student.user.isActive,
        createdAt: student.user.createdAt,
      },
    }));
  }

  // ----------------------------------------------------
  // PHÊ DUYỆT GIA SƯ (TUTOR APPROVALS)
  // ----------------------------------------------------

  @Get('tutors')
  async getAllTutors() {
    const tutors = await this.tutorsRepo.find({
      relations: ['user', 'approvedBy'],
      order: { user: { createdAt: 'DESC' } },
    });

    const result = await Promise.all(
      tutors.map(async (tutor) => {
        const tutorSubjects = await this.tutorSubjectsRepo.find({
          where: { tutor: { id: tutor.id } },
          relations: ['subject'],
        });
        // Convert enum to lowercase for frontend compatibility
        const statusLower = tutor.approvalStatus.toLowerCase();
        return {
          ...tutor,
          approvalStatus: statusLower,
          subjects: tutorSubjects.map((ts) => ts.subject?.name).filter(Boolean),
        };
      }),
    );

    return result;
  }

  @Patch('tutors/:id/approve')
  async approveTutor(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: any,
  ) {
    const tutor = await this.tutorsRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!tutor) throw new NotFoundException('Không tìm thấy gia sư');

    const statusInput = body.status?.toLowerCase();
    if (!Object.values(ApprovalStatus).includes(statusInput as any)) {
      throw new ConflictException('Trạng thái phê duyệt không hợp lệ');
    }
    const statusEnum = statusInput as ApprovalStatus;

    tutor.approvalStatus = statusEnum;
    tutor.approvedAt = new Date();
    tutor.approvedBy = req.user;

    return this.tutorsRepo.save(tutor);
  }

  // ----------------------------------------------------
  // QUẢN LÝ MÔN HỌC (SUBJECTS)
  // ----------------------------------------------------

  @Get('subjects')
  async getAllSubjects() {
    return this.subjectsRepo.find({
      order: { name: 'ASC' },
    });
  }

  @Post('subjects')
  async createSubject(@Body() body: any) {
    const { name, gradeLevel, description } = body;
    if (!name) throw new ConflictException('Tên môn học không được để trống');

    const subject = this.subjectsRepo.create({
      name,
      gradeLevel,
      description,
      isActive: true,
    });
    return this.subjectsRepo.save(subject);
  }

  @Put('subjects/:id')
  async updateSubject(@Param('id') id: string, @Body() body: any) {
    const subject = await this.subjectsRepo.findOneBy({ id });
    if (!subject) throw new NotFoundException('Không tìm thấy môn học');

    if (body.name !== undefined) subject.name = body.name;
    if (body.gradeLevel !== undefined) subject.gradeLevel = body.gradeLevel;
    if (body.description !== undefined) subject.description = body.description;
    if (body.isActive !== undefined) subject.isActive = body.isActive;

    return this.subjectsRepo.save(subject);
  }

  @Patch('subjects/:id/status')
  async toggleSubjectStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    const subject = await this.subjectsRepo.findOneBy({ id });
    if (!subject) throw new NotFoundException('Không tìm thấy môn học');
    subject.isActive = body.isActive;
    return this.subjectsRepo.save(subject);
  }

  // ----------------------------------------------------
  // THỐNG KÊ & BÁO CÁO (STATS)
  // ----------------------------------------------------

  @Get('stats')
  async getCenterStats(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const classWhere: any = {};
    const requestWhere: any = {};

    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);

      classWhere.startDate = Between(start, end);
      requestWhere.createdAt = Between(start, end);
    }

    const now = new Date();
    const trendRanges = Array.from({ length: 6 }).map((_, i) => {
      const index = 5 - i;
      const d = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
      const monthLabel = `${String(month + 1).padStart(2, '0')}/${year}`;
      return { startOfMonth, endOfMonth, monthLabel };
    });

    // Run all database queries in parallel for maximum optimization (reducing ~15 queries to 1 concurrent roundtrip)
    const [
      activeClasses,
      completedClasses,
      newRequests,
      activeTutors,
      activeClassList,
      classStatusCounts,
      requestStatusCounts,
      subjectPopularityRaw,
      ...monthlyTrendCounts
    ] = await Promise.all([
      this.classesRepo.count({
        where: { ...classWhere, status: 'active' as any },
      }),
      this.classesRepo.count({
        where: { ...classWhere, status: 'completed' as any },
      }),
      this.requestsRepo.count({
        where: { ...requestWhere, status: 'pending' as any },
      }),
      this.tutorsRepo.count({
        where: {
          approvalStatus: ApprovalStatus.APPROVED,
          user: { isActive: true },
        },
      }),
      this.classesRepo.find({
        where: { status: 'active' as any },
        relations: ['student'],
      }),

      // Class status counts using group by
      this.classesRepo
        .createQueryBuilder('class')
        .select('class.status', 'status')
        .addSelect('COUNT(class.id)', 'count')
        .groupBy('class.status')
        .getRawMany(),

      // Request status counts using group by
      this.requestsRepo
        .createQueryBuilder('request')
        .select('request.status', 'status')
        .addSelect('COUNT(request.id)', 'count')
        .groupBy('request.status')
        .getRawMany(),

      // Subject popularity raw
      this.requestsRepo
        .createQueryBuilder('request')
        .leftJoinAndSelect('request.subject', 'subject')
        .select('subject.name', 'subject')
        .addSelect('COUNT(request.id)', 'count')
        .groupBy('subject.name')
        .orderBy('count', 'DESC')
        .getRawMany(),

      // Parallelized monthly trend queries
      ...trendRanges.map((range) =>
        this.requestsRepo.count({
          where: {
            createdAt: Between(range.startOfMonth, range.endOfMonth),
          },
        }),
      ),
    ]);

    // Calculate unique student count
    const uniqueStudentIds = new Set(
      activeClassList.map((c) => c.student?.id).filter(Boolean),
    );
    const learningStudents = uniqueStudentIds.size;

    // Process class status distribution object
    const classStatusDistribution: Record<string, number> = {
      active: 0,
      completed: 0,
      cancelled: 0,
      suspended: 0,
    };
    classStatusCounts.forEach((c) => {
      if (c.status in classStatusDistribution) {
        classStatusDistribution[c.status] = parseInt(c.count, 10);
      }
    });

    // Process request status distribution object
    const requestStatusDistribution: Record<string, number> = {
      pending: 0,
      processing: 0,
      matched: 0,
      cancelled: 0,
    };
    requestStatusCounts.forEach((r) => {
      if (r.status in requestStatusDistribution) {
        requestStatusDistribution[r.status] = parseInt(r.count, 10);
      }
    });

    const subjectPopularity = subjectPopularityRaw.map((item) => ({
      subject: item.subject || 'Khác',
      count: parseInt(item.count, 10),
    }));

    const monthlyRequestTrend = trendRanges.map((range, idx) => ({
      month: range.monthLabel,
      count: monthlyTrendCounts[idx],
    }));

    return {
      activeClasses,
      completedClasses,
      newRequests,
      activeTutors,
      learningStudents,
      classStatusDistribution,
      requestStatusDistribution,
      subjectPopularity,
      monthlyRequestTrend,
    };
  }
}
