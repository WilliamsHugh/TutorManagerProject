import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Xóa access_token cookie (httpOnly version - set by backend)
  response.cookies.set({
    name: 'access_token',
    value: '',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    expires: new Date(0),
  });

  // Xóa access_token cookie (non-httpOnly version - set by document.cookie in LoginForm)
  response.cookies.set({
    name: 'access_token',
    value: '',
    httpOnly: false,
    path: '/',
    sameSite: 'lax',
    expires: new Date(0),
  });

  // Xóa refresh_token cookie (httpOnly, path=/)
  response.cookies.set({
    name: 'refresh_token',
    value: '',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    expires: new Date(0),
  });

  // Xóa refresh_token cookie (httpOnly, path=/api/auth/refresh — set by backend)
  response.cookies.set({
    name: 'refresh_token',
    value: '',
    httpOnly: true,
    path: '/api/auth/refresh',
    sameSite: 'lax',
    expires: new Date(0),
  });

  return response;
}