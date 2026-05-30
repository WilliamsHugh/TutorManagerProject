import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Res,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AccessControlService } from './services/access-control.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterTutorDto } from './dto/register-tutor.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from '../tutors/dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles, RoleType } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly accessControl: AccessControlService,
  ) {}

  @Post('register/student')
  registerStudent(@Body() dto: RegisterStudentDto) {
    return this.authService.registerStudent(dto);
  }

  @Post('register/tutor')
  registerTutor(@Body() dto: RegisterTutorDto) {
    return this.authService.registerTutor(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);

    // Cấp refresh token
    const refreshTokenStr = await this.authService.generateRefreshToken(result.user);

    // Set cookie httpOnly cho access_token (30 phút)
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 60 * 1000, // 30 phút
    });

    // Set cookie httpOnly cho refresh_token (7 ngày)
    response.cookie('refresh_token', refreshTokenStr, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh', // Chỉ gửi kèm request đến /auth/refresh
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return result;
  }

  @Post('refresh')
  async refresh(
    @Request() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Lấy refresh token từ cookie
    const refreshTokenStr = req.cookies?.refresh_token;

    if (!refreshTokenStr) {
      throw new UnauthorizedException('Refresh token không tồn tại');
    }

    const tokens = await this.authService.refresh(refreshTokenStr);

    // Set access_token mới (30 phút)
    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 60 * 1000,
    });

    // Set refresh_token mới với rotation (7 ngày)
    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Token đã được làm mới' };
  }

  @Post('logout')
  async logout(
    @Request() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Thu hồi refresh token nếu có
    const refreshTokenStr = req.cookies?.refresh_token;
    if (refreshTokenStr) {
      try {
        await this.authService.revokeRefreshToken(refreshTokenStr);
      } catch {
        // Bỏ qua lỗi khi thu hồi
      }
    }

    response.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });

    response.clearCookie('refresh_token', {
      path: '/api/auth/refresh',
      httpOnly: true,
      sameSite: 'lax',
    });

    return { message: 'Đăng xuất thành công' };
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  // Route chỉ dành cho người đã đăng nhập - lấy thông tin bản thân
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    const { passwordHash, ...user } = req.user;
    return user;
  }

  // Lấy thông tin hồ sơ học viên của người đang đăng nhập
  @Get('student-profile')
  @UseGuards(JwtAuthGuard)
  async getStudentProfile(@Request() req) {
    const userId = req.user.id || req.user.sub;
    const student = await this.usersService.findStudentByUserId(userId);
    return student;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    // Kiểm tra resource ownership - user chỉ được update profile của chính họ
    this.accessControl.ensureResourceOwnership(req.user.id, req.user.id);
    return this.usersService.updateProfile(req.user.id, dto);
  }

  // Ví dụ route chỉ dành cho tutor
  @Get('tutor-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.TUTOR)
  tutorRoute() {
    return { message: 'Chỉ gia sư mới thấy được' };
  }
}
