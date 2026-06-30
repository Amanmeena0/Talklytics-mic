'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Footer from '@/components/Footer';
import SentimentBadge from '@/shared/Components/SentimentBadge';
import './calls.css';

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
    setCalls((prev) => prev.map((c) => (c.id === id ? { ...c, isFavorite: !currentStatus } : c)));

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
      setCalls((prev) => prev.map((c) => (c.id === id ? { ...c, isFavorite: currentStatus } : c)));
    }
  };

  // Delete call
  const handleDeleteCall = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    // Optimistic delete
    setCalls((prev) => prev.filter((c) => c.id !== id));
    setTotalCount((prev) => prev - 1);

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
          <header className="calls-header">
            <div>
              <h1 className="text-page-title">Call History &amp; Recording Database</h1>
              <p className="text-body calls-header-sub">
                Browse, search, and analyze all completed sales conversation summaries ({totalCount}{' '}
                total)
              </p>
            </div>

            <Link href="/calls/live" className="calls-link">
              <button className="btn btn-primary">
                <span className="material-symbols-outlined calls-header-icon">sensors</span>
                Start Live Coaching
              </button>
            </Link>
          </header>

          {/* Search & Advanced Filters Bar */}
          <div className="card calls-filter-bar">
            <div className="calls-filter-flex">
              {/* Search input */}
              <div className="search-input calls-search-container">
                <span className="material-symbols-outlined calls-search-icon">search</span>
                <input
                  placeholder="Search client, title, transcript keywords..."
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Sentiment filter */}
              <div className="calls-filter-group">
                <span className="calls-filter-label">Sentiment:</span>
                <select
                  value={sentiment}
                  onChange={(e) => {
                    setSentiment(e.target.value);
                    setPage(1);
                  }}
                  className="calls-select"
                  title="Filter by sentiment"
                >
                  <option value="All">All Sentiments</option>
                  <option value="Positive">Positive</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                </select>
              </div>

              {/* Min score filter */}
              <div className="calls-filter-group">
                <span className="calls-filter-label">Min Score:</span>
                <select
                  value={minScore}
                  onChange={(e) => {
                    setMinScore(e.target.value);
                    setPage(1);
                  }}
                  className="calls-select"
                  title="Filter by minimum score"
                >
                  <option value="All">All Scores</option>
                  <option value="4">4.0+ / 5</option>
                  <option value="3">3.0+ / 5</option>
                  <option value="2">2.0+ / 5</option>
                </select>
              </div>

              {/* Favorite toggle */}
              <button
                onClick={() => {
                  setIsFavoriteOnly(!isFavoriteOnly);
                  setPage(1);
                }}
                className={`btn btn-secondary calls-btn-star ${isFavoriteOnly ? 'calls-btn-star-active' : ''}`}
              >
                <span
                  className={`material-symbols-outlined calls-btn-star-icon ${isFavoriteOnly ? 'calls-btn-star-icon-filled' : ''}`}
                >
                  star
                </span>
                Starred Only
              </button>

              {/* Sort selector */}
              <div className="calls-sort-container">
                <span className="calls-filter-label">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="calls-select"
                  title="Sort calls by"
                >
                  <option value="date">Date</option>
                  <option value="score">Engagement Score</option>
                  <option value="duration">Call Duration</option>
                  <option value="title">Alphabetical</option>
                </select>

                <button
                  onClick={() => {
                    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                    setPage(1);
                  }}
                  className="icon-btn calls-btn-sort-order"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  <span className="material-symbols-outlined calls-icon-18">
                    {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="calls-error-banner">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Recordings List */}
          <div className="card-flush calls-table-container">
            <div className="calls-table-responsive">
              <table className="calls-table">
                <thead>
                  <tr className="calls-table-header-row">
                    <th className="calls-th-star" />
                    <th className="calls-th">CLIENT</th>
                    <th className="calls-th">RECORDING TITLE</th>
                    <th className="calls-th">DATE</th>
                    <th className="calls-th">DURATION</th>
                    <th className="calls-th">SENTIMENT</th>
                    <th className="calls-th">AVG SCORE</th>
                    <th className="calls-th-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    // Skeleton Rows
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="calls-tr-skeleton">
                        <td className="calls-td" />
                        <td className="calls-td">
                          <div className="calls-skeleton-client animate-pulse" />
                        </td>
                        <td className="calls-td">
                          <div className="calls-skeleton-title animate-pulse" />
                        </td>
                        <td className="calls-td">
                          <div className="calls-skeleton-date animate-pulse" />
                        </td>
                        <td className="calls-td">
                          <div className="calls-skeleton-duration animate-pulse" />
                        </td>
                        <td className="calls-td">
                          <div className="calls-skeleton-sentiment animate-pulse" />
                        </td>
                        <td className="calls-td">
                          <div className="calls-skeleton-score animate-pulse" />
                        </td>
                        <td className="calls-td" />
                      </tr>
                    ))
                  ) : calls.length > 0 ? (
                    calls.map((call) => (
                      <tr key={call.id} className="calls-tr hover:bg-[rgba(255,255,255,0.01)]">
                        {/* Star / Favorite toggle */}
                        <td className="calls-td" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleFavorite(call.id, call.isFavorite)}
                            className={`calls-btn-favorite-star ${call.isFavorite ? 'calls-btn-favorite-star-active' : ''}`}
                            title={call.isFavorite ? 'Unstar recording' : 'Star recording'}
                          >
                            <span
                              className={`material-symbols-outlined calls-favorite-star-icon ${call.isFavorite ? 'calls-favorite-star-icon-filled' : ''}`}
                            >
                              star
                            </span>
                          </button>
                        </td>

                        {/* Client name */}
                        <td
                          className="calls-td-client"
                          onClick={() => router.push(`/calls/${call.id}`)}
                        >
                          {call.clientName}
                        </td>

                        {/* Call title */}
                        <td className="calls-td" onClick={() => router.push(`/calls/${call.id}`)}>
                          <div className="calls-cell-title">{call.title}</div>
                          {call.salesRep && (
                            <div className="calls-cell-rep">Rep: {call.salesRep.name}</div>
                          )}
                        </td>

                        {/* Date */}
                        <td
                          className="calls-td-secondary"
                          onClick={() => router.push(`/calls/${call.id}`)}
                        >
                          {formatDate(call.date)}
                        </td>

                        {/* Duration */}
                        <td
                          className="calls-td-secondary"
                          onClick={() => router.push(`/calls/${call.id}`)}
                        >
                          {formatDuration(call.duration)}
                        </td>

                        {/* Sentiment */}
                        <td className="calls-td" onClick={() => router.push(`/calls/${call.id}`)}>
                          <SentimentBadge sentiment={call.overallSentiment} />
                        </td>

                        {/* Average score */}
                        <td className="calls-td" onClick={() => router.push(`/calls/${call.id}`)}>
                          <span
                            className={`calls-score-badge ${
                              call.averageScore >= 4
                                ? 'calls-score-high'
                                : call.averageScore <= 2.5
                                  ? 'calls-score-low'
                                  : 'calls-score-medium'
                            }`}
                          >
                            {call.averageScore.toFixed(1)}/5
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="calls-td-actions" onClick={(e) => e.stopPropagation()}>
                          <div className="calls-actions-flex">
                            <Link href={`/calls/${call.id}`} className="calls-link">
                              <button className="btn btn-ghost calls-btn-details">Details</button>
                            </Link>
                            <button
                              onClick={() => handleDeleteCall(call.id, call.title)}
                              className="icon-btn calls-btn-delete"
                              title="Delete recording"
                            >
                              <span className="material-symbols-outlined calls-icon-18">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Empty State
                    <tr>
                      <td colSpan={8} className="calls-empty-cell">
                        <span className="material-symbols-outlined calls-empty-icon">
                          history_toggle_off
                        </span>
                        <p className="calls-empty-title">No call records found</p>
                        <p className="text-caption calls-empty-subtitle">
                          Try adjusting your search queries or active filters
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="calls-pagination">
                <span className="text-caption calls-pagination-label">
                  Showing page {page} of {totalPages} ({totalCount} total calls)
                </span>
                <div className="calls-pagination-buttons">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="btn btn-secondary calls-btn-pagination"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="btn btn-secondary calls-btn-pagination"
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
