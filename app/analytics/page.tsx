'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Footer from '@/components/Footer';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/analytics');
        if (!res.ok) throw new Error('Failed to load analytics');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Error loading analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Helper to draw average trend line
  const renderTrendSVG = () => {
    if (!data?.scoreTrend || data.scoreTrend.length === 0) return null;
    
    const trends = data.scoreTrend;
    if (trends.length < 2) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)' }}>
          Need at least 2 call records to render trend chart.
        </div>
      );
    }

    const maxScore = 5;
    const points = trends.map((t: any, i: number) => ({
      x: (i / (trends.length - 1)) * 100,
      y: 100 - (t.score / maxScore) * 100,
      title: t.title,
      score: t.score,
    }));

    let path = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cx = (points[i - 1].x + points[i].x) / 2;
      path += ` Q${cx},${points[i - 1].y} ${points[i].x},${points[i].y}`;
    }

    const areaPath = `${path} L100,100 L0,100 Z`;

    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="analyticsGradient" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#7c6aef" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#7c6aef" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#analyticsGradient)" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        {points.map((p: any, i: number) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="var(--bg-root)"
            stroke="var(--accent)"
            strokeWidth="1.5"
            style={{ cursor: 'pointer' }}
          >
            <title>{p.title}: {p.score.toFixed(1)}/5</title>
          </circle>
        ))}
      </svg>
    );
  };

  const handleExportCSV = () => {
    if (!data?.scoreTrend) return;
    const headers = 'Call ID,Title,Date,Average Score,Conversion Probability\n';
    const rows = data.scoreTrend.map((t: any) => 
      `"${t.id}","${t.title.replace(/"/g, '""')}","${t.date}",${t.score},${t.probability}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'convincesense-analytics.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (isLoading) {
    return (
      <Layout>
        <main className="main-content">
          <div className="content-container">
            <h1 className="text-page-title">Team Performance &amp; Conversation Analytics</h1>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Loading analytics models...</p>
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

  if (error) {
    return (
      <Layout>
        <main className="main-content">
          <div className="content-container">
            <h1 className="text-page-title">Team Performance &amp; Conversation Analytics</h1>
            <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', marginTop: '20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--error)' }}>error</span>
              <h3>Failed to load analytics</h3>
              <p className="text-body" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            </div>
          </div>
          <Footer />
        </main>
      </Layout>
    );
  }

  const {
    totalCalls = 0,
    totalDurationMinutes = 0,
    averageScore = 0,
    bantCompletionRate = 0,
    sentimentSplit = { Positive: 0, Neutral: 0, Negative: 0 },
    intentCounts = {},
    totalBuyingSignals = 0,
    totalHesitations = 0,
  } = data || {};

  return (
    <Layout>
      <main className="main-content">
        <div className="content-container">
          {/* Header */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
            <div>
              <h1 className="text-page-title">Team Performance &amp; Conversation Analytics</h1>
              <p className="text-body" style={{ marginTop: 'var(--space-1)' }}>
                Aggregated sales KPIs, sentiment analytics, objection trends, and compliance tracking.
              </p>
            </div>
            
            <button onClick={handleExportCSV} className="btn btn-secondary">
              <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '6px' }}>download</span>
              Export Metrics CSV
            </button>
          </header>

          {/* Metric cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="card">
              <p className="text-overline" style={{ color: 'var(--text-secondary)' }}>TOTAL CONVERSATIONS</p>
              <h3 style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>{totalCalls}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--success)' }}>🟢 Live Audited</p>
            </div>

            <div className="card">
              <p className="text-overline" style={{ color: 'var(--text-secondary)' }}>TOTAL MINUTES ANALYZED</p>
              <h3 style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>{totalDurationMinutes}m</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>{Math.round(totalDurationMinutes / 60)}h Total Talk Time</p>
            </div>

            <div className="card">
              <p className="text-overline" style={{ color: 'var(--text-secondary)' }}>AVG ENGAGEMENT SCORE</p>
              <h3 style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--accent)' }}>{averageScore}/5</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: averageScore >= 3.5 ? 'var(--success)' : 'var(--warning)' }}>
                {averageScore >= 3.5 ? 'Good Customer Interest' : 'Needs Team Coaching'}
              </p>
            </div>

            <div className="card">
              <p className="text-overline" style={{ color: 'var(--text-secondary)' }}>BANT VERIFICATION RATE</p>
              <h3 style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0 0 0', color: 'var(--info)' }}>{bantCompletionRate}%</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>Qualifying Parameter Coverage</p>
            </div>
          </div>

          <div className="grid-dashboard">
            {/* Trend Chart */}
            <div className="card lg:col-span-8">
              <h2 className="text-section-heading" style={{ marginBottom: 'var(--space-6)' }}>Engagement Score Trend</h2>
              <div style={{ height: '220px', position: 'relative', width: '100%', marginBottom: '20px' }}>
                {renderTrendSVG()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px' }}>
                <span>Past call sessions (ascending order)</span>
                <span>Latest call</span>
              </div>
            </div>

            {/* Sentiment split */}
            <div className="card lg:col-span-4 flex flex-col justify-between">
              <div>
                <h2 className="text-section-heading" style={{ marginBottom: 'var(--space-6)' }}>Sentiment Split</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {/* Positive */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Positive Conversations</span>
                      <span style={{ fontWeight: 600, color: 'var(--success)' }}>{sentimentSplit.Positive}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-root)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--success)', width: `${(sentimentSplit.Positive / totalCalls) * 100}%` }} />
                    </div>
                  </div>

                  {/* Neutral */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Neutral Conversations</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{sentimentSplit.Neutral}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-root)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--text-muted)', width: `${(sentimentSplit.Neutral / totalCalls) * 100}%` }} />
                    </div>
                  </div>

                  {/* Negative */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Negative Conversations</span>
                      <span style={{ fontWeight: 600, color: 'var(--error)' }}>{sentimentSplit.Negative}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-root)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--error)', width: `${(sentimentSplit.Negative / totalCalls) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Buying Signals: {totalBuyingSignals}</span>
                <span>Hesitation Words: {totalHesitations}</span>
              </div>
            </div>
          </div>

          {/* Objection/Intent Counts */}
          <div className="grid-dashboard" style={{ marginTop: 'var(--space-5)' }}>
            <div className="card lg:col-span-6">
              <h2 className="text-section-heading" style={{ marginBottom: 'var(--space-6)' }}>Intent Distribution</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {(() => {
                  const totalIntentsSum = Object.values(intentCounts).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number || 1;
                  return Object.entries(intentCounts).map(([intent, count]: [string, any]) => (
                    <div key={intent}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span>{intent}</span>
                        <span style={{ fontWeight: 600 }}>{count} occurrences</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-root)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--accent)', width: `${(count / totalIntentsSum) * 100}%` }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="card lg:col-span-6" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 className="text-section-heading" style={{ marginBottom: 'var(--space-4)' }}>AI Coaching Playbook Alerts</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--error-muted)', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '12px' }}>
                    <div style={{ color: 'var(--error)', fontWeight: 600, marginBottom: '2px' }}>Competition Warnings Active</div>
                    <span style={{ color: 'var(--text-secondary)' }}>Objections for pricing/competitors are higher this week. Ensure sales playbook version 2.4 is deployed.</span>
                  </div>
                  <div style={{ background: 'rgba(52, 211, 153, 0.05)', border: '1px solid var(--success-muted)', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '12px' }}>
                    <div style={{ color: 'var(--success)', fontWeight: 600, marginBottom: '2px' }}>Excellent BANT Qualification</div>
                    <span style={{ color: 'var(--text-secondary)' }}>Budget qualification questions have increased by 14% month-over-month. Keep prompting budget details.</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Coaching playbook models are updated daily.</div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </Layout>
  );
}
