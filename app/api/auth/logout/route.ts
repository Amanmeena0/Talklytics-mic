import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/logout`;

    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    await fetch(backendUrl, {
      method: 'POST',
      headers,
    }).catch((err) => {
      console.warn('Failed to contact backend for logout, clearing local session anyway:', err);
    });

    const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
    
    // Explicitly clear all session cookies
    response.cookies.set('access_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('refresh_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('active_user_email', '', { path: '/', maxAge: 0 });

    return response;
  } catch (error: any) {
    const response = NextResponse.json({ success: true, message: 'Logged out.' });
    response.cookies.set('access_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('refresh_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('active_user_email', '', { path: '/', maxAge: 0 });
    return response;
  }
}
