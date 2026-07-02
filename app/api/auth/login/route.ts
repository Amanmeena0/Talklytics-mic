import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/login`;

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });

    // Propagate Set-Cookie headers
    const setCookies = res.headers.getSetCookie();
    for (const cookie of setCookies) {
      response.headers.append('set-cookie', cookie);
    }

    // Fallback: If for some reason the backend didn't set cookies but returned tokens in body, set them manually
    if (res.ok && data.access_token && setCookies.length === 0) {
      response.cookies.set('access_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15, // 15 minutes
      });
      if (data.refresh_token) {
        response.cookies.set('refresh_token', data.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
