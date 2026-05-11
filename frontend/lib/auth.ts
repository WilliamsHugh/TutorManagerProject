/**
 * Auth helper — quản lý thông tin người dùng trên client.
 * Lưu ý: Token được quản lý bằng HttpOnly Cookie từ Backend để bảo mật tối đa.
 * localStorage chỉ dùng để lưu trữ thông tin hiển thị (Tên, Email, Role).
 */

export interface AuthUser {
  id: string | number;
  email: string;
  fullName: string;
  role: { id: number; name: string } | null;
}

const USER_KEY = "auth_user";

/** Lưu thông tin người dùng vào localStorage */
export function saveAuth(token: string, user: AuthUser) {
  // Chúng ta không lưu token vào cookie từ client nữa vì Backend đã set httpOnly cookie.
  // localStorage chỉ lưu user info để UI hiển thị nhanh.
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
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

/** Xóa thông tin người dùng (Đăng xuất ở Client) */
export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
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
