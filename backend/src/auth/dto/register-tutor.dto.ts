import { IsEmail, IsString, MinLength, IsArray } from 'class-validator';

export class RegisterTutorDto {
  @IsString()
  fullName!: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @IsString()
  education!: string;

  @IsString()
  experience!: string;

  @IsArray()
  subjects!: string[];
}