import { apiSuccess, apiError, handleApiCatch } from '@/shared/utils/api';
import { 
  calculateAverage, 
  calculateDuration, 
  determineDominantSentiment, 
  evaluateBantCriteria, 
  parseClientName 
} from '@/features/calls/utils/metrics';

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
        return apiError('Call not found', 404, 'CALL_NOT_FOUND');
      }
      throw new Error(`Backend returned status ${res.status}`);
    }

    const call = await res.json();
    const records = call.records || [];
    
    // Calculate fields dynamically using extracted utility functions
    const duration = calculateDuration(records);
    const averageScore = calculateAverage(records, 'score');
    const averageEnergy = calculateAverage(records, 'energy');
    const averageConfidence = calculateAverage(records, 'confidence');
    const overallSentiment = determineDominantSentiment(records);
    const bant = evaluateBantCriteria(records);
    const clientTitleInfo = parseClientName(call.title);

    const formattedCall = {
      id: String(call.id),
      title: clientTitleInfo.title,
      clientName: clientTitleInfo.clientName,
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
      bantBudget: bant.bantBudget,
      bantBudgetMet: bant.bantBudgetMet,
      bantAuthority: bant.bantAuthority,
      bantAuthorityMet: bant.bantAuthorityMet,
      bantNeed: bant.bantNeed,
      bantNeedMet: bant.bantNeedMet,
      bantTimeline: bant.bantTimeline,
      bantTimelineMet: bant.bantTimelineMet,
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

    return apiSuccess(formattedCall);
  } catch (error: any) {
    return handleApiCatch(error);
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
    return apiSuccess({
      ...updated,
      id: String(updated.id),
      isFavorite: updated.is_favorite,
    });
  } catch (error: any) {
    return handleApiCatch(error);
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

    return apiSuccess({ success: true, message: 'Call deleted successfully' });
  } catch (error: any) {
    return handleApiCatch(error);
  }
}
