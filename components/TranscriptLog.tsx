export default function TranscriptLog() {
  return (
    <section className="card-flush">
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-6)',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <h2 className="text-section-heading" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', fontSize: 20 }}>description</span>
          Full Transcript Log
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div className="filter-tabs">
            <button className="filter-tab active">All</button>
            <button className="filter-tab">Jane (Sales)</button>
            <button className="filter-tab">Client</button>
          </div>
          <button className="icon-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>settings</span>
          </button>
        </div>
      </div>

      {/* Scrollable transcript area */}
      <div
        className="custom-scrollbar"
        style={{
          height: 384,
          overflowY: 'auto',
          padding: 'var(--space-6)',
        }}
      >
        {/* Jane's message */}
        <div className="transcript-entry">
          <div
            className="transcript-avatar"
            style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
          >
            J
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Jane Smith</span>
              <span className="text-caption">02:14</span>
            </div>
            <p className="text-body" style={{ margin: 0 }}>
              Good morning Mike, great to see you again. I wanted to dive straight into the integration roadmap we discussed briefly over email last week. How has the team been handling the new compliance guidelines?
            </p>
          </div>
        </div>

        {/* Mike's message */}
        <div className="transcript-entry">
          <div
            className="transcript-avatar"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
          >
            M
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Mike Johnson</span>
              <span className="text-caption">02:45</span>
            </div>
            <p className="text-body" style={{ margin: 0 }}>
              Hi Jane. Honestly, it&apos;s been a bit of a headache. The manual auditing process is taking our managers nearly 10 hours a week each. We need a way to automate this, but we&apos;re worried about the learning curve for the newer reps.
            </p>
          </div>
        </div>

        {/* Load more */}
        <div style={{ textAlign: 'center', paddingTop: 'var(--space-4)' }}>
          <button className="btn btn-ghost" style={{ color: 'var(--accent)' }}>
            Load Remaining 20 Minutes
          </button>
        </div>
      </div>
    </section>
  );
}
