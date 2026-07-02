import { apiSuccess, apiError, handleApiCatch } from '@/shared/utils/api';
import { 
  calculateAverage, 
  calculateDuration, 
  determineDominantSentiment, 
  evaluateBantCriteria, 
  parseClientName 
} from '@/features/calls/utils/metrics';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const query = searchParams.get('query') || '';
    const sentiment = searchParams.get('sentiment');
    const minScore = searchParams.get('minScore') ? parseFloat(searchParams.get('minScore')!) : null;
    const isFavorite = searchParams.get('isFavorite') === 'true' ? true : undefined;
    const sortBy = searchParams.get('sortBy') || 'date'; // 'date' | 'score' | 'duration' | 'title'
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // 'asc' | 'desc'

    // Fetch calls from FastAPI backend. Fetch all to filter/compute locally for accurate pagination.
    const backendUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/calls`);
    backendUrl.searchParams.set('limit', '100000');
    backendUrl.searchParams.set('skip', '0');
    if (query) {
      backendUrl.searchParams.set('search', query);
    }
    if (isFavorite !== undefined) {
      backendUrl.searchParams.set('is_favorite', String(isFavorite));
    }

    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    const headers: Record<string, string> = {
      'x-api-key': process.env.CONVINCESENSE_API_KEY || '',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(backendUrl.toString(), {
      headers,
      next: { revalidate: 0 } // disable cache
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const backendCalls = await res.json();

    // Map backend calls to match the schema expected by the frontend
    let mappedCalls = backendCalls.map((call: any) => {
      const records = call.records || [];
      
      // Calculate derived fields using extracted utility functions
      const duration = calculateDuration(records);
      const averageScore = calculateAverage(records, 'score');
      const averageEnergy = calculateAverage(records, 'energy');
      const averageConfidence = calculateAverage(records, 'confidence');
      const overallSentiment = determineDominantSentiment(records);
      const bant = evaluateBantCriteria(records);
      const clientTitleInfo = parseClientName(call.title);

      return {
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
        records,
        salesRep: {
          id: '1',
          name: 'Default Sales Rep',
          email: 'salesrep@talklytics.com',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        }
      };
    });

    // Local filters
    if (sentiment && sentiment !== 'All') {
      mappedCalls = mappedCalls.filter((c: any) => c.overallSentiment === sentiment);
    }
    if (minScore !== null) {
      mappedCalls = mappedCalls.filter((c: any) => c.averageScore >= minScore);
    }

    // Local sorting
    mappedCalls.sort((a: any, b: any) => {
      let valA = new Date(a.date).getTime();
      let valB = new Date(b.date).getTime();
      if (sortBy === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (sortBy === 'score') {
        valA = a.averageScore;
        valB = b.averageScore;
      } else if (sortBy === 'duration') {
        valA = a.duration;
        valB = b.duration;
      }

      if (sortOrder.toLowerCase() === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

    // Local pagination
    const totalCount = mappedCalls.length;
    const totalPages = Math.ceil(totalCount / limit);
    const paginatedCalls = mappedCalls.slice((page - 1) * limit, page * limit);

    return apiSuccess({
      calls: paginatedCalls,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error: any) {
    return handleApiCatch(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, clientName, records = [], comments = [], nextSteps = [] } = body;

    // Map Next.js format to FastAPI schema
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/calls`;
    
    const titleParam = clientName ? `${title} - ${clientName}` : title;

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
        title: titleParam,
        user_id: 1, // default user
        records: records.map((r: any) => ({
          timestamp: r.timestamp,
          score: r.score,
          transcript: r.transcript,
          sentiment: r.sentiment,
          buying_signals: r.buying_signals || [],
          hesitations: r.hesitations || [],
          detected_intents: r.detected_intents || [],
          intent_confidence: r.intent_confidence || 0,
          recommendation: r.recommendation || '',
          energy: r.energy || 0,
          confidence: r.confidence || 0,
          speaker: r.speaker || 'Unknown',
        })),
        comments: comments.map((c: any) => ({ content: c.content })),
        next_steps: nextSteps.map((n: any) => ({ content: n.title || n.content || '' })),
      }),
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const createdCall = await res.json();
    return apiSuccess({
      ...createdCall,
      id: String(createdCall.id), // ensure id is string to maintain frontend compatibility
    }, 201);
  } catch (error: any) {
    return handleApiCatch(error);
  }
}
