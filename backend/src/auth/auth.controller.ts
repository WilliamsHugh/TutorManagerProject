import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterTutorDto } from './dto/register-tutor.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles, RoleType } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/student')
  registerStudent(@Body() dto: RegisterStudentDto) {
    return this.authService.registerStudent(dto);
  }

  @Post('register/tutor')
  registerTutor(@Body() dto: RegisterTutorDto) {
    return this.authService.registerTutor(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Route chỉ dành cho người đã đăng nhập - lấy thông tin bản thân
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    const { passwordHash, ...user } = req.user;
    return user;
  }

  // Ví dụ route chỉ dành cho tutor
  @Get('tutor-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.TUTOR)
  tutorRoute() {
    return { message: 'Chỉ gia sư mới thấy được' };
  }
}