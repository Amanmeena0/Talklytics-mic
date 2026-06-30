import { NextResponse } from 'next/server';
import prisma from '@/libs/db';

/**
 * GET /api/analytics
 * Computes aggregated SaaS analytics from call records in the database.
 */
export async function GET() {
  try {
    // 1. Fetch all completed calls
    const calls = await prisma.call.findMany({
      where: {
        isSoftDeleted: false,
        status: 'COMPLETED',
      },
      orderBy: { date: 'asc' },
    });

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
    const totalDurationSeconds = calls.reduce((sum, c) => sum + c.duration, 0);
    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

    const averageScore = parseFloat((calls.reduce((sum, c) => sum + c.averageScore, 0) / totalCalls).toFixed(2));
    const averageConversionProbability = Math.round(calls.reduce((sum, c) => sum + c.conversionProbability, 0) / totalCalls);

    // Sentiment distribution
    const sentimentSplit = { Positive: 0, Neutral: 0, Negative: 0 };
    calls.forEach((c) => {
      const s = c.overallSentiment as keyof typeof sentimentSplit;
      if (s in sentimentSplit) {
        sentimentSplit[s] += 1;
      }
    });

    // Score trend over time (grouped by date)
    const scoreTrend = calls.map((c) => ({
      id: c.id,
      title: c.title,
      date: c.date.toISOString().split('T')[0],
      score: c.averageScore,
      probability: c.conversionProbability,
    }));

    // BANT coverage
    // Percentage of completed calls that have at least one BANT parameter verified (met)
    const callsWithBant = calls.filter((c) => c.bantBudgetMet || c.bantAuthorityMet || c.bantNeedMet || c.bantTimelineMet);
    const bantCompletionRate = Math.round((callsWithBant.length / totalCalls) * 100);

    // Let's count some intents and speech statistics from all engagement records in the system
    const allRecords = await prisma.engagementRecord.findMany({});
    const intentCounts: Record<string, number> = {
      PRICING: 0,
      COMPARISON: 0,
      OBJECTION: 0,
      COMMITMENT: 0,
      INFORMATION: 0,
    };
    
    let totalBuyingSignals = 0;
    let totalHesitations = 0;

    allRecords.forEach((rec) => {
      try {
        const intents = JSON.parse(rec.detectedIntents || '[]');
        intents.forEach((intent: string) => {
          if (intent in intentCounts) {
            intentCounts[intent] += 1;
          }
        });

        const signals = JSON.parse(rec.buyingSignals || '[]');
        totalBuyingSignals += signals.length;

        const hes = JSON.parse(rec.hesitations || '[]');
        totalHesitations += hes.length;
      } catch (e) {
        // ignore JSON parse errors
      }
    });

    return NextResponse.json({
      totalCalls,
      totalDurationMinutes,
      averageScore,
      averageConversionProbability,
      sentimentSplit,
      scoreTrend,
      bantCompletionRate,
      intentCounts,
      totalBuyingSignals,
      totalHesitations,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to compute analytics' }, { status: 500 });
  }
}
