export default function BANTAnalysis() {
  return (
    <section className="card lg:col-span-7">
      <h2 className="text-section-heading" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 20 }}>fact_check</span>
        BANT Analysis
      </h2>

      <div className="bant-grid">
        {/* Budget */}
        <div className="bant-item">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span className="text-overline">BUDGET</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--success)', fontSize: 18 }}>check_circle</span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 'var(--space-1)', fontSize: 14 }}>$120k - $150k Annual</p>
          <p className="text-body" style={{ margin: 0 }}>Approved for Q1 spend. Mike confirmed budget is allocated for the renewal.</p>
        </div>

        {/* Authority */}
        <div className="bant-item">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span className="text-overline">AUTHORITY</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--success)', fontSize: 18 }}>check_circle</span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 'var(--space-1)', fontSize: 14 }}>Decision Maker Present</p>
          <p className="text-body" style={{ margin: 0 }}>Mike (VP of Sales) has final sign-off. Stakeholder Sarah needs technical brief.</p>
        </div>

        {/* Need */}
        <div className="bant-item">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span className="text-overline">NEED</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--info)', fontSize: 18 }}>info</span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 'var(--space-1)', fontSize: 14 }}>High Urgency: Compliance</p>
          <p className="text-body" style={{ margin: 0 }}>Need to automate call monitoring to meet new regulatory standards by Dec 31st.</p>
        </div>

        {/* Timeline */}
        <div className="bant-item">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span className="text-overline">TIMELINE</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--warning)', fontSize: 18 }}>pending</span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 'var(--space-1)', fontSize: 14 }}>Target Go-Live: Dec 15</p>
          <p className="text-body" style={{ margin: 0 }}>Tight window. Client expressed concern about implementation bandwidth.</p>
        </div>
      </div>
    </section>
  );
}
