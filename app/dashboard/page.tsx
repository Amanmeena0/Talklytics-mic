'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import clientFetch from '@/shared/utils/clientFetch';
import SentimentBadge from '@/shared/components/SentimentBadge';
import Layout from '@/shared/components/Layout/Layout';
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Activity,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Star,
  Trash2,
  ExternalLink,
  ChevronRight,
  User,
  Bell,
  Clock,
  Briefcase
} from 'lucide-react';

export default function DashboardHome() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table interactive states
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState('Talklytics Corporate');

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analyticsRes, callsRes, userRes, notifRes] = await Promise.all([
        clientFetch('/api/analytics'),
        clientFetch('/api/calls?limit=5'),
        clientFetch('/api/users'),
        clientFetch('/api/notifications?limit=3'),
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

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setRecentCalls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !currentStatus } : c))
    );

    try {
      await clientFetch(`/api/calls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentStatus }),
      });
    } catch (e) {
      console.error(e);
      loadDashboardData(); // Revert on failure
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
        <main className="main-content min-h-screen pt-24 px-8 pb-12 flex flex-col justify-center items-center font-sans">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-600/20 border-t-indigo-600 animate-spin mb-4" />
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Assembling Workspace Intelligence...</p>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="main-content min-h-screen pt-20 px-8 pb-16 font-sans text-slate-900">
        <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Workspace Switcher & Top Row */}
        <header className="flex flex-col md:flex-row md:items-left justify-between gap-6 border-b border-[#E5E7EB] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              {/* Custom Workspace Switcher */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold hover:border-slate-300 transition-all text-slate-800">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  {currentWorkspace}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Series A Active</span>
            </div>
            <h1 className="text-2xl font-bold text-[#111827] mt-3">Welcome, {activeUser?.name || 'Jane'}</h1>
            <p className="text-xs text-[#6B7280]">
              Real-time pipeline intelligence and deal coaching overview for today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/calls/live"
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-5 py-3 rounded-full shadow-sm hover:shadow-indigo-100 hover:shadow-md transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Go Live Monitor
            </Link>
          </div>
        </header>

        {/* Spaciously Designed Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'TOTAL CALLS RECORDED',
              value: stats?.totalCalls || 0,
              change: '+18.4% this month',
              sparkline: 'M0 20 Q10 5, 20 18 T40 10 T60 15 T80 5 T100 12',
              color: 'text-indigo-600'
            },
            {
              label: 'AVG ENGAGEMENT SCORE',
              value: `${(stats?.averageScore || 0).toFixed(1)}/5`,
              change: 'Optimal interest level',
              sparkline: 'M0 15 Q10 20, 20 10 T40 8 T60 18 T80 12 T100 5',
              color: 'text-[#10B981]' // Green only on positive metric value
            },
            {
              label: 'WIN PROBABILITY CHANCE',
              value: `${stats?.averageConversionProbability || 0}%`,
              change: '+4.2% deal health boost',
              sparkline: 'M0 25 Q10 18, 20 22 T40 12 T60 8 T80 5 T100 3',
              color: 'text-[#10B981]'
            },
            {
              label: 'BANT QUALIFIED INDEX',
              value: `${stats?.bantCompletionRate || 0}%`,
              change: 'CRM sync compliant',
              sparkline: 'M0 20 Q10 25, 20 15 T40 18 T60 12 T80 10 T100 8',
              color: 'text-indigo-600'
            }
          ].map((metric, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-all duration-300">
              <div className="space-y-1">
                <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider block">{metric.label}</span>
                <span className={`text-3xl font-extrabold ${metric.color} tracking-tight`}>{metric.value}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-500 font-medium">{metric.change}</span>
                {/* Micro Trend Curve */}
                <svg className="w-16 h-8 stroke-indigo-600/40 fill-none stroke-2" viewBox="0 0 100 30">
                  <path d={metric.sparkline} />
                </svg>
              </div>
            </div>
          ))}
        </section>

        {/* Dashboard split layout */}
        <section className="grid lg:grid-cols-12 gap-8">
          
          {/* Recent Call Records Table */}
          <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-6 flex items-center justify-between border-b border-[#E5E7EB]">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-[#111827]">Recent Conversation Intelligence</h2>
                  <p className="text-[10px] text-[#6B7280]">Click a call row to inspect live summaries and recordings</p>
                </div>
                <Link href="/calls" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1">
                  View Database
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-[#E5E7EB] text-[#6B7280] font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-4 px-6 w-10 text-center">Star</th>
                      <th className="py-4 px-6">Client</th>
                      <th className="py-4 px-6">Recording Title</th>
                      <th className="py-4 px-6">Duration</th>
                      <th className="py-4 px-6">Sentiment</th>
                      <th className="py-4 px-6 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCalls.length > 0 ? (
                      recentCalls.map((call) => {
                        return (
                          <React.Fragment key={call.id}>
                            <tr 
                              onClick={() => router.push(`/calls/${call.id}`)}
                              className="border-b border-[#E5E7EB] hover:bg-slate-50/40 transition-colors cursor-pointer"
                            >
                              <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => handleToggleFavorite(call.id, call.isFavorite)}
                                  className={`p-1 rounded hover:bg-slate-100 transition-colors ${call.isFavorite ? 'text-amber-500' : 'text-slate-300'}`}
                                >
                                  <Star className={`w-4 h-4 ${call.isFavorite ? 'fill-current' : ''}`} />
                                </button>
                              </td>
                              <td className="py-4 px-6 font-semibold text-slate-900">{call.clientName}</td>
                              <td className="py-4 px-6">
                                <div className="font-medium text-slate-800">{call.title}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(call.date)}</div>
                              </td>
                              <td className="py-4 px-6 text-slate-500">{formatDuration(call.duration)}</td>
                              <td className="py-4 px-6">
                                <SentimentBadge sentiment={call.overallSentiment} />
                              </td>
                              <td className="py-4 px-6 text-right font-bold text-indigo-600">{call.averageScore.toFixed(1)}/5</td>
                            </tr>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold uppercase text-[10px]">
                          No completed conversation intelligence reports found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#E5E7EB] text-center text-[10px] text-[#6B7280] font-semibold">
              Showing top 5 completed recordings in workspace pipeline
            </div>
          </div>

          {/* AI Insights & Notifications */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* System Notifications */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-[#111827]">Workspace Alerts</h3>
                </div>
                {notifications.length > 0 && (
                  <span className="text-[10px] font-bold text-[#6B7280] bg-slate-100 px-2 py-0.5 rounded-full">
                    {notifications.length} New
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className="flex gap-3 items-start">
                      <div className={`mt-0.5 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                        n.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' :
                        n.type === 'WARNING' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {n.type === 'SUCCESS' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                         n.type === 'WARNING' ? <AlertCircle className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{n.title}</span>
                        <p className="text-[11px] text-slate-500 leading-normal mt-0.5">{n.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 text-center py-4 font-semibold uppercase">No active workspace alerts.</p>
                )}
              </div>
            </div>

            {/* AI Coaching Insight Tip */}
            <div className="bg-gradient-to-tr from-indigo-600 to-[#4338CA] text-white rounded-2xl p-6 space-y-4 shadow-md">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">AI Coach Recommendation</span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                🎯 Acme Corp has expressed concern over HubSpot CRM custom mappings. Use our pre-built bi-directional workflow templates to qualify timelines automatically.
              </p>
              <div className="pt-2">
                <Link 
                  href="/settings"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-all inline-block text-center"
                >
                  Configure Integrations
                </Link>
              </div>
            </div>

            {/* User Profile summary footer */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {activeUser?.name?.substring(0, 2).toUpperCase() || 'JA'}
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">{activeUser?.name || 'Jane'}</span>
                  <span className="text-[10px] text-[#6B7280] uppercase tracking-wider">{activeUser?.role || 'SALES_REP'}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">ID: {activeUser?.id || 1}</span>
            </div>

          </div>

        </section>

      </div>
    </main>
    </Layout>
  );
}
