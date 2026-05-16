import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Phải trùng với JWT_SECRET trong backend
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Lấy token từ cookie
  const token = request.cookies.get('access_token')?.value;

  console.log(`[Middleware] Path: ${pathname}, Token found: ${!!token}`);
  // 2. Định nghĩa các route cần bảo vệ
  const isTutorRoute = pathname.startsWith('/tutors'); // Chỉ cần /tutors
  const isClassesRoute = pathname.startsWith('/classes');
  const isStudentRoute = pathname.startsWith('/student');
  const isStaffRoute = pathname.startsWith('/staff') || pathname.startsWith('/dashboard/admin');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // 3. Xử lý redirect nếu chưa đăng nhập
  if (isTutorRoute || isClassesRoute || isStaffRoute || isStudentRoute) { // These are protected routes
    if (!token) {
      console.log(`[Middleware] No token for protected route ${pathname}, redirecting to /login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      
      const userRole = (payload as any).role;
      console.log(`[Middleware] ✅ Xác thực thành công: ${pathname}, Role: ${userRole}`);

      // Phân quyền chi tiết (RBAC)
      if (isTutorRoute && userRole !== 'tutor' && userRole !== 'admin') {
        console.log(`[Middleware] 🚫 Sai Role: ${userRole} không có quyền vào Tutor Route`);
        return NextResponse.redirect(new URL('/403', request.url));
      }
      if (isStudentRoute && userRole !== 'student' && userRole !== 'admin') {
        console.log(`[Middleware] 🚫 Sai Role: ${userRole} không có quyền vào Student Route`);
        return NextResponse.redirect(new URL('/403', request.url));
      }
      if (isStaffRoute && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/403', request.url));
      }

    } catch (err: any) {
      // Xử lý lỗi xác thực JWT
      console.log(`[Middleware] ❌ JWT Verify Failed: ${err.code || err.message}`);
      console.log(`[Middleware] Secret đang dùng: ${JWT_SECRET}`);
      
      // Nếu xác thực thất bại, xóa cookie và đẩy về login
      const url = new URL('/login', request.url);
      const response = NextResponse.redirect(url);
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
        
        if (userRole === 'tutor') return NextResponse.redirect(new URL('/tutors/dashboard', request.url));
        if (userRole === 'student') return NextResponse.redirect(new URL('/student/dashboard', request.url));
        if (userRole === 'admin') return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    } catch (e) {
        // Token lỗi, để người dùng ở lại trang login
    }
  }

  // Luôn trả về next() ở cuối để cho phép các request không thuộc diện bảo vệ đi qua
  return NextResponse.next();
}

// Cập nhật matcher để bao phủ đường dẫn /tutors mới
export const config = {
  matcher: [
    '/tutors/:path*',
    '/classes/:path*',
    '/student/:path*',
    '/staff/:path*',
    '/login',
    '/register'
  ],
};
