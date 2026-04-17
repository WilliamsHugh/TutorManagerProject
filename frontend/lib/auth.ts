/**
 * Auth helper — quản lý token và thông tin người dùng trên client.
 * Lưu trữ bằng localStorage để đơn giản cho giai đoạn kiểm thử.
 * Production nên chuyển sang httpOnly cookie.
 */

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: { id: number; name: string } | null;
}

const TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
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
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

/** Trả về role name ("student" | "tutor" | null) */
export function getUserRole(): string | null {
  return getAuthUser()?.role?.name ?? null;
}
