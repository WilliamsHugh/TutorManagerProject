import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsString()
  code!: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự' })
  newPassword!: string;
}
