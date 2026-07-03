import { NextResponse } from 'next/server';

const defaultUser = {
  id: '1',
  name: 'Jane Smith',
  email: 'jane.smith@talklytics.com',
  role: 'SALES_REP',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
};

const users = [
  defaultUser,
  {
    id: '2',
    name: 'Michael Scott',
    email: 'michael.scott@talklytics.com',
    role: 'MANAGER',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@talklytics.com',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
  },
];

export async function GET(request: Request) {
  try {
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (accessToken) {
      // Fetch user profile from FastAPI backend
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/users/me`;
      try {
        const res = await fetch(backendUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          const backendUser = await res.json();
          // Normalize backend user model to frontend schema if needed
          return NextResponse.json({
            id: String(backendUser.id || backendUser.uuid || '1'),
            name: backendUser.name || backendUser.username || 'Jane Smith',
            email: backendUser.email || 'jane.smith@talklytics.com',
            role: backendUser.role || 'SALES_REP',
            avatarUrl: backendUser.avatarUrl || defaultUser.avatarUrl,
          });
        }
      } catch (err) {
        console.warn('Could not fetch user from backend, falling back to mock user:', err);
      }
    }

    // Fallback: Read switch user cookie for local demo compatibility
    const activeUserEmail = cookieStore.get('active_user_email')?.value;

    if (!accessToken && !activeUserEmail) {
      return NextResponse.json(null);
    }

    const user = users.find((u) => u.email === activeUserEmail) || defaultUser;
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, user });

    // Set cookie to persist active user
    response.cookies.set('active_user_email', email, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to switch user' }, { status: 500 });
  }
}
