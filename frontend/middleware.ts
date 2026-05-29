import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify, errors } from 'jose';

// Phải trùng với JWT_SECRET trong backend
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  'http://localhost:3001/api';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Mutex để tránh race condition khi nhiều request cùng refresh token
let refreshPromise: Promise<{ success: boolean; response?: NextResponse }> | null = null;

/**
 * Gọi backend /auth/refresh để xin access_token mới.
 * Dùng mutex để chỉ một refresh chạy tại một thời điểm,
 * tránh race condition khi nhiều request đồng thời token hết hạn.
 */
async function tryRefreshToken(
  request: NextRequest,
): Promise<{ success: boolean; response?: NextResponse }> {
  // Nếu đang có refresh, chờ kết quả thay vì tạo request mới
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = request.cookies.get('refresh_token')?.value;
  if (!refreshToken) return { success: false };

  refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `refresh_token=${refreshToken}`,
        },
      });

      if (!refreshRes.ok) return { success: false };

      // Forward Set-Cookie headers từ backend response sang client response
      const response = NextResponse.next();
      if (typeof refreshRes.headers.getSetCookie === 'function') {
        const cookies = refreshRes.headers.getSetCookie();
        for (const cookie of cookies) {
          response.headers.append('Set-Cookie', cookie);
        }
      } else {
        // Fallback cho môi trường cũ
        const setCookieHeader = refreshRes.headers.get('Set-Cookie');
        if (setCookieHeader) {
          const cookies = setCookieHeader.split(', ');
          for (const cookie of cookies) {
            response.headers.append('Set-Cookie', cookie);
          }
        }
      }

      return { success: true, response };
    } catch {
      return { success: false };
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/**
 * Xử lý lỗi JWTExpired: thử refresh token, nếu thất bại thì redirect về trang login.
 */
async function handleJWTExpired(
  request: NextRequest,
  redirectUrl: string,
): Promise<NextResponse> {
  const refreshResult = await tryRefreshToken(request);
  if (refreshResult.success && refreshResult.response) {
    return refreshResult.response;
  }

  console.warn(`[Middleware] JWT expired — redirecting to ${redirectUrl}`);
  const response = NextResponse.redirect(new URL(redirectUrl, request.url));
  response.cookies.delete('access_token');
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Lấy token từ cookie
  const token = request.cookies.get('access_token')?.value;

  // 2. Định nghĩa các nhóm route
  const isHubRoute = pathname.startsWith('/hub');
  const isHubLoginRoute = pathname === '/hub/login';

  const isTutorDashboard = pathname.startsWith('/tutors/');
  const isDashboardRoute = pathname.startsWith('/dashboard') || isTutorDashboard || pathname.startsWith('/student');
  const isStaffRoute = pathname.startsWith('/staff') || pathname.startsWith('/dashboard/admin');

  const isClientAuthRoute = pathname === '/login' || pathname === '/register';

  // 3. Xử lý bảo vệ các route nội bộ của Hub (/hub/*)
  if (isHubRoute && !isHubLoginRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/hub/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userRole = (payload as unknown as JwtPayload).role;

      if (userRole !== 'admin' && userRole !== 'staff') {
        return NextResponse.redirect(new URL('/403', request.url));
      }

      if (pathname === '/hub/dashboard' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/staff/request-management', request.url));
      }
    } catch (error) {
      if (error instanceof errors.JWTExpired) {
        return handleJWTExpired(request, '/hub/login');
      }
      console.error('Middleware Hub JWT Error:', error);
      const response = NextResponse.redirect(new URL('/hub/login', request.url));
      response.cookies.delete('access_token');
      return response;
    }
  }

  // 4. Xử lý bảo vệ các route dashboard/student/tutor
  if (isDashboardRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userRole = (payload as unknown as JwtPayload).role;

      // Chặn admin/staff khỏi route dashboard/*
      if (userRole === 'admin' || userRole === 'staff') {
        return NextResponse.redirect(new URL('/hub/dashboard', request.url));
      }

      if (pathname.startsWith('/dashboard/tutor')) {
        if (userRole !== 'tutor') {
          return NextResponse.redirect(new URL('/403', request.url));
        }
        return NextResponse.redirect(new URL('/tutors/dashboard', request.url));
      }

      // Cho phép học viên truy cập trang tìm kiếm gia sư (/tutors),
      // nhưng bảo vệ các trang con của gia sư (như /tutors/dashboard)
      if (isTutorDashboard && userRole !== 'tutor') {
        return NextResponse.redirect(new URL('/403', request.url));
      }

      if (pathname.startsWith('/student') && userRole !== 'student') {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    } catch (error) {
      if (error instanceof errors.JWTExpired) {
        return handleJWTExpired(request, '/login');
      }
      console.error('Middleware Dashboard JWT Error:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('access_token');
      return response;
    }
  }

  // 5. Xử lý bảo vệ các route /staff/*
  if (isStaffRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/hub/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userRole = (payload as unknown as JwtPayload).role;

      if (userRole !== 'admin' && userRole !== 'staff') {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    } catch (error) {
      if (error instanceof errors.JWTExpired) {
        return handleJWTExpired(request, '/hub/login');
      }
      console.error('Middleware Staff JWT Error:', error);
      const response = NextResponse.redirect(new URL('/hub/login', request.url));
      response.cookies.delete('access_token');
      return response;
    }
  }

  // 6. Đã đăng nhập nhưng truy cập các trang đăng nhập công cộng (/login, /register)
  if (isClientAuthRoute && token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userRole = (payload as unknown as JwtPayload).role;

      if (userRole === 'tutor') return NextResponse.redirect(new URL('/tutors/dashboard', request.url));
      if (userRole === 'student') return NextResponse.redirect(new URL('/student', request.url));
      if (userRole === 'admin') return NextResponse.redirect(new URL('/hub/dashboard', request.url));
      if (userRole === 'staff') return NextResponse.redirect(new URL('/staff/request-management', request.url));
    } catch {
      // Token hỏng -> cho phép ở lại trang đăng nhập để đăng nhập lại
    }
  }

  // 7. Đã đăng nhập nhưng truy cập trang đăng nhập nội bộ (/hub/login)
  if (isHubLoginRoute && token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userRole = (payload as unknown as JwtPayload).role;

      if (userRole === 'admin') return NextResponse.redirect(new URL('/hub/dashboard', request.url));
      if (userRole === 'staff') return NextResponse.redirect(new URL('/staff/request-management', request.url));
      if (userRole === 'tutor' || userRole === 'student') return NextResponse.redirect(new URL('/403', request.url));
    } catch {
      // Token hỏng -> cho phép đăng nhập lại
    }
  }

  return NextResponse.next();
}

// Áp dụng middleware cho các route phù hợp
export const config = {
  matcher: [
    '/tutors/:path+',
    '/student/:path*',
    '/dashboard/:path*',
    '/staff/:path*',
    '/hub/:path*',
    '/login',
    '/register',
  ],
};
