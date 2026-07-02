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
      if (res.status === 404) {
        return NextResponse.json({ error: 'Call not found' }, { status: 404 });
      }
      throw new Error(`Backend returned status ${res.status}`);
    }

    const call = await res.json();
    const records = call.records || [];
    
    // Calculate fields dynamically
    const duration = records.length > 0 ? Math.max(...records.map((r: any) => r.timestamp)) : 0;
    const averageScore = records.length > 0 
      ? parseFloat((records.reduce((sum: number, r: any) => sum + r.score, 0) / records.length).toFixed(2))
      : 0;
    const averageEnergy = records.length > 0 
      ? parseFloat((records.reduce((sum: number, r: any) => sum + r.energy, 0) / records.length).toFixed(2))
      : 0;
    const averageConfidence = records.length > 0 
      ? parseFloat((records.reduce((sum: number, r: any) => sum + r.confidence, 0) / records.length).toFixed(2))
      : 0;
      
    let overallSentiment = 'Neutral';
    if (records.length > 0) {
      const freq: Record<string, number> = {};
      records.forEach((r: any) => {
        freq[r.sentiment] = (freq[r.sentiment] || 0) + 1;
      });
      let max = 0;
      Object.entries(freq).forEach(([k, v]) => {
        if (v > max) {
          max = v;
          overallSentiment = k;
        }
      });
    }
    
    let bantBudgetMet = false;
    let bantAuthorityMet = false;
    let bantNeedMet = false;
    let bantTimelineMet = false;
    
    records.forEach((r: any) => {
      const txt = r.transcript.toLowerCase();
      const intents = (r.detected_intents || []).map((i: string) => i.toUpperCase());
      if (intents.includes('PRICING') || txt.includes('price') || txt.includes('budget')) bantBudgetMet = true;
      if (txt.includes('decision') || txt.includes('approve') || txt.includes('authority')) bantAuthorityMet = true;
      if (intents.includes('INFORMATION') || txt.includes('need') || txt.includes('want')) bantNeedMet = true;
      if (intents.includes('COMMITMENT') || txt.includes('timeline') || txt.includes('schedule')) bantTimelineMet = true;
    });
    
    let clientName = 'Prospective Client';
    let displayTitle = call.title;
    if (call.title && call.title.includes(' - ')) {
      const parts = call.title.split(' - ');
      displayTitle = parts[0];
      clientName = parts.slice(1).join(' - ');
    }

    const formattedCall = {
      id: String(call.id),
      title: displayTitle,
      clientName,
      date: call.created_at,
      duration,
      status: 'COMPLETED',
      overallSentiment,
      averageScore,
      averageEnergy,
      averageConfidence,
      conversionProbability: Math.min(100, Math.max(0, Math.round(averageScore * 20))),
      summary: call.summary || '',
      isFavorite: call.is_favorite,
      isSoftDeleted: call.is_deleted,
      bantBudget: bantBudgetMet ? 'Pricing Discussion Detected' : 'No Budget Details',
      bantBudgetMet,
      bantAuthority: bantAuthorityMet ? 'Commitment Signals Found' : 'Authority Unverified',
      bantAuthorityMet,
      bantNeed: bantNeedMet ? 'Active Inquiry Detected' : 'No Clear Need',
      bantNeedMet,
      bantTimeline: bantTimelineMet ? 'Urgency Indicators Present' : 'No Timeline Discussed',
      bantTimelineMet,
      records: records.map((r: any) => ({
        ...r,
        id: String(r.id),
        callId: String(r.call_id),
        buying_signals: r.buying_signals || [],
        hesitations: r.hesitations || [],
        detected_intents: r.detected_intents || [],
      })),
      nextSteps: (call.next_steps || []).map((n: any) => ({
        id: String(n.id),
        callId: String(n.call_id),
        title: n.content,
        description: '',
        isCompleted: n.completed,
        dueDate: n.due_date,
        createdAt: n.created_at,
      })),
      comments: (call.comments || []).map((c: any) => ({
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
      })),
      salesRep: {
        id: '1',
        name: 'Default Sales Rep',
        email: 'salesrep@convincesense.com',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      }
    };

    return NextResponse.json(formattedCall);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch call' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const callId = parseInt(id, 10);
    const body = await request.json();

    // Map updates
    const updatePayload: any = {};
    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.isFavorite !== undefined) updatePayload.is_favorite = body.isFavorite;
    if (body.summary !== undefined) updatePayload.summary = body.summary;

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/calls/${callId}`;
    const res = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CONVINCESENSE_API_KEY || '',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const updated = await res.json();
    return NextResponse.json({
      ...updated,
      id: String(updated.id),
      isFavorite: updated.is_favorite,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update call' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const callId = parseInt(id, 10);

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/calls/${callId}`;
    const res = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'x-api-key': process.env.CONVINCESENSE_API_KEY || '',
      },
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    return NextResponse.json({ success: true, message: 'Call deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete call' }, { status: 500 });
  }
}
