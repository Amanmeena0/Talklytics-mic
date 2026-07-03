import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const callId = parseInt(id, 10);

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/calls/${callId}`;
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    const headers: Record<string, string> = {
      'x-api-key': process.env.CONVINCESENSE_API_KEY || '',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(backendUrl, {
      headers,
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const call = await res.json();
    const nextSteps = (call.next_steps || []).map((n: any) => ({
      id: String(n.id),
      callId: String(n.call_id),
      title: n.content,
      description: '',
      isCompleted: n.completed,
      dueDate: n.due_date,
      createdAt: n.created_at,
    }));

    return NextResponse.json(nextSteps);
  } catch (error: any) {
    const match = error.message?.match(/Backend returned status (\d+)/);
    const status = match ? parseInt(match[1], 10) : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to fetch next steps' },
      { status }
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const callId = parseInt(id, 10);
    const body = await request.json();

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/calls/${callId}/next-steps`;
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CONVINCESENSE_API_KEY || '',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: body.title,
        completed: false,
        due_date: body.dueDate || null,
      }),
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const nextStep = await res.json();
    return NextResponse.json(
      {
        id: String(nextStep.id),
        callId: String(nextStep.call_id),
        title: nextStep.content,
        description: '',
        isCompleted: nextStep.completed,
        dueDate: nextStep.due_date,
        createdAt: nextStep.created_at,
      },
      { status: 201 }
    );
  } catch (error: any) {
    const match = error.message?.match(/Backend returned status (\d+)/);
    const status = match ? parseInt(match[1], 10) : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to create next step' },
      { status }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const callId = parseInt(id, 10);
    const body = await request.json();
    const { stepId, isCompleted, title, isDelete } = body;

    if (!stepId) {
      return NextResponse.json({ error: 'Step ID is required' }, { status: 400 });
    }

    const nextStepId = parseInt(stepId, 10);

    if (isDelete) {
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/calls/${callId}/next-steps/${nextStepId}`;
      const { cookies } = require('next/headers');
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('access_token')?.value;

      const headers: Record<string, string> = {
        'x-api-key': process.env.CONVINCESENSE_API_KEY || '',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const res = await fetch(backendUrl, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        throw new Error(`Backend returned status ${res.status}`);
      }

      return NextResponse.json({ success: true, message: 'Next step deleted successfully' });
    }

    // Otherwise perform patch
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/calls/${callId}/next-steps`;
    const patchPayload: any = { id: nextStepId };
    if (isCompleted !== undefined) patchPayload.completed = isCompleted;
    if (title !== undefined) patchPayload.content = title;

    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CONVINCESENSE_API_KEY || '',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(backendUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(patchPayload),
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const nextStep = await res.json();
    return NextResponse.json({
      id: String(nextStep.id),
      callId: String(nextStep.call_id),
      title: nextStep.content,
      description: '',
      isCompleted: nextStep.completed,
      dueDate: nextStep.due_date,
      createdAt: nextStep.created_at,
    });
  } catch (error: any) {
    const match = error.message?.match(/Backend returned status (\d+)/);
    const status = match ? parseInt(match[1], 10) : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to update next step' },
      { status }
    );
  }
}
