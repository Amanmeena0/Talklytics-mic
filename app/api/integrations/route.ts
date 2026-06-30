import { NextResponse } from 'next/server';
import prisma from '@/libs/db';

/**
 * GET /api/integrations
 * Returns all integrations.
 */
export async function GET() {
  try {
    const integrations = await prisma.integration.findMany({
      orderBy: { name: 'asc' },
    });

    const parsed = integrations.map((integration: any) => ({
      ...integration,
      config: JSON.parse(integration.config || '{}'),
    }));

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/integrations
 * Toggles integration connection status or updates configuration.
 */
export async function PUT(request: Request) {
  try {
    const { name, connected, config } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Integration name is required' }, { status: 400 });
    }

    const data: any = {};
    if (connected !== undefined) {
      data.connected = connected;
    }
    if (config !== undefined) {
      data.config = JSON.stringify(config);
    }

    const integration = await prisma.integration.update({
      where: { name },
      data,
    });

    // Write audit log
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    const activeUserEmail =
      cookieStore.get('active_user_email')?.value || 'jane.smith@convincesense.com';
    const user = await prisma.user.findUnique({ where: { email: activeUserEmail } });

    await prisma.auditLog.create({
      data: {
        userId: user?.id || null,
        action: connected ? 'INTEGRATION_CONNECT' : 'INTEGRATION_DISCONNECT',
        details: `${connected ? 'Connected' : 'Disconnected'} integration: ${name}`,
      },
    });

    return NextResponse.json({
      ...integration,
      config: JSON.parse(integration.config || '{}'),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update integration' },
      { status: 500 }
    );
  }
}
