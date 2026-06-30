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
    <header className="app-header pos-relative z-100">
      <div className="d-flex align-center gap-8">
        <Link href="/" className="no-underline">
          <span className="header-brand-text">
            <span className="material-symbols-outlined color-accent fs-20">lens_blur</span>
            ConvinceSense
          </span>
        </Link>
        <nav className="d-flex align-center gap-6">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Dashboard</Link>
          <Link href="/calls" className={`nav-link ${pathname.startsWith('/calls') && !pathname.includes('live') ? 'active' : ''}`}>Recordings</Link>
          <Link href="/analytics" className={`nav-link ${pathname === '/analytics' ? 'active' : ''}`}>Analytics</Link>
          <Link href="/settings" className={`nav-link ${pathname === '/settings' ? 'active' : ''}`}>Settings</Link>
        </nav>
      </div>

      <div className="d-flex align-center gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-input">
          <span className="material-symbols-outlined color-muted fs-18">search</span>
          <input
            placeholder="Search calls..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Notifications Dropdown Container */}
        <div className="pos-relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="icon-btn pos-relative"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="header-notif-badge" />
            )}
          </button>

          {showNotifications && (
            <div className="header-dropdown-notifications custom-scrollbar">
              <div className="header-dropdown-notifications-header">
                <span className="header-dropdown-notifications-title">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAllNotifs}
                    className="header-notif-clear-btn"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {notifications.length > 0 ? (
                <div className="d-flex flex-col gap-3">
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
                      className="header-notif-item"
                    >
                      <div className="d-flex justify-between align-start">
                        <span className="fs-12 font-semibold color-primary">{n.title}</span>
                        {!n.read && (
                          <span className="header-notif-unread-dot" />
                        )}
                      </div>
                      <p className="header-notif-description">{n.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="header-notif-empty">
                  <span className="material-symbols-outlined header-notif-empty-icon">notifications_off</span>
                  <span className="header-notif-empty-text">No notifications</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Start New Call Button */}
        <Link href="/calls/live" className="no-underline">
          <button className="btn btn-primary header-btn-new-call">
            <span className="material-symbols-outlined fs-16 mr-6">call</span>
            Start New Call
          </button>
        </Link>

        {/* User Menu / Switcher */}
        <div className="pos-relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="header-user-btn"
          >
            <div className="header-user-avatar-container">
              <img
                className="header-user-avatar-img"
                src={currentUser?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBydN9a-URkUyb3EbMEXrxRRb35zw61rKWQ7f3QcdwXBQrIa8blJRm9flK0WbBbOjWAQyw6yBXqeiOPw9A7a3ngJ3S7Le2X-QXAZIgnd88et1q7etjADf0KLje2R6eHsXAW4haDHneZxCRUONnAlkjdludfTwpAg3RfFcasH2NH1G4jLMJqS5j6LIEUiye1zcL4in7zFU-AIteWTeAFKq5NlUek2mHAEpjs5RGuL8QpW8WsRlPEHwswXnL4oYjStpG4CWyyowvqog"}
                alt="User avatar"
              />
            </div>
          </button>

          {showUserMenu && (
            <div className="header-user-dropdown">
              <div className="header-user-info-section">
                <span className="header-user-name">{currentUser?.name}</span>
                <span className="header-user-email">{currentUser?.email}</span>
                <span className="header-user-role-badge">
                  {currentUser?.role}
                </span>
              </div>

              <div className="d-flex flex-col gap-1">
                <div className="header-user-demo-title">SWITCH ROLE (DEMO)</div>
                <button
                  onClick={() => handleSwitchUser('jane.smith@convincesense.com')}
                  style={{
                    background: currentUser?.role === 'SALES_REP' ? 'var(--bg-card)' : 'transparent',
                  }}
                  className="header-user-demo-btn"
                >
                  <span className="material-symbols-outlined fs-16">person</span>
                  Jane Smith (Sales Rep)
                </button>
                <button
                  onClick={() => handleSwitchUser('manager@convincesense.com')}
                  style={{
                    background: currentUser?.role === 'MANAGER' ? 'var(--bg-card)' : 'transparent',
                  }}
                  className="header-user-demo-btn"
                >
                  <span className="material-symbols-outlined fs-16">supervisor_account</span>
                  Sarah Connor (Manager)
                </button>
                <button
                  onClick={() => handleSwitchUser('admin@convincesense.com')}
                  style={{
                    background: currentUser?.role === 'ADMIN' ? 'var(--bg-card)' : 'transparent',
                  }}
                  className="header-user-demo-btn"
                >
                  <span className="material-symbols-outlined fs-16">admin_panel_settings</span>
                  Alex Rivera (Admin)
                </button>
              </div>

              <div className="border-t-subtle mt-2 pt-2">
                <Link href="/settings" className="no-underline" onClick={() => setShowUserMenu(false)}>
                  <span className="header-user-settings-link">
                    <span className="material-symbols-outlined fs-16">settings</span>
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
