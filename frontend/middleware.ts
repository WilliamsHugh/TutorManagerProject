import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify, decodeJwt, errors } from 'jose';

// Phải trùng với JWT_SECRET trong backend
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
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

  // Helper: xử lý lỗi token (không có token hoặc token sai)
  const handleTokenError = (redirectUrl: string) => {
    console.warn(`[Middleware] No token or invalid token — redirecting to ${redirectUrl}`);
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));
    clearTokenCookies(response);
    return response;
  };

  // Helper: xác thực token và trả về payload
  // - Nếu token hợp lệ → trả về payload
  // - Nếu token hết hạn nhưng chữ ký đúng → vẫn trả về payload (client-side interceptor sẽ refresh)
  // - Nếu token không hợp lệ / không có token → trả về null (redirect login)
  const verifyToken = async () => {
    if (!token) return null;
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      return payload as unknown as JwtPayload;
    } catch (error) {
      // Token hết hạn nhưng chữ ký đúng → cho phép vào trang
      // Client-side interceptor.ts sẽ tự động refresh token khi gọi API
      if (error instanceof errors.JWTExpired) {
        const decoded = decodeJwt(token);
        return decoded as unknown as JwtPayload;
      }
      return null;
    }
  };

  // Helper: xác thực token nghiêm ngặt (không chấp nhận token hết hạn)
  const verifyTokenStrict = async () => {
    if (!token) return null;
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      return payload as unknown as JwtPayload;
    } catch {
      return null;
    }
  };

  // Helper: xóa cookie token
  const clearTokenCookies = (response: NextResponse) => {
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
  };

  // 3. Xử lý bảo vệ các route nội bộ của Hub (/hub/*)
  if (isHubRoute && !isHubLoginRoute) {
    const payload = await verifyToken();

    if (!payload) {
      return handleTokenError('/hub/login');
    }

    if (payload.role !== 'admin' && payload.role !== 'staff') {
      return NextResponse.redirect(new URL('/403', request.url));
    }

    if (pathname === '/hub/dashboard' && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/staff/request-management', request.url));
    }
  }

  // 4. Xử lý bảo vệ các route dashboard/student/tutor
  if (isDashboardRoute) {
    const payload = await verifyToken();

    if (!payload) {
      return handleTokenError('/login');
    }

    // Chặn admin/staff khỏi route dashboard/*
    if (payload.role === 'admin' || payload.role === 'staff') {
      return NextResponse.redirect(new URL('/hub/dashboard', request.url));
    }

    if (pathname.startsWith('/dashboard/tutor')) {
      if (payload.role !== 'tutor') {
        return NextResponse.redirect(new URL('/403', request.url));
      }
      return NextResponse.redirect(new URL('/tutors/dashboard', request.url));
    }

    if (isTutorDashboard && payload.role !== 'tutor') {
      return NextResponse.redirect(new URL('/403', request.url));
    }

    if (pathname.startsWith('/student') && payload.role !== 'student') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }

  // 5. Xử lý bảo vệ các route /staff/*
  if (isStaffRoute) {
    const payload = await verifyToken();

    if (!payload) {
      return handleTokenError('/hub/login');
    }

    if (payload.role !== 'admin' && payload.role !== 'staff') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }

  // 6. Đã đăng nhập nhưng truy cập các trang đăng nhập công cộng (/login, /register)
  if (isClientAuthRoute && token) {
    const payload = await verifyTokenStrict();

    if (payload) {
      if (payload.role === 'tutor') return NextResponse.redirect(new URL('/tutors/dashboard', request.url));
      if (payload.role === 'student') return NextResponse.redirect(new URL('/student', request.url));
      if (payload.role === 'admin') return NextResponse.redirect(new URL('/hub/dashboard', request.url));
      if (payload.role === 'staff') return NextResponse.redirect(new URL('/staff/request-management', request.url));
    } else {
      const response = NextResponse.next();
      clearTokenCookies(response);
      return response;
    }
  }

  // 7. Đã đăng nhập nhưng truy cập trang đăng nhập nội bộ (/hub/login)
  if (isHubLoginRoute && token) {
    const payload = await verifyTokenStrict();

    if (payload) {
      if (payload.role === 'admin') return NextResponse.redirect(new URL('/hub/dashboard', request.url));
      if (payload.role === 'staff') return NextResponse.redirect(new URL('/staff/request-management', request.url));
      if (payload.role === 'tutor' || payload.role === 'student') return NextResponse.redirect(new URL('/403', request.url));
    } else {
      const response = NextResponse.next();
      clearTokenCookies(response);
      return response;
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
