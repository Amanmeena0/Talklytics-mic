'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Footer from '@/components/Footer';
import SentimentBadge from '@/shared/Components/SentimentBadge';

import { useRouter } from 'next/navigation';

export default function CallHistoryPage() {
  const router = useRouter();
  // Search & Filters State
  const [query, setQuery] = useState('');
  const [sentiment, setSentiment] = useState('All');
  const [minScore, setMinScore] = useState('All');
  const [isFavoriteOnly, setIsFavoriteOnly] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Data State
  const [calls, setCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load calls from API
  const fetchCalls = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (query.trim()) params.append('query', query.trim());
      if (sentiment !== 'All') params.append('sentiment', sentiment);
      if (minScore !== 'All') params.append('minScore', minScore);
      if (isFavoriteOnly) params.append('isFavorite', 'true');

      const res = await fetch(`/api/calls?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }
      const data = await res.json();
      setCalls(data.calls);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.totalCount);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recordings');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, query, sentiment, minScore, isFavoriteOnly, sortBy, sortOrder]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  // Toggle favorite
  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setCalls(prev =>
      prev.map(c => (c.id === id ? { ...c, isFavorite: !currentStatus } : c))
    );

    try {
      const res = await fetch(`/api/calls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentStatus }),
      });
      if (!res.ok) {
        throw new Error('Failed to update favorite status');
      }
    } catch (e) {
      console.error(e);
      // Revert if error
      setCalls(prev =>
        prev.map(c => (c.id === id ? { ...c, isFavorite: currentStatus } : c))
      );
    }
  };

  // Delete call
  const handleDeleteCall = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    // Optimistic delete
    setCalls(prev => prev.filter(c => c.id !== id));
    setTotalCount(prev => prev - 1);

    try {
      const res = await fetch(`/api/calls/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete call');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete call record');
      fetchCalls(); // Re-fetch to align
    }
  };

  // Helpers
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

  return (
    <Layout>
      <main className="main-content">
        <div className="content-container">
          {/* Header */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
            <div>
              <h1 className="text-page-title">Call History &amp; Recording Database</h1>
              <p className="text-body" style={{ marginTop: 'var(--space-1)' }}>
                Browse, search, and analyze all completed sales conversation summaries ({totalCount} total)
              </p>
            </div>
            
            <Link href="/calls/live" style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '6px' }}>sensors</span>
                Start Live Coaching
              </button>
            </Link>
          </header>

          {/* Search & Advanced Filters Bar */}
          <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search input */}
              <div className="search-input" style={{ flex: '1 1 240px', margin: 0, border: '1px solid var(--border-default)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--text-muted)' }}>search</span>
                <input
                  placeholder="Search client, title, transcript keywords..."
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                />
              </div>

              {/* Sentiment filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Sentiment:</span>
                <select
                  value={sentiment}
                  onChange={(e) => { setSentiment(e.target.value); setPage(1); }}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                >
                  <option value="All">All Sentiments</option>
                  <option value="Positive">Positive</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                </select>
              </div>

              {/* Min score filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Min Score:</span>
                <select
                  value={minScore}
                  onChange={(e) => { setMinScore(e.target.value); setPage(1); }}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                >
                  <option value="All">All Scores</option>
                  <option value="4">4.0+ / 5</option>
                  <option value="3">3.0+ / 5</option>
                  <option value="2">2.0+ / 5</option>
                </select>
              </div>

              {/* Favorite toggle */}
              <button
                onClick={() => { setIsFavoriteOnly(!isFavoriteOnly); setPage(1); }}
                className="btn btn-secondary"
                style={{
                  background: isFavoriteOnly ? 'var(--accent-muted)' : 'var(--bg-card)',
                  borderColor: isFavoriteOnly ? 'var(--accent)' : 'var(--border-default)',
                  color: isFavoriteOnly ? 'var(--accent)' : 'var(--text-primary)',
                  fontSize: '12px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: isFavoriteOnly ? "'FILL' 1" : undefined }}>star</span>
                Starred Only
              </button>

              {/* Sort selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                >
                  <option value="date">Date</option>
                  <option value="score">Engagement Score</option>
                  <option value="duration">Call Duration</option>
                  <option value="title">Alphabetical</option>
                </select>

                <button
                  onClick={() => { setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); setPage(1); }}
                  className="icon-btn"
                  style={{ border: '1px solid var(--border-default)', height: '34px', width: '34px', borderRadius: 'var(--radius-sm)' }}
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div style={{ background: 'var(--error-muted)', color: 'var(--error)', border: '1px solid var(--error)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Recordings List */}
          <div className="card-flush" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
                    <th style={{ padding: 'var(--space-4) var(--space-6)', width: '48px' }} />
                    <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>CLIENT</th>
                    <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>RECORDING TITLE</th>
                    <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>DATE</th>
                    <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>DURATION</th>
                    <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>SENTIMENT</th>
                    <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>AVG SCORE</th>
                    <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    // Skeleton Rows
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', opacity: 0.5 }}>
                        <td style={{ padding: 'var(--space-4) var(--space-6)' }} />
                        <td style={{ padding: 'var(--space-4) var(--space-6)' }}><div style={{ width: '80px', height: '14px', background: 'var(--border-default)', borderRadius: '4px' }} className="animate-pulse" /></td>
                        <td style={{ padding: 'var(--space-4) var(--space-6)' }}><div style={{ width: '180px', height: '14px', background: 'var(--border-default)', borderRadius: '4px' }} className="animate-pulse" /></td>
                        <td style={{ padding: 'var(--space-4) var(--space-6)' }}><div style={{ width: '70px', height: '14px', background: 'var(--border-default)', borderRadius: '4px' }} className="animate-pulse" /></td>
                        <td style={{ padding: 'var(--space-4) var(--space-6)' }}><div style={{ width: '50px', height: '14px', background: 'var(--border-default)', borderRadius: '4px' }} className="animate-pulse" /></td>
                        <td style={{ padding: 'var(--space-4) var(--space-6)' }}><div style={{ width: '60px', height: '20px', background: 'var(--border-default)', borderRadius: '10px' }} className="animate-pulse" /></td>
                        <td style={{ padding: 'var(--space-4) var(--space-6)' }}><div style={{ width: '40px', height: '14px', background: 'var(--border-default)', borderRadius: '4px' }} className="animate-pulse" /></td>
                        <td style={{ padding: 'var(--space-4) var(--space-6)' }} />
                      </tr>
                    ))
                  ) : calls.length > 0 ? (
                    calls.map((call) => (
                      <tr
                        key={call.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background 0.2s ease',
                          cursor: 'pointer'
                        }}
                        className="hover:bg-[rgba(255,255,255,0.01)]"
                      >
                        {/* Star / Favorite toggle */}
                        <td style={{ padding: 'var(--space-4) var(--space-6)' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleFavorite(call.id, call.isFavorite)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: call.isFavorite ? 'var(--warning)' : 'var(--text-muted)',
                              padding: 0,
                              display: 'flex'
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: call.isFavorite ? "'FILL' 1" : undefined }}>
                              star
                            </span>
                          </button>
                        </td>

                        {/* Client name */}
                        <td style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }} onClick={() => router.push(`/calls/${call.id}`)}>
                          {call.clientName}
                        </td>

                        {/* Call title */}
                        <td style={{ padding: 'var(--space-4) var(--space-6)' }} onClick={() => router.push(`/calls/${call.id}`)}>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '13px' }}>{call.title}</div>
                          {call.salesRep && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Rep: {call.salesRep.name}</div>
                          )}
                        </td>

                        {/* Date */}
                        <td style={{ padding: 'var(--space-4) var(--space-6)', color: 'var(--text-secondary)', fontSize: '13px' }} onClick={() => router.push(`/calls/${call.id}`)}>
                          {formatDate(call.date)}
                        </td>

                        {/* Duration */}
                        <td style={{ padding: 'var(--space-4) var(--space-6)', color: 'var(--text-secondary)', fontSize: '13px' }} onClick={() => router.push(`/calls/${call.id}`)}>
                          {formatDuration(call.duration)}
                        </td>

                        {/* Sentiment */}
                        <td style={{ padding: 'var(--space-4) var(--space-6)' }} onClick={() => router.push(`/calls/${call.id}`)}>
                          <SentimentBadge sentiment={call.overallSentiment} />
                        </td>

                        {/* Average score */}
                        <td style={{ padding: 'var(--space-4) var(--space-6)' }} onClick={() => router.push(`/calls/${call.id}`)}>
                          <span style={{
                            color: call.averageScore >= 4 ? 'var(--success)' : call.averageScore <= 2.5 ? 'var(--error)' : 'var(--warning)',
                            fontWeight: 700,
                            fontSize: '13px'
                          }}>
                            {call.averageScore.toFixed(1)}/5
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: 'var(--space-4) var(--space-6)', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <Link href={`/calls/${call.id}`} style={{ textDecoration: 'none' }}>
                              <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>
                                Details
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDeleteCall(call.id, call.title)}
                              className="icon-btn"
                              style={{ color: 'var(--error)', padding: '4px' }}
                              title="Delete recording"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Empty State
                    <tr>
                      <td colSpan={8} style={{ padding: 'var(--space-12) var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3, display: 'block', marginBottom: '8px' }}>history_toggle_off</span>
                        <p style={{ fontWeight: 500, margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>No call records found</p>
                        <p className="text-caption" style={{ marginTop: '4px' }}>Try adjusting your search queries or active filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--border-default)', background: 'var(--bg-elevated)', flexWrap: 'wrap', gap: '12px' }}>
                <span className="text-caption" style={{ fontSize: '12px' }}>
                  Showing page {page} of {totalPages} ({totalCount} total calls)
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="btn btn-secondary"
                    style={{ padding: '4px 12px', fontSize: '12px' }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="btn btn-secondary"
                    style={{ padding: '4px 12px', fontSize: '12px' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </Layout>
  );
}
