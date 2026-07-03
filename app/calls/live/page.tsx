'use client';

import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/shared/components/Layout/Layout';
import LiveDashboardProvider from '@/features/live-session/components/LiveDashboardProvider';
import SessionHeader from '@/features/calls/components/SessionHeader';
import { useLiveData } from '@/shared/hooks/LiveDataContext';
import { motion, AnimatePresence } from 'framer-motion';
import SentimentBadge from '@/shared/components/SentimentBadge';
import {
  Sparkles,
  Play,
  Mic,
  StopCircle,
  Activity,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

function LiveCallContent() {
  const {
    isRecording,
    isSaving,
    startSession,
    stopSession,
    records,
    bantBudget,
    bantBudgetMet,
    bantAuthority,
    bantAuthorityMet,
    bantNeed,
    bantNeedMet,
    bantTimeline,
    bantTimelineMet,
    averageScore,
    averageEnergy,
    averageConfidence,
    dominantSentiment,
    allBuyingSignals,
    allHesitations,
    allIntents,
    latestRecommendation,
    sessionDuration
  } = useLiveData();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('Prospective Client');
  const [autoSum, setAutoSum] = useState(true);

  // Set default title on client side once to avoid SSR mismatch
  useEffect(() => {
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    setTitle(`Discovery Call - ${dateStr}`);
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (startSession) {
      startSession(title, clientName, autoSum);
    }
  };

  const hasData = records.length > 0;
  const isSessionActive = isRecording || hasData;

  // Waveform animation canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!isRecording) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      for (let x = 0; x < canvas.width; x++) {
        // Create an organic moving wave, scaled down at the edges
        const scale = Math.sin((x / canvas.width) * Math.PI);
        const y =
          canvas.height / 2 +
          Math.sin(x * 0.04 + phase) * 16 * scale +
          Math.cos(x * 0.015 - phase) * 6 * scale;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw secondary softer wave
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const scale = Math.sin((x / canvas.width) * Math.PI);
        const y =
          canvas.height / 2 +
          Math.cos(x * 0.035 - phase) * 12 * scale +
          Math.sin(x * 0.02 + phase) * 4 * scale;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      phase += 0.08;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRecording]);

  // Derived statistics
  const winProb = averageScore ? Math.round(50 + (averageScore / 5) * 44) : 55;
  const qualityScore = averageScore ? Math.round(averageScore * 20) : 60;

  // Talk ratio calculation
  const repRecords = records.filter(
    (r) =>
      r.speaker?.toLowerCase().includes('seller') ||
      r.speaker?.toLowerCase().includes('you')
  );
  const totalWithSpeaker = records.filter((r) => r.speaker).length;
  const repRatio = totalWithSpeaker > 0 ? Math.round((repRecords.length / totalWithSpeaker) * 100) : 45;
  const buyerRatio = 100 - repRatio;

  return (
    <>
      {/* Saving Overlay */}
      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
          >
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 border border-slate-100 shadow-2xl">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 animate-spin mx-auto" />
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Analyzing Conversation</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generating LLM executive summaries, mapping opportunity checklists, and writing back to database.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSessionActive ? (
        /* Configuration dashboard */
        <div className="max-w-6xl mx-auto py-8 px-6 space-y-8">
          <SessionHeader />
          <div className="flex items-center justify-center py-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm space-y-8 max-w-xl w-full"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#4F46E5]">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#111827]">Setup Live Sales Stream</h2>
                <p className="text-[10px] text-[#6B7280]">Configure your streaming session to start real-time coaching</p>
              </div>
            </div>

            <form onSubmit={handleStart} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="call-title" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Call Session Title
                </label>
                <input
                  type="text"
                  id="call-title"
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-xs outline-none bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
                  placeholder="e.g. Discovery Call - Acme Corp"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="client-name" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Client Organization
                </label>
                <input
                  type="text"
                  id="client-name"
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-xs outline-none bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
                  placeholder="e.g. Acme Corp"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between py-4 border-y border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">Auto-Summarize on Stop</span>
                  <p className="text-[10px] text-[#6B7280]">
                    Auto-trigger LLM summarizer and write to database when stopped.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSum}
                    onChange={(e) => setAutoSum(e.target.checked)}
                    className="sr-only peer"
                    title="Auto Summarize Toggle"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-indigo-100 hover:shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Live Streaming
              </button>
            </form>
          </motion.div>
          </div>
        </div>
      ) : (
        /* Active session dashboard - Full Viewport h-full flex flex-col */
        <div className="h-full flex flex-col justify-between overflow-hidden">
          
          {/* Header row containing title info */}
          <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 shrink-0 flex items-center justify-between">
            <SessionHeader />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">Live Session Connected</span>
            </div>
          </div>

          {/* Core content grid - grid-cols-12 */}
          <div className="flex-1 min-h-0 grid lg:grid-cols-12 gap-6 p-6 overflow-hidden">
            
            {/* LEFT COLUMN: Live Transcript & Timeline */}
            <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0 mb-4">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">WebSocket Transcript Stream</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-lg font-bold">
                  {records.length} segments analyzed
                </span>
              </div>
              
              {/* Scrollable transcript list */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {records.length > 0 ? (
                  records.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl border transition-all ${
                        r.speaker?.toLowerCase().includes('seller') || r.speaker?.toLowerCase().includes('you')
                          ? 'bg-slate-50/60 border-slate-100 ml-12'
                          : 'bg-white border-[#E5E7EB] mr-12'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-800">{r.speaker}</span>
                          <SentimentBadge sentiment={r.sentiment} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold font-mono">
                          <span>Conf: {Math.round(r.confidence * 100)}%</span>
                          <span>•</span>
                          <span>Score: {r.score}/5</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        &ldquo;{r.transcript}&rdquo;
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-600/10 border-t-indigo-600 animate-spin" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Waiting for incoming audio stream...</p>
                  </div>
                )}
              </div>

              {/* Engagement Timeline index */}
              <div className="border-t border-slate-100 pt-4 mt-4 shrink-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Engagement Timeline</span>
                  <span className="text-[10px] text-[#6B7280]">Running Sentiment Index</span>
                </div>
                <div className="h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-end p-2 gap-1 overflow-x-auto">
                  {records.length > 0 ? (
                    records.map((r, i) => {
                      const heightPercent = Math.max(15, Math.min(100, r.score * 20));
                      const isPositive = r.sentiment === 'Positive';
                      const isNegative = r.sentiment === 'Negative';
                      return (
                        <div
                          key={i}
                          className={`w-3 rounded-t-sm transition-all duration-300 ${
                            isPositive ? 'bg-[#10B981]' : isNegative ? 'bg-red-400' : 'bg-slate-300'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                          title={`Score: ${r.score} | Sentiment: ${r.sentiment}`}
                        />
                      );
                    })
                  ) : (
                    <div className="w-full text-center text-[10px] text-slate-400 font-semibold uppercase py-3">No data points yet</div>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: AI Coach Card, BANT qualified tracker, win percentage */}
            <div className="lg:col-span-5 flex flex-col h-full overflow-y-auto pr-2 space-y-6">
              
              {/* AI Coach recommendation */}
              <div className="bg-[#4F46E5] text-white rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Real-Time AI Coach</span>
                  </div>
                  {isRecording && (
                    <span className="text-[8px] bg-white/25 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                      Active listening
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">LATEST RECOMMENDATION</span>
                  <p className="text-sm font-semibold leading-relaxed">
                    {latestRecommendation || 'AI is evaluating conversation to generate next tactic recommendations...'}
                  </p>
                </div>
              </div>

              {/* BANT Qualification Scorecard */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4 shrink-0">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">BANT Tracker</span>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Budget', met: bantBudgetMet, val: bantBudget },
                    { name: 'Authority', met: bantAuthorityMet, val: bantAuthority },
                    { name: 'Need', met: bantNeedMet, val: bantNeed },
                    { name: 'Timeline', met: bantTimelineMet, val: bantTimeline }
                  ].map((item, i) => (
                    <div key={i} className="border border-slate-100 bg-slate-50/50 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.name}</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${item.met ? 'bg-[#10B981]' : 'bg-slate-200'}`} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 block truncate">
                        {item.met ? (item.val || 'Qualified') : 'Not discussed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Running metrics stats */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-6 shrink-0">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Running Deal Metrics</span>
                
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div className="space-y-1 bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                    <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider block">Win Probability</span>
                    <span className="text-2xl font-extrabold text-[#10B981]">{winProb}%</span>
                  </div>
                  <div className="space-y-1 bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                    <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider block">Call Quality</span>
                    <span className="text-2xl font-extrabold text-indigo-600">{qualityScore}/100</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Talk Ratio:</span>
                    <span className="text-slate-800">{repRatio}% Rep | {buyerRatio}% Buyer</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full flex overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${repRatio}%` }} />
                    <div className="bg-slate-300 h-full transition-all duration-300" style={{ width: `${buyerRatio}%` }} />
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Objection Risks Detected</span>
                  {allHesitations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {allHesitations.map((h, i) => (
                        <span key={i} className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold border border-red-100">
                          {h}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">No risk objects detected in transcript</p>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* BOTTOM CONTROLLER BAR */}
          <div className="h-20 shrink-0 bg-white border-t border-[#E5E7EB] px-6 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Streaming target client</span>
                <span className="text-xs font-bold text-slate-800">{clientName || 'Prospect'}</span>
              </div>
            </div>

            {/* Simulated Live Waveform Canvas */}
            <div className="flex-1 max-w-md w-full h-12 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden relative">
              {isRecording ? (
                <canvas ref={canvasRef} width="400" height="48" className="w-full h-full block" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Waveform inactive
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 font-mono">
                Duration: {sessionDuration ? `${Math.floor(sessionDuration / 60)}:${(sessionDuration % 60).toString().padStart(2, '0')}` : '0:00'}
              </span>
              {isRecording && (
                <button
                  onClick={stopSession}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow-red-100 hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <StopCircle className="w-4 h-4 fill-current" />
                  Stop and Analyze
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </>
  );
}

export default function LiveCallPage() {
  return (
    <Layout>
      <main className="main-content h-[calc(100vh-64px)] bg-[#FAFBFC] overflow-hidden font-sans">
        <LiveDashboardProvider>
          <LiveCallContent />
        </LiveDashboardProvider>
      </main>
    </Layout>
  );
}
