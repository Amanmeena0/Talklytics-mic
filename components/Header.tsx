'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  
  // State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for closing dropdowns when clicking outside
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch current user and notifications
  const loadUserData = async () => {
    try {
      const [userRes, notifRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/notifications'),
      ]);
      if (userRes.ok) {
        const user = await userRes.json();
        setCurrentUser(user);
      }
      if (notifRes.ok) {
        const notifs = await notifRes.json();
        setNotifications(notifs);
      }
    } catch (err) {
      console.error('Failed to load header data:', err);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Switch user role (demo purpose)
  const handleSwitchUser = async (email: string) => {
    try {
      const res = await fetch('/api/users/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setShowUserMenu(false);
        // Reload current page or route to apply permissions
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark notification as read
  const handleMarkNotifRead = async (id: string, read: boolean) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read }),
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clear all notifications
  const handleClearAllNotifs = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/calls?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="app-header" style={{ position: 'relative', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: '20px' }}>lens_blur</span>
            ConvinceSense
          </span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Dashboard</Link>
          <Link href="/calls" className={`nav-link ${pathname.startsWith('/calls') && !pathname.includes('live') ? 'active' : ''}`}>Recordings</Link>
          <Link href="/analytics" className={`nav-link ${pathname === '/analytics' ? 'active' : ''}`}>Analytics</Link>
          <Link href="/settings" className={`nav-link ${pathname === '/settings' ? 'active' : ''}`}>Settings</Link>
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-input">
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--text-muted)' }}>search</span>
          <input
            placeholder="Search calls..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Notifications Dropdown Container */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="icon-btn"
            aria-label="Notifications"
            style={{ position: 'relative' }}
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                background: 'var(--error)',
                borderRadius: '50%',
                boxShadow: '0 0 0 2px var(--bg-root)'
              }} />
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '44px',
              right: 0,
              width: '320px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
              padding: 'var(--space-4)',
              maxHeight: '400px',
              overflowY: 'auto'
            }} className="custom-scrollbar">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-2)' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAllNotifs}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {notifications.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkNotifRead(n.id, !n.read)}
                      style={{
                        padding: 'var(--space-2)',
                        borderRadius: 'var(--radius-sm)',
                        background: n.read ? 'transparent' : 'rgba(124, 106, 239, 0.06)',
                        borderLeft: `3px solid ${n.type === 'SUCCESS' ? 'var(--success)' : n.type === 'WARNING' ? 'var(--warning)' : 'var(--accent)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>
                        {!n.read && (
                          <span style={{ width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%', marginTop: '4px' }} />
                        )}
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-6) 0', color: 'var(--text-muted)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', opacity: 0.3, display: 'block', marginBottom: '8px' }}>notifications_off</span>
                  <span style={{ fontSize: '12px' }}>No notifications</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Start New Call Button */}
        <Link href="/calls/live" style={{ textDecoration: 'none' }}>
          <button className="btn btn-primary" style={{ padding: '0 var(--space-4)', height: '36px', display: 'flex', alignItems: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '6px' }}>call</span>
            Start New Call
          </button>
        </Link>

        {/* User Menu / Switcher */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              outline: 'none'
            }}
          >
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
                src={currentUser?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBydN9a-URkUyb3EbMEXrxRRb35zw61rKWQ7f3QcdwXBQrIa8blJRm9flK0WbBbOjWAQyw6yBXqeiOPw9A7a3ngJ3S7Le2X-QXAZIgnd88et1q7etjADf0KLje2R6eHsXAW4haDHneZxCRUONnAlkjdludfTwpAg3RfFcasH2NH1G4jLMJqS5j6LIEUiye1zcL4in7zFU-AIteWTeAFKq5NlUek2mHAEpjs5RGuL8QpW8WsRlPEHwswXnL4oYjStpG4CWyyowvqog"}
                alt="User avatar"
              />
            </div>
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '44px',
              right: 0,
              width: '240px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
              padding: 'var(--space-3)',
            }}>
              <div style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 'var(--space-2)' }}>
                <span style={{ display: 'block', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{currentUser?.name}</span>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{currentUser?.email}</span>
                <span style={{
                  display: 'inline-block',
                  fontSize: '9px',
                  fontWeight: 700,
                  background: 'var(--accent-muted)',
                  color: 'var(--accent)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  marginTop: '4px'
                }}>
                  {currentUser?.role}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', padding: '4px var(--space-3)' }}>SWITCH ROLE (DEMO)</div>
                <button
                  onClick={() => handleSwitchUser('jane.smith@convincesense.com')}
                  style={{
                    background: currentUser?.role === 'SALES_REP' ? 'var(--bg-card)' : 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    padding: '8px var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                  Jane Smith (Sales Rep)
                </button>
                <button
                  onClick={() => handleSwitchUser('manager@convincesense.com')}
                  style={{
                    background: currentUser?.role === 'MANAGER' ? 'var(--bg-card)' : 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    padding: '8px var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>supervisor_account</span>
                  Sarah Connor (Manager)
                </button>
                <button
                  onClick={() => handleSwitchUser('admin@convincesense.com')}
                  style={{
                    background: currentUser?.role === 'ADMIN' ? 'var(--bg-card)' : 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    padding: '8px var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>admin_panel_settings</span>
                  Alex Rivera (Admin)
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>
                <Link href="/settings" style={{ textDecoration: 'none' }} onClick={() => setShowUserMenu(false)}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    padding: '6px var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>settings</span>
                    Account Settings
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
