export default function ExecutiveSummary() {
  return (
    <section className="card lg:col-span-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
          <h2 className="text-section-heading flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 20 }}>auto_awesome</span>
            Executive Summary
          </h2>
          <span className="badge badge-accent">AI Generated</span>
        </div>
        <p className="text-body">
          The call was primarily a discovery and scoping session for the upcoming Q4 renewal. Jane successfully navigated the initial skepticism regarding the seat-based pricing model by highlighting the new AI-driven integration capabilities. Key stakeholder Mike showed significant interest in the automated reporting feature but remains cautious about the implementation timeline.
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
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
            <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 14 }}>Strongly Positive</span>
          </div>
        </div>
        <div>
          <p className="text-overline" style={{ marginBottom: 'var(--space-1)' }}>Conversion Prob.</p>
          <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 20 }}>82%</span>
        </div>
      </div>
    </section>
  );
}
