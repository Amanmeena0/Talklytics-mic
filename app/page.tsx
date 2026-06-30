'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Footer from '@/components/Footer';
import SentimentBadge from '@/shared/Components/SentimentBadge';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analyticsRes, callsRes, userRes, notifRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/calls?limit=5'), // Top 5 recent calls
        fetch('/api/users'),
        fetch('/api/notifications?limit=3'), // Top 3 notifications
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setStats(data);
      }
      if (callsRes.ok) {
        const data = await callsRes.json();
        setRecentCalls(data.calls);
      }
      if (userRes.ok) {
        const data = await userRes.json();
        setActiveUser(data);
      }
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.slice(0, 3));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Toggle favorite on list
  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    setRecentCalls(prev =>
      prev.map(c => (c.id === id ? { ...c, isFavorite: !currentStatus } : c))
    );

    try {
      await fetch(`/api/calls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentStatus }),
      });
    } catch (e) {
      console.error(e);
      loadDashboardData(); // Reload to align state
    }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <main className="main-content">
          <div className="content-container">
            <h1 className="text-page-title">Workspace Dashboard</h1>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginTop: '20px' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card animate-pulse" style={{ height: '110px' }} />
              ))}
            </div>
          </div>
          <Footer />
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="main-content">
        <div className="content-container">
          
          {/* Header */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
            <div>
              <span className="badge badge-accent" style={{ marginBottom: 'var(--space-2)' }}>Enterprise Agent</span>
              <h1 className="text-page-title">Welcome Back, {activeUser?.name || 'Jane'}</h1>
              <p className="text-body" style={{ marginTop: 'var(--space-1)' }}>
                Here is your AI conversation intelligence activity for today.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Link href="/calls/live" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '6px' }}>sensors</span>
                  Go Live Monitor
                </button>
              </Link>
            </div>
          </header>

          {/* Metric cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="card">
              <p className="text-overline" style={{ color: 'var(--text-secondary)' }}>TOTAL CALLS</p>
              <h3 style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>{stats?.totalCalls || 0}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>{stats?.totalDurationMinutes || 0} minutes total</p>
            </div>

            <div className="card">
              <p className="text-overline" style={{ color: 'var(--text-secondary)' }}>AVG INTEREST SCORE</p>
              <h3 style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--accent)' }}>{(stats?.averageScore || 0).toFixed(1)}/5</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--success)' }}>🟢 High Engagement Avg</p>
            </div>

            <div className="card">
              <p className="text-overline" style={{ color: 'var(--text-secondary)' }}>CONVERSION CHANCE</p>
              <h3 style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--success)' }}>{stats?.averageConversionProbability || 0}%</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>Aggregated Win Chance</p>
            </div>

            <div className="card">
              <p className="text-overline" style={{ color: 'var(--text-secondary)' }}>BANT COMPLETION</p>
              <h3 style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--info)' }}>{stats?.bantCompletionRate || 0}%</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>Compliance qualification</p>
            </div>
          </div>

          <div className="grid-dashboard">
            {/* Recent Calls */}
            <div className="card-flush lg:col-span-8">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
                <h2 className="text-section-heading" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--accent)' }}>history</span>
                  Recent Conversation Records
                </h2>
                <Link href="/calls" style={{ textDecoration: 'none', fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>
                  View All History →
                </Link>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'rgba(255,255,255,0.01)' }}>
                      <th style={{ padding: '12px var(--space-6)', width: '48px' }} />
                      <th style={{ padding: '12px var(--space-6)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>CLIENT</th>
                      <th style={{ padding: '12px var(--space-6)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>TITLE</th>
                      <th style={{ padding: '12px var(--space-6)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>DURATION</th>
                      <th style={{ padding: '12px var(--space-6)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>SENTIMENT</th>
                      <th style={{ padding: '12px var(--space-6)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCalls.length > 0 ? (
                      recentCalls.map(call => (
                        <tr
                          key={call.id}
                          style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                          className="hover:bg-[rgba(255,255,255,0.01)]"
                        >
                          <td style={{ padding: '12px var(--space-6)' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleFavorite(call.id, call.isFavorite)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: call.isFavorite ? 'var(--warning)' : 'var(--text-muted)', padding: 0 }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: call.isFavorite ? "'FILL' 1" : undefined }}>star</span>
                            </button>
                          </td>
                          <td style={{ padding: '12px var(--space-6)', fontWeight: 600, fontSize: '13px' }} onClick={() => router.push(`/calls/${call.id}`)}>
                            {call.clientName}
                          </td>
                          <td style={{ padding: '12px var(--space-6)', fontSize: '13px' }} onClick={() => router.push(`/calls/${call.id}`)}>
                            <div>{call.title}</div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{formatDate(call.date)}</span>
                          </td>
                          <td style={{ padding: '12px var(--space-6)', color: 'var(--text-secondary)', fontSize: '13px' }} onClick={() => router.push(`/calls/${call.id}`)}>
                            {formatDuration(call.duration)}
                          </td>
                          <td style={{ padding: '12px var(--space-6)' }} onClick={() => router.push(`/calls/${call.id}`)}>
                            <SentimentBadge sentiment={call.overallSentiment} />
                          </td>
                          <td style={{ padding: '12px var(--space-6)', textAlign: 'right', fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }} onClick={() => router.push(`/calls/${call.id}`)}>
                            {call.averageScore.toFixed(1)}/5
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: 'var(--space-8) 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No call recordings available. Connect to the WebSocket stream to capture logs.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notifications & System Updates */}
            <div className="card lg:col-span-4 flex flex-col justify-between">
              <div>
                <h2 className="text-section-heading" style={{ marginBottom: 'var(--space-6)' }}>Workspace Notifications</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                        <span className="material-symbols-outlined" style={{
                          fontSize: '20px',
                          color: n.type === 'SUCCESS' ? 'var(--success)' : n.type === 'WARNING' ? 'var(--warning)' : 'var(--accent)'
                        }}>
                          {n.type === 'SUCCESS' ? 'check_circle' : n.type === 'WARNING' ? 'warning' : 'info'}
                        </span>
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>{n.title}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{n.description}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-caption" style={{ margin: 0 }}>No new alerts.</p>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Role: {activeUser?.role || 'Guest'}</span>
                <span>Active User: {activeUser?.name || 'Jane'}</span>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </Layout>
  );
}
