/**
 * Auth helper — quản lý thông tin người dùng trên client.
 * Lưu ý: Token được quản lý bằng HttpOnly Cookie từ Backend để bảo mật tối đa.
 * localStorage chỉ dùng để lưu trữ thông tin hiển thị (Tên, Email, Role).
 */

import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * Lấy role từ JWT cookie (decode phía client, không verify).
 * Chỉ dùng để hiển thị UI — bảo vệ thật vẫn do middleware.ts và backend guard.
 */
export function getUserRoleFromToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Đọc cookie (non-httpOnly cookie dùng để UI đọc role)
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
  if (!match) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(match[1]);
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

export interface AuthUser {
  id: string | number;
  email: string;
  fullName: string;
  role: { id: number; name: string } | null;
}

const USER_KEY = "auth_user";
const TOKEN_KEY = "access_token";

/** Lưu thông tin người dùng vào localStorage */
export function saveAuth(token: string, user: AuthUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/** Lấy thông tin người dùng */
export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Lấy token từ localStorage cho các yêu cầu API */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Xóa thông tin người dùng (Đăng xuất ở Client) */
export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
}

/** Kiểm tra trạng thái đăng nhập dựa trên sự tồn tại của User Info */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(USER_KEY);
}

/** Trả về role name ("student" | "tutor" | "admin" | null) */
export function getUserRole(): string | null {
  return getAuthUser()?.role?.name ?? null;
}
