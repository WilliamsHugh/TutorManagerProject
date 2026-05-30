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
  exp?: number;  // Unix timestamp (seconds)
  iat?: number;  // Unix timestamp (seconds)
}

const ACCESS_TOKEN_COOKIE_REGEX = /(?:^|;\s*)access_token=([^;]*)/;

/**
 * Đọc access_token từ cookie.
 * Token này không phải httpOnly (do HubLoginForm set) để UI có thể đọc role.
 * Backend vẫn set httpOnly cookie riêng cho bảo mật.
 */
function getAccessTokenCookie(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(ACCESS_TOKEN_COOKIE_REGEX);
  return match ? match[1] : null;
}

/**
 * Giải mã JWT token từ cookie để lấy payload (không verify — chỉ dùng cho UI).
 */
function getDecodedToken(): JwtPayload | null {
  const token = getAccessTokenCookie();
  if (!token) return null;
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

/**
 * Lấy role từ JWT cookie (decode phía client, không verify).
 * Chỉ dùng để hiển thị UI — bảo vệ thật vẫn do middleware.ts và backend guard.
 */
export function getUserRoleFromToken(): string | null {
  const decoded = getDecodedToken();
  return decoded?.role ?? null;
}

/**
 * Kiểm tra access_token đã hết hạn chưa dựa trên exp claim.
 * Dùng để UI hiển thị cảnh báo hoặc kích hoạt refresh sớm.
 */
export function isTokenExpired(): boolean {
  const decoded = getDecodedToken();
  if (!decoded?.exp) return true;
  // exp là Unix timestamp (giây), Date.now() là milliseconds
  return Date.now() >= decoded.exp * 1000;
}

/**
 * Lấy số milliseconds còn lại trước khi token hết hạn.
 * Trả về 0 nếu token đã hết hạn hoặc không decode được.
 */
export function getTokenTTL(): number {
  const decoded = getDecodedToken();
  if (!decoded?.exp) return 0;
  const remainingMs = decoded.exp * 1000 - Date.now();
  return Math.max(0, remainingMs);
}

/**
 * Kiểm tra token sắp hết hạn (còn dưới `thresholdMs` milliseconds).
 * Mặc định: 5 phút.
 */
export function isTokenExpiringSoon(thresholdMs: number = 5 * 60 * 1000): boolean {
  const ttl = getTokenTTL();
  return ttl > 0 && ttl < thresholdMs;
}

/**
 * Lấy thời gian hết hạn của token dưới dạng Date.
 */
export function getTokenExpiryDate(): Date | null {
  const decoded = getDecodedToken();
  if (!decoded?.exp) return null;
  return new Date(decoded.exp * 1000);
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
