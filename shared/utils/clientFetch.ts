/**
 * Centralized client fetch wrapper with automatic JWT token refresh interceptor.
 * If any backend request returns a 401 Unauthorized status, it will intercept it,
 * call the Next.js BFF refresh token endpoint, and retry the request if successful.
 * If refresh fails, it will redirect the user to the login page.
 */
export async function clientFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Execute original request
  let response = await fetch(input, init);

  // Intercept 401 Unauthorized errors
  if (response.status === 401) {
    try {
      // Call Next.js BFF refresh token route
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
      });

      if (refreshRes.ok) {
        // Refresh succeeded, retry original request
        // The browser will automatically attach the new cookies
        response = await fetch(input, init);
      } else {
        // Refresh failed (expired or revoked), redirect to login
        if (typeof window !== 'undefined') {
          // Prevent infinite redirect loops if we are already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          }
        }
      }
    } catch (error) {
      console.error('[clientFetch] Interceptor refresh failed:', error);
      if (typeof window !== 'undefined') {
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    }
  }

  return response;
}

export default clientFetch;
