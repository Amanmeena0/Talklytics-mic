'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [liveCallAvailable, setLiveCallAvailable] = useState(false);

  // Poll health endpoint of uvicorn server to check if uvicorn websocket is available
  useEffect(() => {
    const checkLiveServer = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setLiveCallAvailable(true);
        } else {
          setLiveCallAvailable(false);
        }
      } catch (e) {
        setLiveCallAvailable(false);
      }
    };
    checkLiveServer();
    const interval = setInterval(checkLiveServer, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="app-sidebar custom-scrollbar">
      {/* Live Monitor Section */}
      <div className="sidebar-section">
        <Link href="/calls/live" style={{ textDecoration: 'none' }}>
          <div
            className={`sidebar-item ${pathname === '/calls/live' ? 'active' : ''}`}
            style={{ gap: 'var(--space-3)', cursor: 'pointer' }}
          >
            <span
              className="pulse-dot"
              style={{
                background: liveCallAvailable ? 'var(--success)' : 'var(--text-muted)',
                boxShadow: liveCallAvailable ? '0 0 6px var(--success)' : 'none',
              }}
            />
            <div>
              <div style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
                Live Monitor
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {liveCallAvailable ? 'Uvicorn Server Active' : 'No Active Stream'}
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="sidebar-divider" />

      {/* Main Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Navigation</div>

        <Link
          href="/calls/live"
          className={`sidebar-item ${pathname === '/calls/live' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">monitoring</span>
          <span>Live Insights</span>
        </Link>

        <Link
          href="/calls"
          className={`sidebar-item ${pathname.startsWith('/calls') && pathname !== '/calls/live' ? 'active' : ''}`}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings:
                pathname.startsWith('/calls') && pathname !== '/calls/live'
                  ? "'FILL' 1"
                  : undefined,
            }}
          >
            history
          </span>
          <span>Call History</span>
        </Link>

        <Link
          href="/analytics"
          className={`sidebar-item ${pathname === '/analytics' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">groups</span>
          <span>Team Analytics</span>
        </Link>
      </div>

      {/* Settings & Config */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Configuration</div>

        <Link
          href="/settings?tab=integrations"
          className={`sidebar-item ${pathname === '/settings' && pathname.includes('integrations') ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">extension</span>
          <span>Integrations</span>
        </Link>

        <Link
          href="/settings"
          className={`sidebar-item ${pathname === '/settings' && !pathname.includes('integrations') ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span>User Settings</span>
        </Link>
      </div>

      {/* Spacer pushes bottom section down */}
      <div style={{ flex: 1 }} />

      {/* Bottom Section */}
      <div className="sidebar-divider" />
      <div className="sidebar-section" style={{ marginBottom: 0 }}>
        <Link href="/settings?tab=support" className="sidebar-item">
          <span className="material-symbols-outlined">contact_support</span>
          <span>Support &amp; FAQ</span>
        </Link>
        <Link href="/settings?tab=profile" className="sidebar-item">
          <span className="material-symbols-outlined">manage_accounts</span>
          <span>Account Profile</span>
        </Link>
      </div>
    </aside>
  );
}
