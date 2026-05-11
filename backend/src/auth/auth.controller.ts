import { Controller, Post, Body, Get, UseGuards, Request, Res, Patch } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterTutorDto } from './dto/register-tutor.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles, RoleType } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
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
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    
    // Set cookie httpOnly cho bảo mật cao
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: false, // Để false cho môi trường dev localhost
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    });

    return result;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', {
      path: '/',
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

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
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