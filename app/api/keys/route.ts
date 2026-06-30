import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/libs/db';

/**
 * GET /api/keys
 * Fetches API keys for the current active user.
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

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(apiKeys);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/keys
 * Generates a new API key for the active user.
 */
export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

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

    // Generate a secure API key
    const rawKey = `CS-key-${crypto.randomBytes(24).toString('hex')}`;

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name,
        key: rawKey,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'API_KEY_GENERATE',
        details: `Generated API key named "${name}"`,
      },
    });

    return NextResponse.json(apiKey, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate API key' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/keys
 * Revokes/deletes an API key.
 */
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

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

    const key = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!key || key.userId !== user.id) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await prisma.apiKey.delete({
      where: { id },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'API_KEY_REVOKE',
        details: `Revoked API key named "${key.name}"`,
      },
    });

    return NextResponse.json({ success: true, message: 'API key successfully revoked' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
