import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Phải trùng với JWT_SECRET trong backend
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Lấy token từ cookie
  const token = request.cookies.get('access_token')?.value;

  // 2. Định nghĩa các route cần bảo vệ
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isStaffRoute = pathname.startsWith('/staff') || pathname.startsWith('/dashboard/admin');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // 3. Xử lý redirect nếu chưa đăng nhập
  if (isDashboardRoute || isStaffRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Xác thực token (Optional: có thể bỏ qua bước này nếu chỉ muốn check existence, 
      // nhưng verify thì an toàn hơn)
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      
      const userRole = (payload as any).role;

      // Phân quyền chi tiết (RBAC)
      if (pathname.startsWith('/dashboard/tutor') && userRole !== 'tutor') {
        return NextResponse.redirect(new URL('/403', request.url));
      }
      if (pathname.startsWith('/dashboard/student') && userRole !== 'student') {
        return NextResponse.redirect(new URL('/403', request.url));
      }
      if (isStaffRoute && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/403', request.url));
      }

    } catch (error) {
      // Token không hợp lệ hoặc hết hạn
      console.error('Middleware JWT Error:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('access_token');
      return response;
    }
  }

  // 4. Nếu đã đăng nhập mà cố vào trang login/register -> redirect về dashboard
  if (isAuthRoute && token) {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const userRole = (payload as any).role;
        
        if (userRole === 'tutor') return NextResponse.redirect(new URL('/dashboard/tutor', request.url));
        if (userRole === 'student') return NextResponse.redirect(new URL('/dashboard/student', request.url));
        if (userRole === 'admin') return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    } catch {
        // Token lỗi -> cho phép ở lại trang auth để login lại
    }
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các route cụ thể để tối ưu hiệu năng
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/staff/:path*',
    '/login',
    '/register'
  ],
};
