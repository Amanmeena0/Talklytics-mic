'use client';

import { useLiveData } from '@/shared/hooks/LiveDataContext';
import ReactMarkdown from 'react-markdown';

export default function ExecutiveSummary() {
  const {
    records,
    averageScore,
    dominantSentiment,
    averageConfidence,
    latestRecommendation,
    status,
    summary,
    isLive,
  } = useLiveData();

  const hasData = records.length > 0;

  // Compute a conversion probability estimate from average score (1-5 mapped to 0-100%)
  const conversionProb = hasData ? Math.round((averageScore / 5) * 100) : 0;

  // Build a dynamic summary from the latest data, or use the pre-generated AI summary if viewing historical details
  const summaryText = !isLive && summary
    ? summary
    : hasData
      ? `Session in progress with ${records.length} segment${records.length > 1 ? 's' : ''} analyzed. ` +
        `The dominant sentiment is ${dominantSentiment} with an average engagement score of ${averageScore.toFixed(1)}/5. ` +
        (latestRecommendation ? `Latest AI recommendation: "${latestRecommendation}"` : '')
      : 'Waiting for live data from the Talklytics backend. Ensure the microphone session is active and the backend server is running.';

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-section-heading flex items-center gap-2">
            <span className="material-symbols-outlined color-accent fs-20">auto_awesome</span>
            Executive Summary
          </h2>
          <span className="badge badge-accent">
            {status === 'connected' ? '● Live' : 'AI Generated'}
          </span>
        </div>
        <div className={`text-body executive-summary-summary ${hasData ? '' : 'is-muted'} prose max-w-none max-h-[320px] overflow-y-auto pr-2 custom-scrollbar`}>
          <ReactMarkdown>{summaryText}</ReactMarkdown>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 executive-summary-footer">
        <div>
          <p className="text-overline mb-1">Overall Sentiment</p>
          <div className="flex items-center gap-2">
            <div
              className={`connection-indicator-dot ${
                dominantSentiment === 'Positive'
                  ? 'sentiment-dot--positive'
                  : dominantSentiment === 'Negative'
                    ? 'sentiment-dot--negative'
                    : 'sentiment-dot--neutral'
              }`}
            />
            <span
              className={`font-bold fs-14 ${
                dominantSentiment === 'Positive'
                  ? 'sentiment-label--positive'
                  : dominantSentiment === 'Negative'
                    ? 'sentiment-label--negative'
                    : 'sentiment-label--neutral'
              }`}
            >
              {hasData ? sentimentLabel : '—'}
            </span>
          </div>
        </div>
        <div>
          <p className="text-overline mb-1">Avg Confidence</p>
          <span className="color-accent font-bold fs-20">
            {hasData ? `${Math.round(averageConfidence * 100)}%` : '—'}
          </span>
        </div>
      </div>
    </section>
  );
}
