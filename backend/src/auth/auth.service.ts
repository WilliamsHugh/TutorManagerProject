import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterTutorDto } from './dto/register-tutor.dto';
import { LoginDto } from './dto/login.dto';
import { ApprovalStatus } from '../users/entities/tutor.entity';
import { Otp } from './entities/otp.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private mailerService: MailerService,
  ) {}

  async registerStudent(dto: RegisterStudentDto) {
    // const passwordHash = await bcrypt.hash(dto.password, 10);
    const passwordHash = dto.password; // Lưu text thuần để test theo yêu cầu
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
    // const passwordHash = await bcrypt.hash(dto.password, 10);
    const passwordHash = dto.password; // Lưu text thuần để test theo yêu cầu
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
        cvUrl: dto.cvUrl,
      },
      dto.subjects || [],
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

    // Kiểm tra bằng Bcrypt, nếu thất bại thì thử so sánh chuỗi thuần (để hỗ trợ dữ liệu SQL mẫu)
    let isPasswordValid = await bcrypt
      .compare(dto.password, user.passwordHash)
      .catch(() => false);
    if (!isPasswordValid) {
      isPasswordValid = dto.password === user.passwordHash;
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.isActive) {
      const staffName = user.lockedBy?.fullName || "Quản trị viên";
      const staffId = user.lockedBy?.id ? user.lockedBy.id.slice(0, 8) : "ADMIN";
      throw new UnauthorizedException(
        `Tài khoản của bạn đã bị khóa bởi nhân viên ${staffName} (ID: ${staffId}). Vui lòng liên hệ trung tâm để được hỗ trợ.`
      );
    }

    const roleName = user.role?.name ?? '';

    // Phân luồng đăng nhập dựa theo Portal
    if (dto.portal === 'hub') {
      if (roleName !== 'admin' && roleName !== 'staff') {
        throw new UnauthorizedException(
          'Tài khoản này không có quyền truy cập cổng quản trị nội bộ.',
        );
      }
    } else {
      // Đăng nhập từ cổng công cộng (hoặc không truyền portal)
      if (roleName === 'admin' || roleName === 'staff') {
        throw new UnauthorizedException(
          'Tài khoản quản trị. Vui lòng đăng nhập tại cổng nội bộ: /hub/login',
        );
      }
    }

    // Check tutor approval status
    if (roleName === 'tutor') {
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

    // Send real email using MailerService
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '[Tutor Manager] Mã OTP Đặt Lại Mật Khẩu',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
            <h2 style="color: #0b5fff; text-align: center;">Yêu cầu đặt lại mật khẩu</h2>
            <p>Xin chào,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này. Vui lòng sử dụng mã OTP dưới đây để hoàn tất quá trình:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #0b5fff; letter-spacing: 5px; padding: 10px 20px; background-color: #f0f7ff; border-radius: 4px; border: 1px dashed #0b5fff;">
                ${code}
              </span>
            </div>
            <p style="color: #64748b; font-size: 13px;">Mã OTP này có hiệu lực trong vòng <b>10 phút</b>. Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="font-size: 11px; color: #94a3b8; text-align: center;">Đây là email tự động, vui lòng không phản hồi thư này.</p>
          </div>
        `,
      });
      console.log(`[MAILER] Đã gửi OTP đặt lại mật khẩu thành công tới ${email}`);
    } catch (error) {
      console.error(`[MAILER ERROR] Lỗi khi gửi mail tới ${email}:`, error);
    }

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

  async generateRefreshToken(user: any): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 ngày

    const refreshToken = this.refreshTokenRepository.create({
      user,
      token,
      expiresAt,
    });
    await this.refreshTokenRepository.save(refreshToken);

    return token;
  }

  async refresh(refreshTokenStr: string) {
    if (!refreshTokenStr) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    // Tìm refresh token trong DB
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenStr, isRevoked: false },
      relations: ['user'],
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã bị thu hồi');
    }

    if (new Date() > refreshToken.expiresAt) {
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }

    // Kiểm tra user còn hoạt động
    const user = refreshToken.user;
    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị vô hiệu hóa');
    }

    // Thu hồi refresh token cũ (rotation)
    refreshToken.isRevoked = true;
    await this.refreshTokenRepository.save(refreshToken);

    // Cấp access token mới
    const accessToken = this.generateToken(user);

    // Cấp refresh token mới
    const newRefreshToken = await this.generateRefreshToken(user);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async revokeRefreshTokens(userId: string) {
    await this.refreshTokenRepository.update(
      { user: { id: userId }, isRevoked: false },
      { isRevoked: true },
    );
  }

  async revokeRefreshToken(token: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token, isRevoked: false },
    });
    if (refreshToken) {
      refreshToken.isRevoked = true;
      await this.refreshTokenRepository.save(refreshToken);
    }
  }
}
