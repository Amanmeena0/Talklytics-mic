import { NextResponse } from 'next/server';

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

    const res = await fetch(backendUrl.toString(), {
      headers: {
        'x-api-key': process.env.CONVINCESENSE_API_KEY || '',
      },
      next: { revalidate: 0 } // disable cache
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const backendCalls = await res.json();

    // Map backend calls to match the schema expected by the frontend
    let mappedCalls = backendCalls.map((call: any) => {
      const records = call.records || [];
      
      // Calculate duration (max timestamp)
      const duration = records.length > 0 ? Math.max(...records.map((r: any) => r.timestamp)) : 0;
      
      // Calculate average interest score
      const averageScore = records.length > 0 
        ? parseFloat((records.reduce((sum: number, r: any) => sum + r.score, 0) / records.length).toFixed(2))
        : 0;
        
      // Calculate average energy
      const averageEnergy = records.length > 0 
        ? parseFloat((records.reduce((sum: number, r: any) => sum + r.energy, 0) / records.length).toFixed(2))
        : 0;
        
      // Calculate average confidence
      const averageConfidence = records.length > 0 
        ? parseFloat((records.reduce((sum: number, r: any) => sum + r.confidence, 0) / records.length).toFixed(2))
        : 0;
        
      // Calculate dominant sentiment
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

      // Determine BANT flags
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

      // Derive clientName from title (if title is "Discovery Call - Acme Corp")
      let clientName = 'Prospective Client';
      let displayTitle = call.title;
      if (call.title && call.title.includes(' - ')) {
        const parts = call.title.split(' - ');
        displayTitle = parts[0];
        clientName = parts.slice(1).join(' - ');
      }

      return {
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
        records,
        salesRep: {
          id: '1',
          name: 'Default Sales Rep',
          email: 'salesrep@convincesense.com',
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

    return NextResponse.json({
      calls: paginatedCalls,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch calls' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, clientName, records = [], comments = [], nextSteps = [] } = body;

    // Map Next.js format to FastAPI schema
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/calls`;
    
    const titleParam = clientName ? `${title} - ${clientName}` : title;

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CONVINCESENSE_API_KEY || '',
      },
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
    return NextResponse.json({
      ...createdCall,
      id: String(createdCall.id), // ensure id is string to maintain frontend compatibility
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create call' }, { status: 500 });
  }
}
