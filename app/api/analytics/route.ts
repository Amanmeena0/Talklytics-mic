import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch calls from FastAPI backend.
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/calls`
    );
    backendUrl.searchParams.set('limit', '100000');
    backendUrl.searchParams.set('skip', '0');

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
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}`);
    }

    const calls = await res.json();

    if (calls.length === 0) {
      return NextResponse.json({
        totalCalls: 0,
        totalDurationMinutes: 0,
        averageScore: 0,
        averageConversionProbability: 0,
        sentimentSplit: { Positive: 0, Neutral: 0, Negative: 0 },
        scoreTrend: [],
        bantCompletionRate: 0,
      });
    }

    const totalCalls = calls.length;
    let totalDurationSeconds = 0;
    let totalScoreSum = 0;
    let totalRecordsCount = 0;

    const sentimentSplit = { Positive: 0, Neutral: 0, Negative: 0 };
    const intentCounts: Record<string, number> = {
      PRICING: 0,
      COMPARISON: 0,
      OBJECTION: 0,
      COMMITMENT: 0,
      INFORMATION: 0,
    };
    let totalBuyingSignals = 0;
    let totalHesitations = 0;
    let callsWithBantCount = 0;

    const scoreTrend = calls.map((c: any) => {
      const records = c.records || [];
      const duration = records.length > 0 ? Math.max(...records.map((r: any) => r.timestamp)) : 0;
      totalDurationSeconds += duration;

      const callScoreSum = records.reduce((sum: number, r: any) => sum + r.score, 0);
      const callAvgScore = records.length > 0 ? callScoreSum / records.length : 0;

      totalScoreSum += callScoreSum;
      totalRecordsCount += records.length;

      let overallSentiment: keyof typeof sentimentSplit = 'Neutral';
      if (records.length > 0) {
        const freq: Record<string, number> = {};
        records.forEach((r: any) => {
          const s = r.sentiment;
          const key = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); // Normalize case (e.g. positive -> Positive)
          freq[key] = (freq[key] || 0) + 1;
        });
        let max = 0;
        Object.entries(freq).forEach(([k, v]) => {
          if (v > max) {
            max = v;
            overallSentiment = k as any;
          }
        });
      }

      if (overallSentiment in sentimentSplit) {
        sentimentSplit[overallSentiment] += 1;
      }

      // Check BANT
      let isBant = false;
      records.forEach((r: any) => {
        const txt = r.transcript.toLowerCase();
        const intentsList = (r.detected_intents || []).map((i: string) => i.toUpperCase());
        if (intentsList.includes('PRICING') || txt.includes('price') || txt.includes('budget'))
          isBant = true;
        if (txt.includes('decision') || txt.includes('approve') || txt.includes('authority'))
          isBant = true;
        if (intentsList.includes('INFORMATION') || txt.includes('need') || txt.includes('want'))
          isBant = true;
        if (
          intentsList.includes('COMMITMENT') ||
          txt.includes('timeline') ||
          txt.includes('schedule')
        )
          isBant = true;

        // Count intents
        intentsList.forEach((intent: string) => {
          if (intent in intentCounts) {
            intentCounts[intent] += 1;
          }
        });

        // Count signals & hesitations
        totalBuyingSignals += (r.buying_signals || []).length;
        totalHesitations += (r.hesitations || []).length;
      });

      if (isBant) {
        callsWithBantCount += 1;
      }

      const averageScore = records.length > 0 ? parseFloat(callAvgScore.toFixed(2)) : 0;

      return {
        id: String(c.id),
        title: c.title,
        date: c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        score: averageScore,
        probability: Math.min(100, Math.max(0, Math.round(averageScore * 20))),
      };
    });

    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);
    const averageScore =
      totalRecordsCount > 0 ? parseFloat((totalScoreSum / totalRecordsCount).toFixed(2)) : 0;
    const averageConversionProbability = Math.round(
      scoreTrend.reduce((sum: number, s: any) => sum + s.probability, 0) / totalCalls
    );
    const bantCompletionRate = Math.round((callsWithBantCount / totalCalls) * 100);

    return NextResponse.json({
      totalCalls,
      totalDurationMinutes,
      averageScore,
      averageConversionProbability,
      sentimentSplit,
      scoreTrend: scoreTrend.reverse(), // chronologically ascending
      bantCompletionRate,
      intentCounts,
      totalBuyingSignals,
      totalHesitations,
    });
  } catch (error: any) {
    const match = error.message?.match(/Backend returned status (\d+)/);
    const status = match ? parseInt(match[1], 10) : 500;
    return NextResponse.json({ error: error.message || 'Failed to compute analytics' }, { status });
  }
}
