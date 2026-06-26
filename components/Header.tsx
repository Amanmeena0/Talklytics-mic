import Link from 'next/link';

export default function Header() {
  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.025em' }}>
          ConvinceSense
        </span>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <Link href="#" className="nav-link">Dashboard</Link>
          <Link href="#" className="nav-link active">Recordings</Link>
          <Link href="#" className="nav-link">Analytics</Link>
          <Link href="#" className="nav-link">Settings</Link>
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div className="search-input">
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--text-muted)' }}>search</span>
          <input placeholder="Search calls..." type="text" />
        </div>

        <button className="icon-btn" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <button className="btn btn-primary">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>call</span>
          Start New Call
        </button>

        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1px solid var(--border-default)',
          flexShrink: 0,
        }}>
          <img
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBydN9a-URkUyb3EbMEXrxRRb35zw61rKWQ7f3QcdwXBQrIa8blJRm9flK0WbBbOjWAQyw6yBXqeiOPw9A7a3ngJ3S7Le2X-QXAZIgnd88et1q7etjADf0KLje2R6eHsXAW4haDHneZxCRUONnAlkjdludfTwpAg3RfFcasH2NH1G4jLMJqS5j6LIEUiye1zcL4in7zFU-AIteWTeAFKq5NlUek2mHAEpjs5RGuL8QpW8WsRlPEHwswXnL4oYjStpG4CWyyowvqog"
            alt="User avatar"
          />
        </div>
      </div>
    </header>
  );
}
