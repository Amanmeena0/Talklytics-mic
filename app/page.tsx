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
    setRecentCalls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !currentStatus } : c))
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
            <p className="text-body">Loading dashboard...</p>
            <div className="analytics-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card animate-pulse analytics-skeleton-card" />
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
          <header className="d-flex justify-between align-start mb-8">
            <div>
              <span className="badge badge-accent mb-2">Enterprise Agent</span>
              <h1 className="text-page-title">Welcome Back, {activeUser?.name || 'Jane'}</h1>
              <p className="text-body mt-1">
                Here is your AI conversation intelligence activity for today.
              </p>
            </div>

            <div className="d-flex gap-3">
              <Link href="/calls/live" className="no-underline">
                <button className="btn btn-primary">
                  <span className="material-symbols-outlined fs-16 mr-6">sensors</span>
                  Go Live Monitor
                </button>
              </Link>
            </div>
          </header>

          {/* Metric cards grid */}
          <div className="analytics-metrics-grid">
            <div className="card">
              <p className="text-overline color-secondary">TOTAL CALLS</p>
              <h3 className="fs-28 font-bold mt-2 mb-1 color-primary">{stats?.totalCalls || 0}</h3>
              <p className="mt-1 fs-11 color-secondary">
                {stats?.totalDurationMinutes || 0} minutes total
              </p>
            </div>

            <div className="card">
              <p className="text-overline color-secondary">AVG INTEREST SCORE</p>
              <h3 className="fs-28 font-bold mt-2 mb-1 color-accent">
                {(stats?.averageScore || 0).toFixed(1)}/5
              </h3>
              <p className="mt-1 fs-11 color-success">🟢 High Engagement Avg</p>
            </div>

            <div className="card">
              <p className="text-overline color-secondary">CONVERSION CHANCE</p>
              <h3 className="fs-28 font-bold mt-2 mb-1 color-success">
                {stats?.averageConversionProbability || 0}%
              </h3>
              <p className="mt-1 fs-11 color-secondary">Aggregated Win Chance</p>
            </div>

            <div className="card">
              <p className="text-overline color-secondary">BANT COMPLETION</p>
              <h3 className="fs-28 font-bold mt-2 mb-1 color-info">
                {stats?.bantCompletionRate || 0}%
              </h3>
              <p className="mt-1 fs-11 color-secondary">Compliance qualification</p>
            </div>
          </div>

          <div className="grid-dashboard">
            {/* Recent Calls */}
            <div className="card-flush lg:col-span-8">
              <div
                className="d-flex justify-between align-center p-4 gap-4"
                style={{
                  borderBottom: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)',
                  paddingLeft: 'var(--space-6)',
                  paddingRight: 'var(--space-6)',
                }}
              >
                <h2 className="text-section-heading m-0 d-flex align-center gap-8px">
                  <span className="material-symbols-outlined fs-20 color-accent">history</span>
                  Recent Conversation Records
                </h2>
                <Link href="/calls" className="no-underline fs-12 color-accent font-semibold">
                  View All History →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="dashboard-table">
                  <thead>
                    <tr className="dashboard-table-header-row">
                      <th className="dashboard-table-th-star" />
                      <th className="dashboard-table-th">CLIENT</th>
                      <th className="dashboard-table-th">TITLE</th>
                      <th className="dashboard-table-th">DURATION</th>
                      <th className="dashboard-table-th">SENTIMENT</th>
                      <th className="dashboard-table-th text-right">SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCalls.length > 0 ? (
                      recentCalls.map((call) => (
                        <tr
                          key={call.id}
                          className="dashboard-table-row hover:bg-[rgba(255,255,255,0.01)]"
                        >
                          <td className="dashboard-table-td" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleFavorite(call.id, call.isFavorite)}
                              style={{
                                color: call.isFavorite ? 'var(--warning)' : 'var(--text-muted)',
                              }}
                              className="dashboard-star-btn"
                            >
                              <span
                                className="material-symbols-outlined fs-18"
                                style={{
                                  fontVariationSettings: call.isFavorite ? "'FILL' 1" : undefined,
                                }}
                              >
                                star
                              </span>
                            </button>
                          </td>
                          <td
                            className="dashboard-table-td font-semibold fs-13"
                            onClick={() => router.push(`/calls/${call.id}`)}
                          >
                            {call.clientName}
                          </td>
                          <td
                            className="dashboard-table-td fs-13"
                            onClick={() => router.push(`/calls/${call.id}`)}
                          >
                            <div>{call.title}</div>
                            <span className="fs-10 color-muted">{formatDate(call.date)}</span>
                          </td>
                          <td
                            className="dashboard-table-td color-secondary fs-13"
                            onClick={() => router.push(`/calls/${call.id}`)}
                          >
                            {formatDuration(call.duration)}
                          </td>
                          <td
                            className="dashboard-table-td"
                            onClick={() => router.push(`/calls/${call.id}`)}
                          >
                            <SentimentBadge sentiment={call.overallSentiment} />
                          </td>
                          <td
                            className="dashboard-table-td text-right font-bold fs-13 color-accent"
                            onClick={() => router.push(`/calls/${call.id}`)}
                          >
                            {call.averageScore.toFixed(1)}/5
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="dashboard-table-td text-center color-muted"
                          style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}
                        >
                          No call recordings available. Connect to the WebSocket stream to capture
                          logs.
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
                <h2 className="text-section-heading mb-6">Workspace Notifications</h2>
                <div className="d-flex flex-col gap-4">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="dashboard-notif-item">
                        <span
                          className="material-symbols-outlined fs-20"
                          style={{
                            color:
                              n.type === 'SUCCESS'
                                ? 'var(--success)'
                                : n.type === 'WARNING'
                                  ? 'var(--warning)'
                                  : 'var(--accent)',
                          }}
                        >
                          {n.type === 'SUCCESS'
                            ? 'check_circle'
                            : n.type === 'WARNING'
                              ? 'warning'
                              : 'info'}
                        </span>
                        <div>
                          <span className="fs-12 font-semibold d-block color-primary">
                            {n.title}
                          </span>
                          <span className="fs-11 color-secondary">{n.description}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-caption m-0">No new alerts.</p>
                  )}
                </div>
              </div>

              <div className="analytics-footer-info">
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
