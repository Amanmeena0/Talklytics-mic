import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected pages that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/calls', '/analytics', '/settings'];
// Authentication pages
const AUTH_PAGES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Determine if the route is protected or an auth page
  const isProtectedPath = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  const isAuthPath = AUTH_PAGES.some(path => pathname === path);

  // If not a protected path and not an auth path, let the request proceed normally
  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (isProtectedPath) {
    // 1. If access token is present, allow access
    if (accessToken) {
      return NextResponse.next();
    }

    // 2. If access token is missing but refresh token is present, attempt silent refresh
    if (refreshToken) {
      try {
        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/refresh`;
        const refreshRes = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Cookie': `refresh_token=${refreshToken}`,
          },
        });

        if (refreshRes.ok) {
          // Token refresh succeeded!
          const response = NextResponse.next();
          
          // Propagate Set-Cookie headers from backend response to the client response
          const setCookies = refreshRes.headers.getSetCookie();
          for (const cookie of setCookies) {
            response.headers.append('set-cookie', cookie);
          }
          
          return response;
        }
      } catch (err) {
        console.error('[Middleware] Silent refresh error:', err);
      }
    }

    // 3. Unauthenticated: Redirect to login page
    const loginUrl = new URL('/login', request.url);
    // Keep track of the original page to redirect back after successful login
    loginUrl.searchParams.set('redirect', pathname);
    
    const response = NextResponse.redirect(loginUrl);
    // Clean up stale cookies if authentication failed
    response.cookies.set('access_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('refresh_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('active_user_email', '', { path: '/', maxAge: 0 });
    return response;
  }

  if (isAuthPath) {
    // If user has an access token, they are authenticated -> redirect to dashboard
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If access token is missing but refresh token is present, attempt refresh
    if (refreshToken) {
      try {
        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/refresh`;
        const refreshRes = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Cookie': `refresh_token=${refreshToken}`,
          },
        });

        if (refreshRes.ok) {
          // User is authenticated -> redirect to dashboard
          const response = NextResponse.redirect(new URL('/dashboard', request.url));
          const setCookies = refreshRes.headers.getSetCookie();
          for (const cookie of setCookies) {
            response.headers.append('set-cookie', cookie);
          }
          return response;
        }
      } catch (err) {
        console.error('[Middleware] Silent refresh error on auth page:', err);
      }
    }

    // Otherwise, allow them to view login/register pages
    return NextResponse.next();
  }
}

// Configure middleware matching paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/calls/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/login',
    '/register'
  ]
};
