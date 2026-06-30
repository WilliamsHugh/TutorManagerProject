import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SystemLogsService } from './system-logs.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly systemLogsService: SystemLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const { method, url, body, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';

    // Only log mutating HTTP requests (POST, PUT, PATCH, DELETE)
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    return next.handle().pipe(
      tap({
        next: async (response) => {
          if (isMutation) {
            const user = request.user;
            const userId = user?.id || null;

            // Determine readable action name from method & route
            let action = `${method} ${url}`;
            if (url.includes('/auth/login')) {
              action = 'Đăng nhập';
            } else if (url.includes('/auth/register')) {
              action = 'Đăng ký tài khoản';
            } else if (url.includes('/admin/users') && method === 'POST') {
              action = 'Cấp tài khoản mới';
            } else if (url.includes('/admin/users') && method === 'PATCH') {
              action = 'Cập nhật trạng thái tài khoản';
            } else if (url.includes('/admin/users') && method === 'PUT') {
              action = 'Cập nhật tài khoản';
            } else if (
              url.includes('/admin/tutors') &&
              url.includes('/approve')
            ) {
              action = 'Phê duyệt hồ sơ Gia sư';
            } else if (url.includes('/admin/subjects') && method === 'POST') {
              action = 'Thêm môn học mới';
            } else if (url.includes('/admin/subjects') && method === 'PUT') {
              action = 'Cập nhật môn học';
            } else if (url.includes('/admin/subjects') && method === 'PATCH') {
              action = 'Thay đổi trạng thái môn học';
            } else if (url.includes('/class-requests') && method === 'POST') {
              action = 'Học viên gửi yêu cầu ghép lớp';
            } else if (url.includes('/classes') && method === 'POST') {
              action = 'Nhân viên tạo lớp học';
            }

            // Sanitize body (remove sensitive password keys)
            const sanitizedBody = { ...body };
            if (sanitizedBody.password) delete sanitizedBody.password;
            if (sanitizedBody.confirmPassword)
              delete sanitizedBody.confirmPassword;

            try {
              await this.systemLogsService.create({
                userId,
                action,
                method,
                route: url,
                ipAddress: ip || request.connection.remoteAddress || '',
                userAgent,
                details: {
                  body: sanitizedBody,
                  responseId: response?.id || response?.userId || null,
                },
              });
            } catch (err) {
              console.error('Failed to write audit log:', err);
            }
          }
        },
      }),
    );
  }
}
