import { IsEmail, IsString, MinLength, IsMobilePhone } from 'class-validator';

export class RegisterStudentDto {
  @IsString()
  fullName!: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;
}