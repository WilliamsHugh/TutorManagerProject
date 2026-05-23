import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Create response
  const response = NextResponse.json({ success: true });

  // Clear the HttpOnly cookie by setting it to expire
  // The cookie name is 'access_token' as seen in auth.ts
  response.cookies.set({
    name: 'access_token',
    value: '',
    httpOnly: true,
    path: '/',
    expires: new Date(0), // Expire immediately
  });

  return response;
}