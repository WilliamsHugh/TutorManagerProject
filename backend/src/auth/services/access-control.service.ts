import { Injectable, ForbiddenException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

/**
 * Access Control Service
 * Kiểm tra quyền sở hữu tài nguyên và quyền truy cập dựa trên role
 */
@Injectable()
export class AccessControlService {
  /**
   * Kiểm tra user có quyền chỉnh sửa dữ liệu của chính họ không
   * (Resource ownership check)
   */
  ensureResourceOwnership(userId: string, targetUserId: string): void {
    if (userId !== targetUserId) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên của người dùng khác',
      );
    }
  }

  /**
   * Kiểm tra user có role cần thiết không
   * Dùng cho additional role checks beyond guards
   */
  hasRole(user: User, requiredRole: string | string[]): boolean {
    const userRole = typeof user.role === 'object' ? user.role.name : user.role;
    const requiredRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    return requiredRoles.includes(userRole);
  }

  /**
   * Kiểm tra và ném exception nếu user không có role cần thiết
   */
  ensureRole(user: User, requiredRole: string | string[]): void {
    if (!this.hasRole(user, requiredRole)) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }
  }

  /**
   * Kiểm tra user là admin hoặc staff
   */
  isAdmin(user: User): boolean {
    return this.hasRole(user, ['admin', 'staff']);
  }

  /**
   * Kiểm tra user là tutor
   */
  isTutor(user: User): boolean {
    return this.hasRole(user, 'tutor');
  }

  /**
   * Kiểm tra user là student
   */
  isStudent(user: User): boolean {
    return this.hasRole(user, 'student');
  }
}
