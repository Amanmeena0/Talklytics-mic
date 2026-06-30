import { NextResponse } from 'next/server';
import prisma from '@/libs/db';

/**
 * GET /api/calls/[id]
 * Fetches a single call with its records, comments, next steps, and sales rep details.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const call = await prisma.call.findUnique({
      where: { id },
      include: {
        salesRep: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
        records: {
          orderBy: { timestamp: 'asc' },
        },
        nextSteps: {
          orderBy: { createdAt: 'desc' },
        },
        comments: {
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
        },
      },
    });

    if (!call || call.isSoftDeleted) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    // Convert records' buyingSignals/hesitations/detectedIntents back to JSON objects (arrays)
    const formattedRecords = call.records.map((r) => ({
      ...r,
      buying_signals: JSON.parse(r.buyingSignals),
      hesitations: JSON.parse(r.hesitations),
      detected_intents: JSON.parse(r.detectedIntents),
    }));

    const formattedCall = {
      ...call,
      records: formattedRecords,
    };

    return NextResponse.json(formattedCall);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch call details' }, { status: 500 });
  }
}

/**
 * PUT/PATCH /api/calls/[id]
 * Updates call properties (isFavorite, title, clientName, summary, BANT fields).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedUpdates = [
      'title',
      'clientName',
      'isFavorite',
      'summary',
      'bantBudget',
      'bantBudgetMet',
      'bantAuthority',
      'bantAuthorityMet',
      'bantNeed',
      'bantNeedMet',
      'bantTimeline',
      'bantTimelineMet',
    ];

    const data: any = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        data[key] = body[key];
      }
    }

    const updatedCall = await prisma.call.update({
      where: { id },
      data,
    });

    // Write audit log
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    const activeUserEmail = cookieStore.get('active_user_email')?.value || 'jane.smith@convincesense.com';
    const user = await prisma.user.findUnique({ where: { email: activeUserEmail } });
    
    await prisma.auditLog.create({
      data: {
        userId: user?.id || null,
        action: 'CALL_UPDATE',
        details: `Updated call properties for call ID ${id}. Changed fields: ${Object.keys(data).join(', ')}`,
      },
    });

    return NextResponse.json(updatedCall);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update call' }, { status: 500 });
  }
}

/**
 * DELETE /api/calls/[id]
 * Performs a soft-delete on a call.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Perform soft delete
    const call = await prisma.call.update({
      where: { id },
      data: { isSoftDeleted: true },
    });

    // Write audit log
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    const activeUserEmail = cookieStore.get('active_user_email')?.value || 'jane.smith@convincesense.com';
    const user = await prisma.user.findUnique({ where: { email: activeUserEmail } });

    await prisma.auditLog.create({
      data: {
        userId: user?.id || null,
        action: 'CALL_DELETE',
        details: `Soft deleted call: ${call.title} (${id})`,
      },
    });

    return NextResponse.json({ success: true, message: 'Call deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete call' }, { status: 500 });
  }
}
