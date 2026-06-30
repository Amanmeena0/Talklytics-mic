import { NextResponse } from 'next/server';
import prisma from '@/libs/db';

/**
 * GET /api/notifications
 * Returns user notifications.
 */
export async function GET() {
  try {
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    const activeUserEmail =
      cookieStore.get('active_user_email')?.value || 'jane.smith@convincesense.com';

    const user = await prisma.user.findUnique({
      where: { email: activeUserEmail },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Marks notifications as read or deletes them.
 */
export async function PATCH(request: Request) {
  try {
    const { id, read, all, clearAll } = await request.json();
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    const activeUserEmail =
      cookieStore.get('active_user_email')?.value || 'jane.smith@convincesense.com';

    const user = await prisma.user.findUnique({
      where: { email: activeUserEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (clearAll) {
      await prisma.notification.deleteMany({
        where: { userId: user.id },
      });
      return NextResponse.json({ success: true, message: 'All notifications cleared' });
    }

    if (all && read !== undefined) {
      await prisma.notification.updateMany({
        where: { userId: user.id },
        data: { read },
      });
      return NextResponse.json({ success: true, message: 'All notifications updated' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { read },
    });

    return NextResponse.json(notification);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}
