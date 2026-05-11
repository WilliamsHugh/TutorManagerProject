import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterTutorDto } from './dto/register-tutor.dto';
import { LoginDto } from './dto/login.dto';
import { ApprovalStatus } from '../users/entities/tutor.entity';
import { Otp } from './entities/otp.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
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

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng với email này');
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expire in 10 minutes

    const otp = this.otpRepository.create({
      email,
      code,
      expiresAt,
    });
    await this.otpRepository.save(otp);

    // Mock Email sending
    console.log(`[MAILER] Gửi OTP reset password tới ${email}: ${code}`);
    
    return { message: 'Mã OTP đã được gửi tới email của bạn' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const otp = await this.otpRepository.findOne({
      where: { email, code, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã được sử dụng');
    }

    if (new Date() > otp.expiresAt) {
      throw new BadRequestException('Mã OTP đã hết hạn');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, passwordHash);

    // Mark OTP as used
    otp.isUsed = true;
    await this.otpRepository.save(otp);

    return { message: 'Đặt lại mật khẩu thành công' };
  }

  private generateToken(user: any) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role?.name,
    });
  }
}