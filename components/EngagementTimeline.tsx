export default function EngagementTimeline() {
  return (
    <section className="card lg:col-span-7" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
        <h2 className="text-section-heading flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 20 }}>insights</span>
          Engagement Timeline
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />
            <span className="text-caption">Interest Score</span>
          </div>
          <button className="icon-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>fullscreen</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        {/* Chart Grid */}
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateRows: 'repeat(4, 1fr)' }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-end' }}>
            <span className="text-caption" style={{ marginBottom: 4, fontSize: 10 }}>5 - High</span>
          </div>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-end' }}>
            <span className="text-caption" style={{ marginBottom: 4, fontSize: 10 }}>3 - Neutral</span>
          </div>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-end' }}>
            <span className="text-caption" style={{ marginBottom: 4, fontSize: 10 }}>1 - Low</span>
          </div>
        </div>
        {/* SVG Chart */}
        <svg preserveAspectRatio="none" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#7c6aef" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#7c6aef" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d="M0,60 Q10,55 20,40 T40,45 T60,20 T80,30 T100,25 L100,100 L0,100 Z" fill="url(#chartGradient)" />
          <path d="M0,60 Q10,55 20,40 T40,45 T60,20 T80,30 T100,25" fill="none" stroke="#7c6aef" strokeWidth="2" />
          <circle className="animate-pulse" cx="60" cy="20" fill="var(--success)" r="4">
            <title>Buying Signal Detected</title>
          </circle>
        </svg>
        {/* Timeline markers */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-2)' }}>
          <span className="text-caption" style={{ fontSize: 10 }}>0:00</span>
          <span className="text-caption" style={{ fontSize: 10 }}>5:00</span>
          <span className="text-caption" style={{ fontSize: 10 }}>10:00</span>
          <span className="text-caption" style={{ fontSize: 10 }}>15:00</span>
          <span className="text-caption" style={{ fontSize: 10 }}>20:00</span>
          <span className="text-caption" style={{ fontSize: 10 }}>24:12</span>
        </div>
      </div>

      {/* Signal Cards */}
      <div className="signal-row custom-scrollbar" style={{ marginTop: 'var(--space-8)' }}>
        {/* Buying Signal */}
        <div className="signal-card" style={{ borderColor: 'var(--success-muted)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-2)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--success)', fontVariationSettings: "'FILL' 1" }}>stars</span>
            <span className="text-overline" style={{ color: 'var(--success)' }}>Buying Signal</span>
          </div>
          <p className="text-caption" style={{ lineHeight: 1.5 }}>Client asked about integration timeline: &quot;How soon can we go live?&quot;</p>
        </div>

        {/* Objection */}
        <div className="signal-card" style={{ borderColor: 'var(--error-muted)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-2)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--error)' }}>warning</span>
            <span className="text-overline" style={{ color: 'var(--error)' }}>Objection</span>
          </div>
          <p className="text-caption" style={{ lineHeight: 1.5 }}>Competitor mention: &quot;Oracle offers this as part of their core suite.&quot;</p>
        </div>

        {/* Value Prop */}
        <div className="signal-card" style={{ borderColor: 'var(--accent-border)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-2)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--accent)' }}>bolt</span>
            <span className="text-overline" style={{ color: 'var(--accent)' }}>Value Prop</span>
          </div>
          <p className="text-caption" style={{ lineHeight: 1.5 }}>Jane explained the ROI of automated compliance monitoring.</p>
        </div>
      </div>
    </section>
  );
}
