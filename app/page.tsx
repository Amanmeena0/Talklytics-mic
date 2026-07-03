'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import clientFetch from '@/shared/utils/clientFetch';
import {
  Sparkles,
  ArrowRight,
  Play,
  Check,
  Activity,
  CheckCircle2,
  Star,
  ChevronRight,
  X,
  Volume2,
  ChevronDown,
  User,
  Settings,
  LogOut
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'coaching' | 'analytics' | 'crm'>('coaching');
  const [showDemoModal, setShowDemoModal] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const loadUserData = async () => {
    try {
      const userRes = await clientFetch('/api/users');
      if (userRes.ok) {
        const user = await userRes.json();
        if (user) {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }
      }
    } catch (err) {
      console.error('Failed to load user in homepage:', err);
    }
  };

  useEffect(() => {
    const hasLoginCookie = document.cookie
      .split('; ')
      .some((row) => row.startsWith('logged_in=true'));
    if (hasLoginCookie) {
      loadUserData();
    }

    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await clientFetch('/api/auth/logout', { method: 'POST' });
      document.cookie = 'logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      setCurrentUser(null);
      setIsLoggedIn(false);
      setShowUserMenu(false);
      window.location.reload();
    } catch (err) {
      console.error('Logout failed:', err);
      document.cookie = 'logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      setCurrentUser(null);
      setIsLoggedIn(false);
      window.location.reload();
    }
  };

  // Animation constants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const featureTabs = {
    coaching: {
      title: 'Live AI Sales Coaching',
      subtitle: 'Real-time guidance when it matters most.',
      desc: 'Our contextual LLM listens to live streams and prompts reps with exact talking points, objection rebuttals, and pricing guides mid-call.',
      bullets: [
        'Objection handling flashcards',
        'Competitor mention notifications',
        'Real-time talk-ratio alert'
      ],
      mockup: (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-900">LIVE SESSION MONITOR</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">03:42 / 15:00</span>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400">PROSPECT (BUYER)</span>
                <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">Objection: Budget</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                &ldquo;We love the platform, but the $12,000 yearly contract is just too high for our team right now.&rdquo;
              </p>
            </div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center gap-1.5 mb-2 text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-bold tracking-wide uppercase">AI COACH: PRICE REBUTTAL</span>
              </div>
              <p className="text-xs text-indigo-900 font-medium mb-3">
                Pivot to ROI & Flexible Terms. Mention the starter tier or quarterly billing.
              </p>
              <div className="bg-white rounded border border-indigo-100 p-2.5">
                <p className="text-[11px] text-slate-600 italic">
                  &ldquo;I completely understand. Many of our customers starting out felt the same. However, with our average 34% increase in sales efficiency, the platform pays for itself by month three. We also have a quarterly billing schedule...&rdquo;
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )
    },
    analytics: {
      title: 'Deeper Conversation Insights',
      subtitle: 'Post-call intelligence at scale.',
      desc: 'Ditch manual summaries. Talklytics analyzes transcripts for sentiment shift, BANT metrics, win-probability, and deal health within seconds.',
      bullets: [
        'Automated executive summaries',
        'Speaker timeline breakdown',
        'BANT qualification scorecard'
      ],
      mockup: (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 font-sans">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest block">POST-CALL ANALYSIS</span>
              <h4 className="text-sm font-bold text-slate-900">Enterprise Deal Health Checklist</h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Win Probability</span>
              <span className="text-lg font-bold text-emerald-600">84%</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {[
              { label: 'Budget', desc: 'Prospect confirmed $45k budget range', status: true },
              { label: 'Authority', desc: 'VP of Sales present and decision-maker', status: true },
              { label: 'Need', desc: 'Integrate CRM to solve data silos', status: true },
              { label: 'Timeline', desc: 'Targeting launch by end of Q3', status: false }
            ].map((bant) => (
              <div key={bant.label} className="flex items-start gap-3 border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${bant.status ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  <Check className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">{bant.label}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${bant.status ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {bant.status ? 'QUALIFIED' : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{bant.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    crm: {
      title: 'Bi-directional CRM Sync',
      subtitle: 'Keep your records clean without typing.',
      desc: 'Instantly push summary notes, verified BANT checkmarks, follow-ups, and transcripts to Salesforce, HubSpot, and Pipedrive with zero clicks.',
      bullets: [
        'Custom fields mapping',
        'Automatic task creation',
        'Multi-stakeholder contact detection'
      ],
      mockup: (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 font-sans">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">S</div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">CRM Sync Status</h4>
              <p className="text-[10px] text-slate-400">Connected to Salesforce</p>
            </div>
            <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Active
            </span>
          </div>

          <div className="space-y-3 font-mono text-[10px] text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="flex justify-between">
              <span>[11:22:04] CONNECTED TO OUTBOUND API...</span>
              <span className="text-slate-400">OK</span>
            </div>
            <div className="flex justify-between text-indigo-600 font-semibold">
              <span>[11:22:05] SYNCING OPPORTUNITY &ldquo;ACME CORP&rdquo;...</span>
              <span>IN_PROGRESS</span>
            </div>
            <div className="pl-3 space-y-1.5 text-slate-500">
              <div>&gt; BUDGET: $50,000 (UPDATED)</div>
              <div>&gt; TIMELINE: Q3-2026 (UPDATED)</div>
              <div>&gt; STAGE: DISCOVERY -&gt; VALIDATION</div>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>[11:22:07] Salesforce records updated successfully</span>
              <span>200_OK</span>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="bg-[#FAFBFC] text-[#111827] font-sans antialiased min-h-screen selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      {/* ──────────────── HEADER / NAVIGATION ──────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFBFC]/80 backdrop-blur-md border-b border-[#E5E7EB] transition-all py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-[#111827] tracking-tight">Talklytics</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors font-medium">Product</a>
            <a href="#showcase" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors font-medium">Showcase</a>
            <a href="#pricing" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors font-medium">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)} 
                  className="flex items-center gap-1.5 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      className="w-full h-full object-cover"
                      src={
                        currentUser?.avatarUrl ||
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuBydN9a-URkUyb3EbMEXrxRRb35zw61rKWQ7f3QcdwXBQrIa8blJRm9flK0WbBbOjWAQyw6yBXqeiOPw9A7a3ngJ3S7Le2X-QXAZIgnd88et1q7etjADf0KLje2R6eHsXAW4haDHneZxCRUONnAlkjdludfTwpAg3RfFcasH2NH1G4jLMJqS5j6LIEUiye1zcL4in7zFU-AIteWTeAFKq5NlUek2mHAEpjs5RGuL8QpW8WsRlPEHwswXnL4oYjStpG4CWyyowvqog'
                      }
                      alt="User avatar"
                    />
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden z-50 py-2">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800 block">{currentUser?.name || 'Jane Smith'}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{currentUser?.email || 'jane.smith@talklytics.com'}</span>
                      <span className="inline-block mt-2 text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                        {currentUser?.role || 'SALES_REP'}
                      </span>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        Account Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors font-medium">
                  Login
                </Link>
                <Link 
                  href="/login" 
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-4.5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ──────────────── HERO SECTION ──────────────── */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-[#FAFBFC] to-[#F4F6F8]">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-indigo-100/50 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] aspect-square rounded-full bg-blue-50/50 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-6 text-left relative z-10">
            <motion.div 
              initial="initial"
              animate="animate"
              variants={stagger}
              className="space-y-6"
            >
              <motion.div 
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-xs rounded-full"
              >
                <Sparkles className="w-3.5 h-3.5" />
                ENTERPRISE CONVERSATION INTELLIGENCE
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#111827] leading-[1.1] font-sans"
              >
                Every Sales Conversation.<br />
                <span className="text-[#4F46E5] bg-clip-text">Perfectly Understood.</span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-lg md:text-xl text-[#6B7280] leading-relaxed max-w-xl font-normal"
              >
                Turn conversations into actionable intelligence using real-time AI coaching, sentiment analysis, BANT qualification, executive summaries, and actionable insights.
              </motion.p>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Link
                  href={isLoggedIn ? '/dashboard' : '/login'}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-indigo-100 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Start Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => setShowDemoModal(true)}
                  className="bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] text-[#111827] font-semibold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2 hover:bg-slate-50"
                >
                  <Play className="w-4 h-4 text-[#4F46E5] fill-current" />
                  Watch Demo
                </button>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="pt-8 border-t border-[#E5E7EB] flex items-center gap-6"
              >
                <div className="flex -space-x-2">
                  {[
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuA7GzjmExqSzHlkbnYKZfnxrxLjAMOdBn7wxH1pzTnAn-e2H7L6oIhIwmymLXIuv639UNaSeXnE_swZItnrZIYCjiMur-IWu3YAYWXBxZ28JOgCN_FjUbw7Amf_N-1vK4dlRAJiUrt3a_aVvI-I93YRSRtZK9PxEYCq4zzs8Dw_sc0T8EwuvfLd8jfDAhiHqWjYfDVL6sD8hh6gp6QrWLy6Kr34k6-hu7VvUzCLeQOpeYGagmWBEVs',
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDc1WeIhchrVpYGmS-ILqQIOcd82H_LHaxgoGU1S0GsZ4Z7Qp2fyOGwzcRWsr-rbSHqHTWDb8tWu7Os9udL7Bh50mYtgi9a3FHrtiU0g_gzkmDdwsX3ziQq53tI4dsGfvZWpBtWC8Fi_PaTT6nDriiDEiLQtmoDy5JcFpgVx3bdBCEzpDdFRNtFZ6xS1oxUeFAEuArT7dB_y8WuFilUOgu58THdpZFwFrOwEm6v3Wmgfy2vu6dQIhs',
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuARQrxo9i6r0Bu5w0-Zu1R0N0v78KDZL5W2Lk_Omw2r9rDiHUrkiun_oD98J8RBoXJKpXqO0sWIcOvLWwa89o0uq9g1YJkRRu8tnvoHAIwckAL-XisXfL63tT-Vn850eKMNmNNq3uWdJh_CLNEx37keVqceqRRpZ4qQNwqOb-BmQJ82_9qsleuUgtqwz39B-WwXzXH61BWUEmXHt1npjFR6WL0wsQicvso5cdw_ifd-dRqYjKFQ4Tk'
                  ].map((url, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-100">
                      <img src={url} className="w-full h-full object-cover" alt="User avatar" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#6B7280]">
                  Trusted by <span className="font-semibold text-[#111827]">15,000+ sales teams</span> worldwide
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Hero Interactive Mockup */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-2xl space-y-6"
            >
              {/* Top panel bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]/20" />
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]/20" />
                  <span className="w-3 h-3 rounded-full bg-[#10B981]/20" />
                </div>
                <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                  Live Coach Active
                </div>
              </div>

              {/* Speaker timeline waveform */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[#111827]">Speaker Timeline</span>
                  <span className="text-[#6B7280]">Talk Ratio: 42% Rep | 58% Buyer</span>
                </div>
                <div className="h-6 bg-slate-50 border border-slate-100 rounded-lg flex overflow-hidden p-0.5">
                  <div className="w-[30%] bg-indigo-500 rounded-l-md" />
                  <div className="w-[45%] bg-slate-200" />
                  <div className="w-[20%] bg-indigo-500" />
                  <div className="w-[5%] bg-slate-200 rounded-r-md" />
                </div>
              </div>

              {/* Transcription visual */}
              <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 space-y-3.5">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-[10px]">JC</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">John Carter (Acme Corp)</span>
                      <span className="text-[9px] text-[#6B7280] font-mono">10:42:01</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      &ldquo;Our current tool doesn&apos;t sync well with Salesforce. We lose call data and reps spend hours doing data entry.&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex-shrink-0 flex items-center justify-center font-bold text-[10px]">AI</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700">Real-Time Suggestion</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">CRM Integration</span>
                    </div>
                    <p className="text-xs text-slate-800 bg-white border border-indigo-100 p-2.5 rounded-lg mt-1.5 leading-relaxed shadow-sm font-medium">
                      🚀 Mention Talklytics&apos; bi-directional auto-sync with Salesforce. We auto-populate opportunity pipelines with 98% accuracy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating metrics grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Deal Health</span>
                  <div className="text-xl font-bold text-[#10B981] mt-1">Excellent</div>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Win Prob</span>
                  <div className="text-xl font-bold text-indigo-600 mt-1">92.4%</div>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Objections</span>
                  <div className="text-xl font-bold text-amber-500 mt-1">0 Active</div>
                </div>
              </div>
            </motion.div>

            {/* Glowing Accent Ring */}
            <div className="absolute inset-0 border-2 border-indigo-500/25 rounded-3xl -m-3 pointer-events-none blur-sm animate-pulse" />
          </div>
        </div>
      </section>

      {/* ──────────────── TRUSTED BY LOGOS ──────────────── */}
      <section className="py-12 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs uppercase font-bold text-[#6B7280] tracking-wider mb-8">
            Powering high-growth revenue operations at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 opacity-65 grayscale hover:opacity-100 transition-opacity">
            {['Stripe', 'Linear', 'Vercel', 'Notion', 'Cursor', 'Figma'].map((name) => (
              <span key={name} className="text-lg font-extrabold tracking-tight text-[#111827]">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── PRODUCT FEATURES SECTION ──────────────── */}
      <section id="features" className="py-24 bg-[#FAFBFC] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs uppercase font-bold text-indigo-600 tracking-widest block mb-3">Enterprise Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">
              Visual Intelligence for Every Single Call
            </h2>
            <p className="text-[#6B7280] mt-4 text-base">
              A premium toolkit designed for sales development, customer success, and revenue operations teams.
            </p>
          </div>

          {/* Interactive Feature Showcase with Tabs */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left selector */}
            <div className="lg:col-span-5 space-y-4">
              {(Object.keys(featureTabs) as Array<keyof typeof featureTabs>).map((key) => {
                const item = featureTabs[key];
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                      isActive 
                        ? 'bg-white border-[#E5E7EB] shadow-lg shadow-slate-100/60 translate-x-2' 
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-[#111827]">{item.title}</h3>
                      <ChevronRight className={`w-4 h-4 text-indigo-600 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                    </div>
                    <p className="text-xs text-[#6B7280] line-clamp-2">{item.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Right Display Area */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-100 rounded-3xl p-8 min-h-[420px] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent rounded-3xl" />
              <div className="w-full relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <div>
                      <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block mb-1">
                        {featureTabs[activeTab].subtitle}
                      </span>
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        {featureTabs[activeTab].desc}
                      </p>
                    </div>

                    {featureTabs[activeTab].mockup}

                    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-slate-100">
                      {featureTabs[activeTab].bullets.map((bullet) => (
                        <div key={bullet} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── DETAILED SHOWCASE SECTION ──────────────── */}
      <section id="showcase" className="py-24 bg-white border-y border-[#E5E7EB] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs uppercase font-bold text-indigo-600 tracking-widest block mb-3">Live Experience</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">
              Engineered like Stripe and Vercel.
            </h2>
            <p className="text-[#6B7280] mt-4 text-base">
              A live sales command center that processes streams instantly. No clutter. No delays. Pure tactical execution.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left column: Transcript Log */}
            <div className="lg:col-span-8 bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Live Conversation Flow</h3>
                  <p className="text-[11px] text-[#6B7280]">Dynamic audio translation and intent tracking</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  <span className="text-xs text-slate-700 font-semibold">Active Stream</span>
                </div>
              </div>

              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827]">Seller (You)</span>
                    <span className="text-[10px] text-slate-400">00:12</span>
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    &ldquo;Can you share how you are current scoring your sales pipeline and qualifying leads before they hit CRM?&rdquo;
                  </p>
                </div>

                <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Buyer</span>
                    <span className="text-[10px] text-slate-400">00:34</span>
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    &ldquo;Well, it is mostly manual. Managers review call logs occasionally, but we do not have an automated scorecard. We really need BANT metrics tracked in real-time.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50">
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">INTENT: PRODUCT_NEED</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">QUALIFIED: NEED</span>
                  </div>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700">AI Instant Recommendation</span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded">TACTIC</span>
                  </div>
                  <p className="text-xs text-[#111827] leading-relaxed font-medium">
                    🚀 Present the Automated Scorecard dashboard. Emphasize that BANT elements qualify automatically based on conversational semantic cues.
                  </p>
                </div>
              </div>
            </div>

            {/* Right column: Aggregates */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#4F46E5] text-white rounded-2xl p-6 space-y-6 shadow-xl shadow-indigo-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-xs uppercase font-bold tracking-wider opacity-80">Deal Health Index</span>
                </div>
                <div>
                  <div className="text-4xl font-extrabold">94.8%</div>
                  <p className="text-xs opacity-75 mt-1.5 leading-relaxed">
                    Extremely high confidence level. BANT complete. CRM pipeline synchronization verified.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/20 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-75">Sentiment:</span>
                    <span className="font-bold">Highly Positive</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">Objection Risks:</span>
                    <span className="font-bold text-emerald-300">0 Low</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">CRM Syncing:</span>
                    <span className="font-bold text-emerald-300">Connected</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
                <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Executive Summary Preview</h4>
                <div className="bg-white border border-slate-200/50 p-4 rounded-xl">
                  <p className="text-[11px] text-[#6B7280] leading-relaxed">
                    Client Acme Corp seeks real-time coaching interface for 45 outbound reps. Demonstrated high interest in HubSpot integration. Budget approved. Lead is fully qualified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── CUSTOMER TESTIMONIALS ──────────────── */}
      <section className="py-24 bg-[#FAFBFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4">
              <span className="text-xs uppercase font-bold text-indigo-600 tracking-widest block mb-3">Enterprise Trust</span>
              <h2 className="text-3xl font-bold text-[#111827] tracking-tight">
                What Revenue Leaders Say
              </h2>
              <p className="text-[#6B7280] mt-4 text-sm leading-relaxed">
                Talklytics supports enterprise companies globally to shorten sales ramp times by 40% and boost win rates.
              </p>
            </div>
            
            <div className="lg:col-span-8 grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#E5E7EB] p-8 rounded-2xl shadow-sm space-y-6">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed italic">
                  &ldquo;Talklytics transformed our pipeline. BANT qualification is now 100% automated. Our reps focus purely on the prospect, and CRM updates itself instantly.&rdquo;
                </p>
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">Sarah Jenkins</h4>
                  <p className="text-[10px] text-[#6B7280]">VP of Revenue Ops, Vercel</p>
                </div>
              </div>

              <div className="bg-white border border-[#E5E7EB] p-8 rounded-2xl shadow-sm space-y-6">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed italic">
                  &ldquo;The live coaching card is incredible. It provides competitors rebuttals accurately. Our average closing ramp time fell from 90 days to just under 50.&rdquo;
                </p>
                <div>
                  <h4 className="text-xs font-bold text-[#111827]">Marcus Thorne</h4>
                  <p className="text-[10px] text-[#6B7280]">Head of Outbound, Pipedrive</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── PRICING SECTION ──────────────── */}
      <section id="pricing" className="py-24 bg-white border-t border-[#E5E7EB] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs uppercase font-bold text-indigo-600 tracking-widest block mb-3">Simple Pricing</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">
              Invest in Closing Deals
            </h2>
            <p className="text-[#6B7280] mt-4 text-base">
              Transparent enterprise licensing tiers tailored for scale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Tier 1 */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#111827]">Growth Starter</h3>
                  <p className="text-xs text-[#6B7280] mt-1">Perfect for small teams and single agents.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#111827]">$29</span>
                  <span className="text-xs text-[#6B7280]">/ seat / mo</span>
                </div>
                <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-[#6B7280]">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Real-time Call Coaching</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Auto BANT Scorecard</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> 1 CRM integration</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Basic Email Support</li>
                </ul>
              </div>
              <Link 
                href={isLoggedIn ? '/dashboard' : '/login'}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#111827] font-semibold text-xs rounded-xl transition-all text-center block mt-6"
              >
                Start Trial
              </Link>
            </div>

            {/* Tier 2 (Recommended) */}
            <div className="bg-white border-2 border-indigo-600 rounded-2xl p-8 space-y-6 flex flex-col justify-between relative shadow-xl shadow-indigo-50/50">
              <span className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Recommended
              </span>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#111827]">Growth Pro</h3>
                  <p className="text-xs text-[#6B7280] mt-1">Best for high-growth scaling sales organizations.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-indigo-600">$79</span>
                  <span className="text-xs text-[#6B7280]">/ seat / mo</span>
                </div>
                <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-[#6B7280]">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Live AI objection rebuttals</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Bi-directional Salesforce sync</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Executive Summaries generator</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Priority API token rate limits</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> 24/7 Slack support</li>
                </ul>
              </div>
              <Link 
                href={isLoggedIn ? '/dashboard' : '/login'}
                className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs rounded-xl transition-all text-center block mt-6"
              >
                Go Pro
              </Link>
            </div>

            {/* Tier 3 */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#111827]">Enterprise Scale</h3>
                  <p className="text-xs text-[#6B7280] mt-1">Custom pipelines, security, and SSO controls.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#111827]">Custom</span>
                </div>
                <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-[#6B7280]">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Dedicated model fine-tuning</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> SOC2 Compliance & SSO</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Multi-tenant workspaces</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Dedicated Account Architect</li>
                </ul>
              </div>
              <Link 
                href={isLoggedIn ? '/dashboard' : '/login'}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition-all text-center block mt-6"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer className="bg-slate-50 border-t border-[#E5E7EB] py-16 text-xs text-[#6B7280]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <span className="font-bold text-sm text-[#111827]">Talklytics</span>
            <p className="leading-relaxed">
              Enterprise conversation intelligence designed with elegance. Understood completely.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-[#111827] uppercase tracking-wider text-[10px]">Product</h4>
            <ul className="space-y-2.5 p-0 list-none">
              <li><Link href="/dashboard" className="hover:text-[#111827] transition-colors">Workspace</Link></li>
              <li><Link href="/calls" className="hover:text-[#111827] transition-colors">Call Analytics</Link></li>
              <li><Link href="/calls/live" className="hover:text-[#111827] transition-colors">Live stream</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-[#111827] uppercase tracking-wider text-[10px]">Resources</h4>
            <ul className="space-y-2.5 p-0 list-none">
              <li><a href="#" className="hover:text-[#111827] transition-colors">Sales playbook</a></li>
              <li><a href="#" className="hover:text-[#111827] transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-[#111827] transition-colors">System Status</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-[#111827] uppercase tracking-wider text-[10px]">Company</h4>
            <ul className="space-y-2.5 p-0 list-none">
              <li><a href="#" className="hover:text-[#111827] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#111827] transition-colors">Security Trust</a></li>
              <li><a href="#" className="hover:text-[#111827] transition-colors">Careers (We are hiring!)</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-200/50 pt-8 flex justify-between items-center text-[10px]">
          <span>© 2026 Talklytics. All rights reserved. Built for Series A Enterprise scale.</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-slate-700">All systems operational</span>
          </div>
        </div>
      </footer>

      {/* WATCH DEMO MODAL */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-slate-100"
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-100">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800">Talklytics Product Demo</span>
                <button 
                  onClick={() => setShowDemoModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="p-8 space-y-6 text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto">
                  <Volume2 className="w-8 h-8 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">Experience Live Voice Analytics</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    To watch the system live, start a stream monitor inside the dashboard. Talklytics connects to live microphone inputs to score energy and confidence.
                  </p>
                </div>
                <div className="pt-4 flex justify-center gap-4">
                  <button 
                    onClick={() => setShowDemoModal(false)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-full transition-all"
                  >
                    Close
                  </button>
                  <Link 
                    href={isLoggedIn ? '/dashboard' : '/login'}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-full transition-all"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
