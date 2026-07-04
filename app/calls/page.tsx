'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '@/shared/components/Layout/Layout';
import SentimentBadge from '@/shared/components/SentimentBadge';
import clientFetch from '@/shared/utils/clientFetch';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Clock,
  Sparkles,
  ArrowUpDown,
  Filter,
  CheckCircle,
  Video,
  Database
} from 'lucide-react';

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

  // Modal & Recording States
  const [selectedCallForModal, setSelectedCallForModal] = useState<any | null>(null);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);

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

      const res = await clientFetch(`/api/calls?${params.toString()}`);
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
    setCalls((prev) => prev.map((c) => (c.id === id ? { ...c, isFavorite: !currentStatus } : c)));

    try {
      const res = await clientFetch(`/api/calls/${id}`, {
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

    setCalls((prev) => prev.filter((c) => c.id !== id));
    setTotalCount((prev) => prev - 1);

    try {
      const res = await clientFetch(`/api/calls/${id}`, {
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
      <main className="min-h-screen bg-[#FAFBFC] pt-20 px-8 pb-16 font-sans text-slate-900">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E5E7EB] pb-6">
            <div className="space-y-1">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Conversation Audit</span>
              <h1 className="text-2xl font-bold text-[#111827] mt-3">Recording Database</h1>
              <p className="text-xs text-[#6B7280]">
                Search, analyze, and inspect completed calls ({totalCount} reports available)
              </p>
            </div>

            <Link href="/calls/live">
              <button
                type="button"
                aria-label="Start Live Coaching"
                title="Start Live Coaching"
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-5 py-3 rounded-full shadow-sm hover:shadow-indigo-100 hover:shadow-md transition-all flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Start Live Coaching
              </button>
            </Link>
          </header>

          {/* Search & Advanced Filters Bar */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Search input */}
              <div className="md:col-span-4 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  placeholder="Search client, keywords, summaries..."
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 transition-all"
                />
              </div>

              {/* Sentiment filter */}
              <div className="md:col-span-2 flex items-center gap-2 bg-slate-50/50 border border-[#E5E7EB] px-3 py-1.5 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sentiment}
                  onChange={(e) => {
                    setSentiment(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-semibold bg-transparent border-0 p-0 outline-none cursor-pointer text-slate-700"
                >
                  <option value="All">Sentiments</option>
                  <option value="Positive">Positive</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                </select>
              </div>

              {/* Min score filter */}
              <div className="md:col-span-2 flex items-center gap-2 bg-slate-50/50 border border-[#E5E7EB] px-3 py-1.5 rounded-xl">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={minScore}
                  onChange={(e) => {
                    setMinScore(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-semibold bg-transparent border-0 p-0 outline-none cursor-pointer text-slate-700"
                >
                  <option value="All">All Scores</option>
                  <option value="4">4.0+ / 5</option>
                  <option value="3">3.0+ / 5</option>
                  <option value="2">2.0+ / 5</option>
                </select>
              </div>

              {/* Starred Only Toggle */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFavoriteOnly(!isFavoriteOnly);
                    setPage(1);
                  }}
                  aria-pressed={isFavoriteOnly}
                  aria-label={isFavoriteOnly ? 'Show all calls' : 'Show starred calls only'}
                  title={isFavoriteOnly ? 'Show all calls' : 'Show starred calls only'}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 border rounded-xl text-xs font-semibold transition-all ${
                    isFavoriteOnly 
                      ? 'bg-amber-50 border-amber-200 text-amber-700' 
                      : 'bg-white border-[#E5E7EB] text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isFavoriteOnly ? 'fill-current' : ''}`} />
                  Starred Only
                </button>
              </div>

              {/* Sorting tools */}
              <div className="md:col-span-2 flex items-center gap-1 bg-slate-50/50 border border-[#E5E7EB] px-2 py-1 rounded-xl">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-[10px] font-bold bg-transparent border-0 p-1.5 outline-none cursor-pointer text-slate-600"
                >
                  <option value="date">Sort: Date</option>
                  <option value="score">Sort: Score</option>
                  <option value="duration">Sort: Duration</option>
                  <option value="title">Sort: Name</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                    setPage(1);
                  }}
                  aria-label="Toggle sort direction"
                  className="p-1.5 rounded-lg bg-white border border-[#E5E7EB] hover:border-slate-300 transition-colors text-slate-500"
                  title="Toggle sort direction"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {/* Table list */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-[#E5E7EB] text-[#6B7280] font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-4 px-6 w-10 text-center">Star</th>
                    <th className="py-4 px-6">Client</th>
                    <th className="py-4 px-6">Recording Title</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Duration</th>
                    <th className="py-4 px-6">Sentiment</th>
                    <th className="py-4 px-6">Avg Score</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    // Skeleton Rows
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-[#E5E7EB]/40 animate-pulse">
                        <td className="py-4 px-6"><div className="w-4 h-4 bg-slate-100 rounded mx-auto" /></td>
                        <td className="py-4 px-6"><div className="w-24 h-4 bg-slate-100 rounded" /></td>
                        <td className="py-4 px-6"><div className="w-40 h-4 bg-slate-100 rounded mb-1" /><div className="w-16 h-3 bg-slate-50 rounded" /></td>
                        <td className="py-4 px-6"><div className="w-16 h-4 bg-slate-100 rounded" /></td>
                        <td className="py-4 px-6"><div className="w-12 h-4 bg-slate-100 rounded" /></td>
                        <td className="py-4 px-6"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                        <td className="py-4 px-6"><div className="w-8 h-4 bg-slate-100 rounded" /></td>
                        <td className="py-4 px-6 text-right"><div className="w-12 h-6 bg-slate-100 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : calls.length > 0 ? (
                    calls.map((call) => {
                      const isPlaying = playingCallId === call.id;
                      return (
                        <React.Fragment key={call.id}>
                          <tr 
                            onClick={() => setSelectedCallForModal(call)}
                            className="border-b border-[#E5E7EB] hover:bg-slate-50/40 transition-all cursor-pointer"
                          >
                            <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleToggleFavorite(call.id, call.isFavorite)}
                                aria-label={call.isFavorite ? `Remove ${call.title} from starred calls` : `Add ${call.title} to starred calls`}
                                title={call.isFavorite ? `Remove ${call.title} from starred calls` : `Add ${call.title} to starred calls`}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors ${call.isFavorite ? 'text-amber-500' : 'text-slate-300'}`}
                              >
                                <Star className={`w-4 h-4 ${call.isFavorite ? 'fill-current' : ''}`} />
                              </button>
                            </td>
                            <td className="py-4 px-6 font-semibold text-slate-800">{call.clientName}</td>
                            <td className="py-4 px-6 font-medium text-slate-900">{call.title}</td>
                            <td className="py-4 px-6 text-slate-500">{formatDate(call.date)}</td>
                            <td className="py-4 px-6 text-slate-500">{formatDuration(call.duration)}</td>
                            <td className="py-4 px-6">
                              <SentimentBadge sentiment={call.overallSentiment} />
                            </td>
                            <td className="py-4 px-6 font-bold text-slate-700">{call.averageScore.toFixed(1)}/5</td>
                            <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                <Link 
                                  href={`/calls/${call.id}`}
                                  className="p-2 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all"
                                  title="View intelligence report"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCall(call.id, call.title)}
                                  aria-label={`Delete ${call.title}`}
                                  title="Delete record"
                                  className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-400 space-y-3">
                        <Database className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-xs font-semibold uppercase">No Recordings Found Matching Criteria</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="p-4 bg-slate-50 border-t border-[#E5E7EB] flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-500">
                Page {page} of {totalPages} ({totalCount} entries)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                  title="Previous page"
                  className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium hover:border-slate-300 disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center gap-1 text-slate-700"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                  title="Next page"
                  className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium hover:border-slate-300 disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center gap-1 text-slate-700"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Modal for Recording Details */}
      <AnimatePresence>
        {selectedCallForModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl max-w-2xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-50/50 border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">
                    {selectedCallForModal.clientName}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                    {selectedCallForModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedCallForModal(null);
                    setPlayingCallId(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined fs-20">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Audio Controller */}
                <div className="bg-slate-50/50 border border-[#E5E7EB] p-4 rounded-xl space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPlayingCallId(playingCallId === selectedCallForModal.id ? null : selectedCallForModal.id)}
                      aria-label={playingCallId === selectedCallForModal.id ? 'Pause audio playback' : 'Play audio playback'}
                      title={playingCallId === selectedCallForModal.id ? 'Pause audio playback' : 'Play audio playback'}
                      className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-sm transition-all"
                    >
                      {playingCallId === selectedCallForModal.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Audio Record</span>
                      <span className="text-xs font-bold text-slate-800">
                        {playingCallId === selectedCallForModal.id ? 'Playing transcript audio...' : 'Audio recording ready'}
                      </span>
                    </div>
                  </div>
                  
                  {playingCallId === selectedCallForModal.id && (
                    <div className="h-6 flex items-center justify-between gap-0.5 pt-2">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <span 
                          key={i} 
                          className="w-1 bg-indigo-500 rounded-full transition-all duration-300"
                          style={{ 
                            height: `${Math.max(4, Math.random() * 24)}px`,
                            animation: 'pulse 1.2s infinite ease-in-out',
                            animationDelay: `${i * 0.05}s`
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Executive Summary */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">AI Generated Executive Summary</span>
                  <div className="text-xs text-slate-600 leading-relaxed bg-white border border-[#E5E7EB] p-4 rounded-xl shadow-sm font-medium prose max-w-none">
                    <ReactMarkdown>
                      {selectedCallForModal.summary || 'Summary data not available for this record.'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50/50 border-t border-[#E5E7EB] px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCallForModal(null);
                    setPlayingCallId(null);
                  }}
                  className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <Link 
                  href={`/calls/${selectedCallForModal.id}`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center gap-1"
                >
                  Full Report
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
