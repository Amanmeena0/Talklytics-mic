export default function NextSteps() {
  return (
    <section className="lg:col-span-5" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Task list card */}
      <div className="card" style={{ flex: 1 }}>
        <h2 className="text-section-heading" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 20 }}>task_alt</span>
          Next Steps
        </h2>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <div className="task-checkbox" />
            <div>
              <p className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 'var(--space-1)' }}>Send Technical Whitepaper</p>
              <p className="text-caption" style={{ margin: 0 }}>Requested by Sarah regarding security protocols.</p>
            </div>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <div className="task-checkbox" />
            <div>
              <p className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 'var(--space-1)' }}>Draft Renewal Agreement</p>
              <p className="text-caption" style={{ margin: 0 }}>Update pricing to reflect the 15% multi-year discount.</p>
            </div>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <div className="task-checkbox" />
            <div>
              <p className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 'var(--space-1)' }}>Schedule Implementation Sync</p>
              <p className="text-caption" style={{ margin: 0 }}>Address the bandwidth concerns raised by the ops team.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* AI Follow-Up Draft */}
      <div className="ai-draft-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          <span
            className="material-symbols-outlined"
            style={{ color: 'var(--accent)', fontSize: 20, fontVariationSettings: "'FILL' 1" }}
          >
            mail
          </span>
          <span className="text-overline" style={{ color: 'var(--accent)' }}>AI Follow-Up Draft</span>
        </div>
        <p className="text-body" style={{ fontStyle: 'italic', marginBottom: 'var(--space-5)' }}>
          &quot;Hi Mike, great connecting today. I&apos;ve attached the security brief Sarah requested. Looking forward to our sync on the 15th...&quot;
        </p>
        <button className="btn btn-primary" style={{ width: 'fit-content' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>content_copy</span>
          Copy &amp; Send Email
        </button>
      </div>
    </section>
  );
}
