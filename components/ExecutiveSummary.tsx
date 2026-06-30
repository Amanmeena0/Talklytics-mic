'use client';

import { useLiveData } from '@/shared/hooks/LiveDataContext';

export default function ExecutiveSummary() {
  const { records, averageScore, dominantSentiment, averageConfidence, latestRecommendation, status } = useLiveData();

  const hasData = records.length > 0;

  // Compute a conversion probability estimate from average score (1-5 mapped to 0-100%)
  const conversionProb = hasData ? Math.round((averageScore / 5) * 100) : 0;

  // Build a dynamic summary from the latest data
  const summaryText = hasData
    ? `Session in progress with ${records.length} segment${records.length > 1 ? 's' : ''} analyzed. ` +
      `The dominant sentiment is ${dominantSentiment} with an average engagement score of ${averageScore.toFixed(1)}/5. ` +
      (latestRecommendation ? `Latest AI recommendation: "${latestRecommendation}"` : '')
    : 'Waiting for live data from the ConvinceSense backend. Ensure the microphone session is active and the backend server is running.';

  // Determine sentiment display
  const sentimentColor =
    dominantSentiment === 'Positive'
      ? 'var(--success)'
      : dominantSentiment === 'Negative'
        ? 'var(--error)'
        : 'var(--text-muted)';

  const sentimentLabel =
    dominantSentiment === 'Positive'
      ? averageScore >= 4
        ? 'Strongly Positive'
        : 'Positive'
      : dominantSentiment === 'Negative'
        ? 'Negative'
        : 'Neutral';

  return (
    <section className="card lg:col-span-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
          <h2 className="text-section-heading flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 20 }}>auto_awesome</span>
            Executive Summary
          </h2>
          <span className="badge badge-accent">
            {status === 'connected' ? '● Live' : 'AI Generated'}
          </span>
        </div>
        <p className="text-body" style={{ transition: 'opacity 0.3s ease', opacity: hasData ? 1 : 0.6 }}>
          {summaryText}
        </p>
      </div>
      <div
        className="grid grid-cols-2 gap-4"
        style={{
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-6)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <p className="text-overline" style={{ marginBottom: 'var(--space-1)' }}>Overall Sentiment</p>
          <div className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: sentimentColor, transition: 'background 0.3s ease' }} />
            <span style={{ color: sentimentColor, fontWeight: 700, fontSize: 14, transition: 'color 0.3s ease' }}>
              {hasData ? sentimentLabel : '—'}
            </span>
          </div>
        </div>
        <div>
          <p className="text-overline" style={{ marginBottom: 'var(--space-1)' }}>Avg Confidence</p>
          <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 20, transition: 'all 0.3s ease' }}>
            {hasData ? `${Math.round(averageConfidence * 100)}%` : '—'}
          </span>
        </div>
      </div>
    </section>
  );
}
