/**
 * Auth helper — quản lý token và thông tin người dùng trên client.
 * Sử dụng Cookie cho token (để Middleware có thể đọc) và localStorage cho User Info.
 */
import Cookies from "js-cookie";

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: { id: number; name: string } | null;
}

const TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

export function saveAuth(token: string, user: AuthUser) {
  // Lưu token vào cookie (Middleware sẽ dùng cái này)
  Cookies.set(TOKEN_KEY, token, { expires: 1, path: '/' });
  // Lưu user info vào localStorage để UI hiển thị nhanh
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  // Lưu ý: Nếu dùng httpOnly cookie, hàm này sẽ trả về null ở client.
  // Tuy nhiên Middleware vẫn đọc được cookie này.
  return Cookies.get(TOKEN_KEY) || null;
}

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

export function clearAuth() {
  Cookies.remove(TOKEN_KEY, { path: '/' });
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(USER_KEY);
}

/** Trả về role name ("student" | "tutor" | "admin" | null) */
export function getUserRole(): string | null {
  return getAuthUser()?.role?.name ?? null;
}

