import { NextRequest, NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Clear the authentication cookie
    const cookie = clearTokenCookie();
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );

    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 