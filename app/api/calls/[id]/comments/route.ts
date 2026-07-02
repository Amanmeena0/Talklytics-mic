import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const callId = parseInt(id, 10);
    
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/calls/${callId}`;
    const res = await fetch(backendUrl, {
      headers: {
        'x-api-key': process.env.CONVINCESENSE_API_KEY || '',
      },
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const call = await res.json();
    const comments = (call.comments || []).map((c: any) => ({
      id: String(c.id),
      callId: String(c.call_id),
      content: c.content,
      timestamp: null,
      createdAt: c.created_at,
      author: {
        id: '1',
        name: 'Default Sales Rep',
        email: 'salesrep@convincesense.com',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      }
    }));

    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const callId = parseInt(id, 10);
    const body = await request.json();

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/calls/${callId}/comments`;
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CONVINCESENSE_API_KEY || '',
      },
      body: JSON.stringify({
        content: body.content,
      }),
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const comment = await res.json();
    return NextResponse.json({
      id: String(comment.id),
      callId: String(comment.call_id),
      content: comment.content,
      createdAt: comment.created_at,
      author: {
        id: '1',
        name: 'Default Sales Rep',
        email: 'salesrep@convincesense.com',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      }
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to post comment' }, { status: 500 });
  }
}
