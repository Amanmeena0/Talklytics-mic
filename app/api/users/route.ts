import { NextResponse } from 'next/server';
import prisma from '@/libs/db';

/**
 * GET /api/users
 * Returns the current active user profile.
 * Supporting user-switching via cookie 'active_user_email' for simulation of roles/permissions.
 */
export async function GET(request: Request) {
  try {
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    const activeUserEmail =
      cookieStore.get('active_user_email')?.value || 'jane.smith@convincesense.com';

    let user = await prisma.user.findUnique({
      where: { email: activeUserEmail },
    });

    // Fallback if user doesn't exist
    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No users found in database. Seed the database first.' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch user' }, { status: 500 });
  }
}

/**
 * POST /api/users/switch
 * Switch the active user (for SaaS demonstration).
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 44 });
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
