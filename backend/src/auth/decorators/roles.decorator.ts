import { SetMetadata } from '@nestjs/common';

export enum RoleType {
  STUDENT = 'student',
  TUTOR = 'tutor',
  ADMIN = 'admin',
  STAFF = 'staff',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);