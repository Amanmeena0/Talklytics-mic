import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Proxy health check to the FastAPI backend at http://127.0.0.1:8000/health
 */
export async function GET() {
  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/health`;
    const res = await fetch(backendUrl, {
      signal: AbortSignal.timeout(1500), // Quick timeout
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ online: true, ...data });
    }
    return NextResponse.json({ online: false, status: res.status }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ online: false, error: 'FastAPI server offline' }, { status: 503 });
  }
}
