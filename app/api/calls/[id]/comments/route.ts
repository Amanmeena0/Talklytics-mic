import { NextResponse } from 'next/server';
import prisma from '@/libs/db';

/**
 * GET /api/calls/[id]/comments
 * Fetches comments for a call.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await prisma.callComment.findMany({
      where: { callId: id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calls/[id]/comments
 * Posts a comment on a call.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { content, timestamp } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    // Get active user
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    const activeUserEmail =
      cookieStore.get('active_user_email')?.value || 'jane.smith@convincesense.com';

    let user = await prisma.user.findUnique({
      where: { email: activeUserEmail },
    });

    if (!user) {
      user = await prisma.user.findFirst();
    }

    const comment = await prisma.callComment.create({
      data: {
        callId: id,
        authorId: user!.id,
        content,
        timestamp: timestamp !== undefined ? parseFloat(timestamp) : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user?.id || null,
        action: 'COMMENT_CREATE',
        details: `Added review comment on call ID ${id}`,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add comment' }, { status: 500 });
  }
}
