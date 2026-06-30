import { NextResponse } from 'next/server';
import prisma from '@/libs/db';

/**
 * GET /api/calls/[id]/next-steps
 * Fetches all next steps (tasks) for a call.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const nextSteps = await prisma.nextStep.findMany({
      where: { callId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(nextSteps);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch next steps' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calls/[id]/next-steps
 * Creates a new next step task.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { title, description, dueDate } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const nextStep = await prisma.nextStep.create({
      data: {
        callId: id,
        title,
        description: description || '',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json(nextStep, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create next step' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/calls/[id]/next-steps
 * Updates next steps (e.g. toggles completion or deletes).
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { stepId, isCompleted, title, description, isDelete } = body;

    if (!stepId) {
      return NextResponse.json({ error: 'Step ID is required' }, { status: 400 });
    }

    if (isDelete) {
      await prisma.nextStep.delete({
        where: { id: stepId },
      });
      return NextResponse.json({ success: true, message: 'Next step deleted' });
    }

    const updateData: any = {};
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const updated = await prisma.nextStep.update({
      where: { id: stepId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update next step' },
      { status: 500 }
    );
  }
}
