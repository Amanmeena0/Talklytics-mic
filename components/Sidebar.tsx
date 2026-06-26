import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="app-sidebar custom-scrollbar">
      {/* Live Monitor */}
      <div className="sidebar-section">
        <div className="sidebar-item" style={{ gap: 'var(--space-3)' }}>
          <span className="pulse-dot" />
          <div>
            <div style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>Live Monitor</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI Analyzing...</div>
          </div>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Main Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Navigation</div>
        <Link href="#" className="sidebar-item">
          <span className="material-symbols-outlined">monitoring</span>
          <span>Live Insights</span>
        </Link>
        <Link href="#" className="sidebar-item active">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          <span>Call History</span>
        </Link>
        <Link href="#" className="sidebar-item">
          <span className="material-symbols-outlined">groups</span>
          <span>Team Performance</span>
        </Link>
      </div>

      {/* Resources */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Resources</div>
        <Link href="#" className="sidebar-item">
          <span className="material-symbols-outlined">folder_open</span>
          <span>Asset Library</span>
        </Link>
        <Link href="#" className="sidebar-item">
          <span className="material-symbols-outlined">extension</span>
          <span>Integrations</span>
        </Link>
      </div>

      {/* Spacer pushes bottom section down */}
      <div style={{ flex: 1 }} />

      {/* Bottom Section */}
      <div className="sidebar-divider" />
      <div className="sidebar-section" style={{ marginBottom: 0 }}>
        <Link href="#" className="sidebar-item">
          <span className="material-symbols-outlined">contact_support</span>
          <span>Support</span>
        </Link>
        <Link href="#" className="sidebar-item">
          <span className="material-symbols-outlined">manage_accounts</span>
          <span>Account</span>
        </Link>
      </div>
    </aside>
  );
}
