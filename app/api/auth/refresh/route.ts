import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token available' }, { status: 401 });
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/refresh`;

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    if (!res.ok) {
      // Clear cookies on response if refresh failed to log user out cleanly
      const errorData = await res.json().catch(() => ({}));
      const response = NextResponse.json(
        { error: errorData.detail || 'Token refresh failed', success: false },
        { status: res.status }
      );
      response.cookies.set('access_token', '', { path: '/', maxAge: 0 });
      response.cookies.set('refresh_token', '', { path: '/', maxAge: 0 });
      response.cookies.set('active_user_email', '', { path: '/', maxAge: 0 });
      return response;
    }

    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });

    // Propagate Set-Cookie headers
    const setCookies = res.headers.getSetCookie();
    for (const cookie of setCookies) {
      // Strip domain attribute to allow setting cookie on the frontend domain
      const cleanCookie = cookie.replace(/domain=[^;]+;?/i, '').trim();
      response.headers.append('set-cookie', cleanCookie);
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Token refresh failed' }, { status: 500 });
  }
}
