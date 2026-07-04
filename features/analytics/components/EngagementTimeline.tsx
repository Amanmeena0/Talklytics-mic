'use client';

import { useLiveData } from '@/shared/hooks/LiveDataContext';

/**
 * Formats seconds to mm:ss display format
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function EngagementTimeline() {
  const { records, allBuyingSignals, allIntents, sessionDuration, status } = useLiveData();

  const hasData = records.length > 0;

  // Build SVG path from score data points
  const buildChartPath = (): {
    linePath: string;
    areaPath: string;
    points: { x: number; y: number; score: number; hasBuyingSignal: boolean }[];
  } => {
    if (records.length < 2) {
      return { linePath: '', areaPath: '', points: [] };
    }

    const maxTimestamp = Math.max(...records.map((r) => r.timestamp), 1);
    const points = records.map((r) => ({
      x: (r.timestamp / maxTimestamp) * 100,
      // Score is 1-5, map to SVG y (0=top=score5, 100=bottom=score1)
      y: 100 - ((r.score - 1) / 4) * 100,
      score: r.score,
      hasBuyingSignal: r.buying_signals.length > 0,
    }));

    // Build smooth curve using quadratic bezier
    let linePath = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cx = (points[i - 1].x + points[i].x) / 2;
      linePath += ` Q${cx},${points[i - 1].y} ${points[i].x},${points[i].y}`;
    }

    const areaPath = `${linePath} L${points[points.length - 1].x},100 L${points[0].x},100 Z`;

    return { linePath, areaPath, points };
  };

  const { linePath, areaPath, points } = buildChartPath();

  // Compute time markers based on session duration
  const timeMarkers = hasData
    ? Array.from({ length: 6 }, (_, i) => formatTime((sessionDuration / 5) * i))
    : ['0:00', '5:00', '10:00', '15:00', '20:00', '24:12'];

  // Build signal cards from live data
  const signalCards: {
    type: string;
    icon: string;
    color: string;
    borderColor: string;
    text: string;
  }[] = [];

  if (allBuyingSignals.length > 0) {
    signalCards.push({
      type: 'Buying Signal',
      icon: 'stars',
      color: 'var(--success)',
      borderColor: 'var(--success-muted)',
      text: allBuyingSignals.slice(-3).join(', '),
    });
  }

  if (allIntents.includes('OBJECTION') || allIntents.includes('COMPARISON')) {
    signalCards.push({
      type: 'Objection',
      icon: 'warning',
      color: 'var(--error)',
      borderColor: 'var(--error-muted)',
      text: `Detected intents: ${allIntents.filter((i) => i === 'OBJECTION' || i === 'COMPARISON').join(', ')}`,
    });
  }

  if (allIntents.includes('PRICING') || allIntents.includes('COMMITMENT')) {
    signalCards.push({
      type: 'Value Prop',
      icon: 'bolt',
      color: 'var(--accent)',
      borderColor: 'var(--accent-border)',
      text: `Active intents: ${allIntents.filter((i) => i === 'PRICING' || i === 'COMMITMENT').join(', ')}`,
    });
  }

  // Fallback signal cards when no data
  const fallbackCards = [
    {
      type: 'Buying Signal',
      icon: 'stars',
      color: 'var(--success)',
      borderColor: 'var(--success-muted)',
      text: 'Waiting for buying signals...',
    },
    {
      type: 'Objection',
      icon: 'warning',
      color: 'var(--error)',
      borderColor: 'var(--error-muted)',
      text: 'Waiting for objections...',
    },
    {
      type: 'Value Prop',
      icon: 'bolt',
      color: 'var(--accent)',
      borderColor: 'var(--accent-border)',
      text: 'Waiting for value props...',
    },
  ];

  const displayCards = signalCards.length > 0 ? signalCards : fallbackCards;

  return (
    <section className="card lg:col-span-7 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-section-heading flex items-center gap-2">
            <span className="material-symbols-outlined color-accent fs-20">insights</span>
            Engagement Timeline
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="timeline-dot" />
              <span className="text-caption">Interest Score</span>
            </div>
            {hasData && <span className="text-caption color-accent">{records.length} segments</span>}
            <button className="icon-btn">
              <span className="material-symbols-outlined fs-18">fullscreen</span>
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="chart-container" style={{ height: '220px' }}>
          {/* Chart Grid */}
          <div className="timeline-chart-grid">
            <div className="border-b-subtle d-flex align-end">
              <span className="text-caption mb-4 fs-10">5 - High</span>
            </div>
            <div className="border-b-subtle d-flex align-end">
              <span className="text-caption mb-4 fs-10">3 - Neutral</span>
            </div>
            <div className="border-b-subtle d-flex align-end">
              <span className="text-caption mb-4 fs-10">1 - Low</span>
            </div>
          </div>
          {/* SVG Chart — real data or placeholder */}
          <svg
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            className="pos-absolute-inset-0 w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#7c6aef" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#7c6aef" stopOpacity={0} />
              </linearGradient>
            </defs>
            {hasData && linePath ? (
              <>
                <path d={areaPath} fill="url(#chartGradient)">
                  <animate attributeName="opacity" from="0" to="1" dur="0.6s" fill="freeze" />
                </path>
                <path d={linePath} fill="none" stroke="#7c6aef" strokeWidth="2">
                  <animate
                    attributeName="stroke-dasharray"
                    from="0,1000"
                    to="1000,0"
                    dur="1s"
                    fill="freeze"
                  />
                </path>
                {/* Buying signal dots */}
                {points
                  .filter((p) => p.hasBuyingSignal)
                  .map((p, i) => (
                    <circle
                      key={i}
                      className="animate-pulse"
                      cx={p.x}
                      cy={p.y}
                      fill="var(--success)"
                      r="4"
                    >
                      <title>Buying Signal (Score: {p.score})</title>
                    </circle>
                  ))}
              </>
            ) : (
              <>
                <path
                  d="M0,60 Q10,55 20,40 T40,45 T60,20 T80,30 T100,25 L100,100 L0,100 Z"
                  fill="url(#chartGradient)"
                  opacity="0.3"
                />
                <path
                  d="M0,60 Q10,55 20,40 T40,45 T60,20 T80,30 T100,25"
                  fill="none"
                  stroke="#7c6aef"
                  strokeWidth="2"
                  opacity="0.3"
                  strokeDasharray="4 4"
                />
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="6"
                  fontFamily="inherit"
                >
                  {status === 'connecting' ? 'Connecting to backend...' : 'Awaiting live data'}
                </text>
              </>
            )}
          </svg>
          {/* Timeline markers */}
          <div className="timeline-time-markers">
            {timeMarkers.map((t, i) => (
              <span key={i} className="text-caption fs-10">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Signal Cards */}
      <div className="signal-row custom-scrollbar mt-8">
        {displayCards.map((card, i) => (
          <div
            key={i}
            className={`signal-card ${
              card.type === 'Buying Signal'
                ? 'signal-card--success'
                : card.type === 'Objection'
                  ? 'signal-card--error'
                  : 'signal-card--accent'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`material-symbols-outlined fs-16 ${
                  card.type === 'Buying Signal'
                    ? 'signal-icon--success signal-icon--filled'
                    : card.type === 'Objection'
                      ? 'signal-icon--error'
                      : 'signal-icon--accent'
                }`}
              >
                {card.icon}
              </span>
              <span
                className={`text-overline ${
                  card.type === 'Buying Signal'
                    ? 'signal-icon--success'
                    : card.type === 'Objection'
                      ? 'signal-icon--error'
                      : 'signal-icon--accent'
                }`}
              >
                {card.type}
              </span>
            </div>
            <p className="text-caption lh-1-5">{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
