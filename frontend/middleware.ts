import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Phải trùng với JWT_SECRET trong backend
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Lấy token từ cookie
  const token = request.cookies.get('access_token')?.value;

  // 2. Định nghĩa các nhóm route
  const isHubRoute = pathname.startsWith('/hub');
  const isHubLoginRoute = pathname === '/hub/login';
  
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isStaffRoute = pathname.startsWith('/staff');
  
  const isClientAuthRoute = pathname === '/login' || pathname === '/register';

  // 3. Xử lý bảo vệ các route nội bộ của Hub (/hub/*)
  if (isHubRoute && !isHubLoginRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/hub/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userRole = (payload as any).role;

      // Chỉ có admin hoặc staff mới được vào cổng nội bộ
      if (userRole !== 'admin' && userRole !== 'staff') {
        return NextResponse.redirect(new URL('/403', request.url));
      }

      // Trang Admin Dashboard chỉ cho phép role admin
      if (pathname === '/hub/dashboard' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/hub/request-management', request.url));
      }
    } catch (error) {
      console.error('Middleware Hub JWT Error:', error);
      const response = NextResponse.redirect(new URL('/hub/login', request.url));
      response.cookies.delete('access_token');
      return response;
    }
  }

  // 4. Xử lý bảo vệ các route /staff/*
  if (isStaffRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/hub/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userRole = (payload as any).role;

      if (userRole !== 'admin' && userRole !== 'staff') {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    } catch (error) {
      console.error('Middleware Staff JWT Error:', error);
      const response = NextResponse.redirect(new URL('/hub/login', request.url));
      response.cookies.delete('access_token');
      return response;
    }
  }

  // 5. Xử lý bảo vệ các route /dashboard/*
  if (isDashboardRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userRole = (payload as any).role;

      if (pathname.startsWith('/dashboard/tutor') && userRole !== 'tutor') {
        return NextResponse.redirect(new URL('/403', request.url));
      }
      if (pathname.startsWith('/dashboard/student') && userRole !== 'student') {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    } catch (error) {
      console.error('Middleware Dashboard JWT Error:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('access_token');
      return response;
    }
  }

  // 6. Đã đăng nhập nhưng truy cập các trang đăng nhập công cộng (/login, /register)
  if (isClientAuthRoute && token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userRole = (payload as any).role;
      
      if (userRole === 'tutor') return NextResponse.redirect(new URL('/dashboard/tutor', request.url));
      if (userRole === 'student') return NextResponse.redirect(new URL('/dashboard/student', request.url));
      if (userRole === 'admin') return NextResponse.redirect(new URL('/hub/dashboard', request.url));
      if (userRole === 'staff') return NextResponse.redirect(new URL('/hub/request-management', request.url));
    } catch {
      // Token hỏng -> cho phép ở lại trang đăng nhập để đăng nhập lại
    }
  }

  // 7. Đã đăng nhập nhưng truy cập trang đăng nhập nội bộ (/hub/login)
  if (isHubLoginRoute && token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userRole = (payload as any).role;
      
      if (userRole === 'admin') return NextResponse.redirect(new URL('/hub/dashboard', request.url));
      if (userRole === 'staff') return NextResponse.redirect(new URL('/hub/request-management', request.url));
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
    '/dashboard/:path*',
    '/staff/:path*',
    '/hub/:path*',
    '/login',
    '/register'
  ],
};
