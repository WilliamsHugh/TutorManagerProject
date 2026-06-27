/**
 * API Interceptor — Silent Refresh Token Flow
 *
 * Khi access_token hết hạn (401):
 * 1. Gọi /api/auth/refresh để lấy token mới (cookie httpOnly)
 * 2. Nếu thành công → retry request gốc
 * 3. Nếu thất bại → redirect đến trang đăng nhập
 */

import { clearAuth } from '../auth';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  'http://localhost:3001/api';

let isRefreshing = false;
let refreshPromise: Promise<{ ok: boolean; message?: string }> | null = null;

/**
 * Gọi endpoint refresh để lấy cookie mới từ backend
 * Browser tự động gửi refresh_token cookie (path: /api/auth/refresh)
 */
async function attemptRefresh(): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return { ok: false, message: errBody.message };
    }
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/**
 * Fetch wrapper có silent refresh
 * - Tự động gửi kèm cookie (credentials: 'include')
 * - Khi gặp 401 → refresh token → retry (tối đa 1 lần)
 * - Nếu refresh thất bại → clear auth + redirect login
 */
export async function apiFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const doFetch = () =>
    fetch(url, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

  let res = await doFetch();

  // Nếu không phải 401 → return luôn
  if (res.status !== 401) {
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message ?? `HTTP ${res.status}: Yêu cầu thất bại`);
    }
    return res.json() as Promise<T>;
  }

  // === 401: Thử silent refresh ===
  
  // Trước hết kiểm tra xem lỗi gốc có phải do bị khóa không
  const resClone = res.clone();
  const errBody = await resClone.json().catch(() => ({}));
  if (errBody && typeof errBody.message === 'string' && errBody.message.includes('bị khóa')) {
    clearAuth();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('account_locked_msg', errBody.message);
      window.location.href = '/login?locked=true';
    }
    throw new Error(errBody.message);
  }

  // Nếu đang refresh rồi thì chờ
  if (isRefreshing && refreshPromise) {
    const refreshResult = await refreshPromise;
    if (!refreshResult.ok) throw new Error(refreshResult.message || 'Phiên đăng nhập đã hết hạn');
    res = await doFetch();
    if (!res.ok) throw new Error('Phiên đăng nhập đã hết hạn');
    return res.json() as Promise<T>;
  }

  // Bắt đầu refresh
  isRefreshing = true;
  refreshPromise = attemptRefresh();

  const refreshResult = await refreshPromise;
  refreshPromise = null;
  isRefreshing = false;

  if (!refreshResult.ok) {
    // Refresh thất bại → clear auth + redirect
    clearAuth();

    // Chỉ redirect nếu đang ở client
    if (typeof window !== 'undefined') {
      if (refreshResult.message && refreshResult.message.includes('bị khóa')) {
        sessionStorage.setItem('account_locked_msg', refreshResult.message);
        window.location.href = '/login?locked=true';
      } else {
        const currentPath = window.location.pathname;
        if (
          !currentPath.startsWith('/login') &&
          !currentPath.startsWith('/register') &&
          !currentPath.startsWith('/hub/login')
        ) {
          // Lưu lại trang hiện tại để sau login redirect về
          sessionStorage.setItem('redirect_after_login', currentPath);

          if (currentPath.startsWith('/hub') || currentPath.startsWith('/staff')) {
            window.location.href = '/hub/login';
          } else {
            window.location.href = '/login';
          }
        }
      }
    }

    throw new Error(refreshResult.message || 'Phiên đăng nhập đã hết hạn');
  }

  // Refresh thành công → retry request gốc
  res = await doFetch();
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message ?? `HTTP ${res.status}: Yêu cầu thất bại`);
  }
  return res.json() as Promise<T>;
}

/**
 * Fetch không cần silent refresh (dành cho public endpoints)
 */
export async function apiFetchPublic<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message ?? `HTTP ${res.status}: Yêu cầu thất bại`);
  }
  return res.json() as Promise<T>;
}
