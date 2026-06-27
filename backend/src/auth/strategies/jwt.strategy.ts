import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();

    // Kiểm tra user còn hoạt động không
    if (!user.isActive) {
      const staffName = user.lockedBy?.fullName || "Quản trị viên";
      const staffId = user.lockedBy?.id ? user.lockedBy.id.slice(0, 8) : "ADMIN";
      throw new UnauthorizedException(
        `Tài khoản của bạn đã bị khóa bởi nhân viên ${staffName} (ID: ${staffId}).`
      );
    }

    // Xác thực role từ database để ngăn chặn role escalation attack
    // (người dùng không thể tự sửa role trong JWT)
    const userRoleName =
      typeof user.role === 'object' ? user.role.name : user.role;
    if (userRoleName !== payload.role) {
      throw new UnauthorizedException(
        'Quyền truy cập không hợp lệ. Vui lòng đăng nhập lại.',
      );
    }

    return user;
  }
}
