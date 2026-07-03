'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/shared/components/Layout/Layout';
import Link from 'next/link';
import clientFetch from '@/shared/utils/clientFetch';
import { 
  ArrowLeft, 
  Building, 
  User, 
  Mail, 
  Calendar, 
  Sparkles,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Mic,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  PhoneCall,
  Activity,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function ContactDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const [call, setCall] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchCallDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await clientFetch(`/api/calls/${id}`);
      if (!res.ok) {
        throw new Error('Failed to load prospect details.');
      }
      const data = await res.json();
      setCall(data);
    } catch (err: any) {
      setError(err.message || 'Error loading call details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCallDetails();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await clientFetch(`/api/calls/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (res.ok) {
        setCommentText('');
        fetchCallDetails(); // reload details with comment
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <main className="main-content min-h-screen pt-24 px-6 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 animate-spin rounded-full mx-auto" />
            <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Assembling AI Dossier...</p>
          </div>
        </main>
      </Layout>
    );
  }

  if (error || !call) {
    return (
      <Layout>
        <main className="main-content min-h-screen pt-24 px-6 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-sm">
            <Activity className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Prospect Not Found</h3>
            <p className="text-xs text-slate-500 leading-normal">{error || 'The requested contact details could not be retrieved.'}</p>
            <Link href="/dashboard/contacts">
              <button className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl">
                Back to Contacts
              </button>
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  // Derive helper details
  const hash = call.clientName?.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) || 0;
  const firstNames = ['Sarah', 'John', 'Alex', 'David', 'Emily', 'Michael', 'Jessica', 'Robert', 'Rachel', 'Daniel'];
  const lastNames = ['Connor', 'Doe', 'Rivera', 'Smith', 'Davis', 'Miller', 'Wilson', 'Anderson', 'Taylor', 'Thomas'];
  const contactPerson = `${firstNames[hash % 10]} ${lastNames[(hash + 3) % 10]}`;
  const contactEmail = `procurement@${call.clientName?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`;

  // Filter segments with objections
  const objections = call.records?.filter((r: any) => r.hesitations && r.hesitations.length > 0) || [];

  // Speech ratio calculation
  const totalSegments = call.records?.length || 0;
  const repSegments = call.records?.filter((r: any) => r.speaker?.toLowerCase().includes('seller') || r.speaker?.toLowerCase().includes('you'))?.length || 0;
  const repRatio = totalSegments > 0 ? Math.round((repSegments / totalSegments) * 100) : 45;
  const buyerRatio = 100 - repRatio;

  return (
    <Layout>
      <main className="main-content min-h-screen pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Back button & title header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <Link href="/dashboard/contacts" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-bold transition-all mb-2">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Database
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50 shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">{call.clientName}</h1>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                    {contactPerson} (Stakeholder / Owner)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                call.overallSentiment === 'Positive' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                call.overallSentiment === 'Negative' ? 'bg-red-50 border-red-100 text-red-700' :
                'bg-amber-50 border-amber-100 text-amber-700'
              }`}>
                Sentiment: {call.overallSentiment}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Info, Transcript, Summary, Next Steps */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Contact information details */}
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                  Contact Dossier
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Main Email</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {contactEmail}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Latest Engagement</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(call.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Deal Owner</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" className="w-full h-full object-cover" alt="Owner" />
                      </div>
                      <span className="font-semibold text-slate-800 text-[11px]">Default Sales Rep</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call Summary executive summary card */}
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500 fill-indigo-50" />
                    LLM Executive Summary
                  </h3>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 border border-slate-100 p-4 rounded-2xl markdown-container prose max-w-none">
                  {call.summary ? (
                    <ReactMarkdown>{call.summary}</ReactMarkdown>
                  ) : (
                    'Summary analysis pending for this contact session.'
                  )}
                </div>
              </div>

              {/* Conversation history transcripts list */}
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-slate-400" />
                  Conversation Transcript
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {call.records?.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No transcript segments recorded.</p>
                  ) : (
                    call.records?.map((record: any, idx: number) => {
                      const isRep = record.speaker?.toLowerCase().includes('seller') || record.speaker?.toLowerCase().includes('you');
                      return (
                        <div key={record.id || idx} className={`flex flex-col space-y-1 ${isRep ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="font-bold text-slate-600">{record.speaker}</span>
                            <span>•</span>
                            <span>{record.timestamp || '0:00'}</span>
                          </div>
                          <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                            isRep 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-slate-100 text-slate-800 rounded-tl-none'
                          }`}>
                            <p>{record.transcript}</p>
                            
                            {/* Buying signals or hesitations badges */}
                            {record.buying_signals?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {record.buying_signals.map((sig: string) => (
                                  <span key={sig} className="text-[9px] bg-emerald-500/25 text-emerald-100 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                                    Signal: {sig}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {record.hesitations?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {record.hesitations.map((hes: string) => (
                                  <span key={hes} className="text-[9px] bg-amber-500/25 text-amber-100 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                                    Objection: {hes}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Next Steps actions */}
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  AI Recommended Next Steps
                </h3>
                <div className="space-y-3">
                  {call.nextSteps?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No follow-ups identified.</p>
                  ) : (
                    call.nextSteps?.map((step: any) => (
                      <div key={step.id} className="flex items-start gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${step.isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <span className={`text-xs font-bold block ${step.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {step.title}
                          </span>
                          {step.dueDate && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Due: {new Date(step.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Deal probability, BANT Checklist, Objections, comments */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Win Chance meter */}
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Deal Analytics
                </h3>
                
                <div className="text-center space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Win Probability</span>
                  <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {call.conversionProbability}%
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${call.conversionProbability}%` }} />
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100" />

                <div className="space-y-4 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Average Quality Score</span>
                    <span className="text-slate-900 font-bold">{call.averageScore?.toFixed(1) || '0.0'}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vocal Energy Score</span>
                    <span className="text-slate-900 font-bold">{Math.round(call.averageEnergy * 100 || 50)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence Marker</span>
                    <span className="text-slate-900 font-bold">{Math.round(call.averageConfidence * 100 || 60)}%</span>
                  </div>
                </div>
              </div>

              {/* BANT Scorecard */}
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  BANT Qualification Score
                </h3>
                <div className="space-y-3.5">
                  {[
                    { label: 'Budget', met: call.bantBudgetMet, val: call.bantBudget, desc: 'Budget constraints & sizing' },
                    { label: 'Authority', met: call.bantAuthorityMet, val: call.bantAuthority, desc: 'Stakeholder decision powers' },
                    { label: 'Need', met: call.bantNeedMet, val: call.bantNeed, desc: 'Core pain points identified' },
                    { label: 'Timeline', met: call.bantTimelineMet, val: call.bantTimeline, desc: 'Planned deployment speed' }
                  ].map((crit) => (
                    <div key={crit.label} className="flex items-start gap-3 border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                      <div className={`mt-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${
                        crit.met ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{crit.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            crit.met ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {crit.met ? 'QUALIFIED' : 'PENDING'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{crit.val || crit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Talk-to-Listen Ratio */}
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-indigo-500" />
                  Talk-to-Listen Ratio
                </h3>
                <div className="space-y-2">
                  <div className="w-full bg-indigo-100 h-6 rounded-lg overflow-hidden flex font-mono text-[9px] font-bold text-white text-center">
                    <div className="bg-indigo-600 flex items-center justify-center transition-all" style={{ width: `${repRatio}%` }} title="Seller Talk Ratio">
                      {repRatio}% Rep
                    </div>
                    <div className="bg-indigo-400 flex items-center justify-center transition-all" style={{ width: `${buyerRatio}%` }} title="Buyer Talk Ratio">
                      {buyerRatio}% Buyer
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Ideally target a buyer ratio above 55% for discovery and alignment calls.
                  </p>
                </div>
              </div>

              {/* Objection / Hesitation list */}
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Objections & Hesitations
                </h3>
                <div className="space-y-2.5">
                  {objections.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No active objections or buying blockers detected.</p>
                  ) : (
                    objections.map((obj: any, idx: number) => (
                      <div key={obj.id || idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1.5">
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg inline-block uppercase tracking-wider">
                          {obj.hesitations[0]}
                        </span>
                        <p className="text-[11px] text-slate-600 leading-relaxed italic">
                          &ldquo;{obj.transcript}&rdquo;
                        </p>
                        {obj.recommendation && (
                          <div className="text-[10px] text-indigo-700 bg-indigo-50/50 border border-indigo-100/30 p-2 rounded-lg font-medium">
                            <span className="font-bold">Coach Tip:</span> {obj.recommendation}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Timeline Notes & Comments */}
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Collaboration Notes
                </h3>

                {/* Existing comments list */}
                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1 text-xs">
                  {call.comments?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2 text-center">No collaboration comments yet.</p>
                  ) : (
                    call.comments?.map((com: any) => (
                      <div key={com.id} className="space-y-1 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-slate-600">{com.author?.name || 'Rep'}</span>
                          <span>{new Date(com.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{com.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Post new comment */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Write a deal note..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={isSubmittingComment}
                    className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-all shadow-sm shrink-0 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
      </main>
    </Layout>
  );
}
