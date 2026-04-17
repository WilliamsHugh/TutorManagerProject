import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterTutorDto } from './dto/register-tutor.dto';
import { LoginDto } from './dto/login.dto';
import { ApprovalStatus } from '../users/entities/tutor.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async registerStudent(dto: RegisterStudentDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createStudent({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passwordHash: passwordHash,
    });

    const { passwordHash: _, ...result } = user;
    return {
      message: 'Đăng ký thành công',
      user: result,
      access_token: this.generateToken(user),
    };
  }

  async registerTutor(dto: RegisterTutorDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createTutor(
      {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        passwordHash: passwordHash,
      },
      {
        educationLevel: dto.education,
        experience: dto.experience,
      },
      dto.subjects || []
    );

    const { passwordHash: _, ...result } = user;
    return {
      message: 'Đăng ký thành công. Hồ sơ đang chờ xét duyệt.',
      user: result,
      // Tutor chưa được cấp token vì chờ duyệt
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Check tutor approval status
    if (user.role && user.role.name === 'tutor') {
      const tutor = await this.usersService.findTutorByUserId(user.id);
      if (tutor && tutor.approvalStatus === ApprovalStatus.PENDING) {
        throw new UnauthorizedException('Hồ sơ của bạn đang chờ xét duyệt');
      }
    }

    const { passwordHash, ...result } = user;
    return {
      message: 'Đăng nhập thành công',
      user: result,
      access_token: this.generateToken(user),
    };
  }

  private generateToken(user: any) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role?.name,
    });
  }
}