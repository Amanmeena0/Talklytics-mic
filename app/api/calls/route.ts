import { NextResponse } from 'next/server';
import prisma from '@/libs/db';

/**
 * GET /api/calls
 * Fetches calls list with pagination, search, filtering, and sorting.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Search Query (matches title, clientName, summary, or transcripts of segments)
    const query = searchParams.get('query') || '';

    // Filters
    const sentiment = searchParams.get('sentiment'); // 'Positive' | 'Neutral' | 'Negative'
    const minScore = searchParams.get('minScore')
      ? parseFloat(searchParams.get('minScore')!)
      : null;
    const isFavorite = searchParams.get('isFavorite') === 'true' ? true : undefined;
    const clientName = searchParams.get('clientName');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'date'; // 'date' | 'score' | 'duration' | 'title'
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // 'asc' | 'desc'

    // Build where clause
    const where: any = {
      isSoftDeleted: false,
    };

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { clientName: { contains: query } },
        { summary: { contains: query } },
        {
          records: {
            some: {
              transcript: { contains: query },
            },
          },
        },
      ];
    }

    if (sentiment) {
      where.overallSentiment = sentiment;
    }

    if (minScore !== null) {
      where.averageScore = { gte: minScore };
    }

    if (isFavorite !== undefined) {
      where.isFavorite = isFavorite;
    }

    if (clientName) {
      where.clientName = clientName;
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'date') {
      orderBy.date = sortOrder;
    } else if (sortBy === 'score') {
      orderBy.averageScore = sortOrder;
    } else if (sortBy === 'duration') {
      orderBy.duration = sortOrder;
    } else if (sortBy === 'title') {
      orderBy.title = sortOrder;
    } else {
      orderBy.date = 'desc';
    }

    // Query database
    const [calls, totalCount] = await Promise.all([
      prisma.call.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          salesRep: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              records: true,
              nextSteps: true,
            },
          },
        },
      }),
      prisma.call.count({ where }),
    ]);

    return NextResponse.json({
      calls,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch calls' }, { status: 500 });
  }
}

/**
 * POST /api/calls
 * Creates a new call session (either completed or initializing a live call).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      clientName,
      status = 'COMPLETED',
      duration = 0,
      overallSentiment = 'Neutral',
      averageScore = 3.0,
      averageEnergy = 0.3,
      averageConfidence = 0.8,
      conversionProbability = 50,
      summary = '',
      bantBudget = '',
      bantBudgetMet = false,
      bantAuthority = '',
      bantAuthorityMet = false,
      bantNeed = '',
      bantNeedMet = false,
      bantTimeline = '',
      bantTimelineMet = false,
      records = [],
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Get active user from cookie or default to first sales_rep
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    const activeUserEmail =
      cookieStore.get('active_user_email')?.value || 'jane.smith@convincesense.com';

    let user = await prisma.user.findUnique({
      where: { email: activeUserEmail },
    });

    if (!user) {
      user = await prisma.user.findFirst();
    }

    const call = await prisma.call.create({
      data: {
        title,
        clientName: clientName || 'Unknown Client',
        salesRepId: user?.id || null,
        date: new Date(),
        duration,
        status,
        overallSentiment,
        averageScore,
        averageEnergy,
        averageConfidence,
        conversionProbability,
        summary,
        bantBudget,
        bantBudgetMet,
        bantAuthority,
        bantAuthorityMet,
        bantNeed,
        bantNeedMet,
        bantTimeline,
        bantTimelineMet,
        records: {
          create: records.map((record: any) => ({
            timestamp: record.timestamp,
            score: record.score,
            transcript: record.transcript,
            sentiment: record.sentiment,
            buyingSignals: JSON.stringify(record.buying_signals || []),
            hesitations: JSON.stringify(record.hesitations || []),
            detectedIntents: JSON.stringify(record.detected_intents || []),
            intentConfidence: record.intent_confidence || 0.0,
            recommendation: record.recommendation || '',
            energy: record.energy || 0.0,
            confidence: record.confidence || 0.0,
            speaker: record.speaker || 'Unknown',
          })),
        },
      },
      include: {
        records: true,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user?.id || null,
        action: 'CALL_CREATE',
        details: `Created call: ${title} (${call.id})`,
      },
    });

    return NextResponse.json(call, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create call' }, { status: 500 });
  }
}
