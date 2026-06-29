import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Create response
  const response = NextResponse.json({ success: true });

  // Clear access_token cookie
  response.cookies.set({
    name: 'access_token',
    value: '',
    httpOnly: true,
    path: '/',
    expires: new Date(0),
  });

  // Clear refresh_token cookie
  response.cookies.set({
    name: 'refresh_token',
    value: '',
    httpOnly: true,
    path: '/',
    expires: new Date(0),
  });

  return response;
}