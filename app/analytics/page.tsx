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
        <div className="analytics-no-data">Need at least 2 call records to render trend chart.</div>
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
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="analytics-trend-svg">
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
            className="cursor-pointer"
          >
            <title>
              {p.title}: {p.score.toFixed(1)}/5
            </title>
          </circle>
        ))}
      </svg>
    );
  };

  const handleExportCSV = () => {
    if (!data?.scoreTrend) return;
    const headers = 'Call ID,Title,Date,Average Score,Conversion Probability\n';
    const rows = data.scoreTrend
      .map(
        (t: any) =>
          `"${t.id}","${t.title.replace(/"/g, '""')}","${t.date}",${t.score},${t.probability}`
      )
      .join('\n');

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
            <p className="text-body">Loading analytics models...</p>
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

  if (error) {
    return (
      <Layout>
        <main className="main-content">
          <div className="content-container">
            <h1 className="text-page-title">Team Performance &amp; Conversation Analytics</h1>
            <div className="card analytics-error-card">
              <span className="material-symbols-outlined analytics-error-icon">error</span>
              <h3>Failed to load analytics</h3>
              <p className="text-body">{error}</p>
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
          <header className="d-flex justify-between align-start mb-8">
            <div>
              <h1 className="text-page-title">Team Performance &amp; Conversation Analytics</h1>
              <p className="text-body mt-1">
                Aggregated sales KPIs, sentiment analytics, objection trends, and compliance
                tracking.
              </p>
            </div>

            <button onClick={handleExportCSV} className="btn btn-secondary">
              <span className="material-symbols-outlined fs-18 mr-6">download</span>
              Export Metrics CSV
            </button>
          </header>

          {/* Metric cards grid */}
          <div className="analytics-metrics-grid">
            <div className="card">
              <p className="text-overline color-secondary">TOTAL CONVERSATIONS</p>
              <h3 className="fs-28 font-bold mt-2 mb-1 color-primary">{totalCalls}</h3>
              <p className="mt-1 fs-11 color-success">🟢 Live Audited</p>
            </div>

            <div className="card">
              <p className="text-overline color-secondary">TOTAL MINUTES ANALYZED</p>
              <h3 className="fs-28 font-bold mt-2 mb-1 color-primary">{totalDurationMinutes}m</h3>
              <p className="mt-1 fs-11 color-secondary">
                {Math.round(totalDurationMinutes / 60)}h Total Talk Time
              </p>
            </div>

            <div className="card">
              <p className="text-overline color-secondary">AVG ENGAGEMENT SCORE</p>
              <h3 className="fs-28 font-bold mt-2 mb-1 color-accent">{averageScore}/5</h3>
              <p
                className={`mt-1 fs-11 ${averageScore >= 3.5 ? 'color-success' : 'color-warning'}`}
              >
                {averageScore >= 3.5 ? 'Good Customer Interest' : 'Needs Team Coaching'}
              </p>
            </div>

            <div className="card">
              <p className="text-overline color-secondary">BANT VERIFICATION RATE</p>
              <h3 className="fs-28 font-bold mt-2 mb-1 color-info">{bantCompletionRate}%</h3>
              <p className="mt-1 fs-11 color-secondary">Qualifying Parameter Coverage</p>
            </div>
          </div>

          <div className="grid-dashboard">
            {/* Trend Chart */}
            <div className="card lg:col-span-8">
              <h2 className="text-section-heading mb-6">Engagement Score Trend</h2>
              <div className="analytics-trend-chart-container">{renderTrendSVG()}</div>
              <div className="d-flex justify-between color-muted fs-11">
                <span>Past call sessions (ascending order)</span>
                <span>Latest call</span>
              </div>
            </div>

            {/* Sentiment split */}
            <div className="card lg:col-span-4 flex flex-col justify-between">
              <div>
                <h2 className="text-section-heading mb-6">Sentiment Split</h2>
                <div className="d-flex flex-col gap-4">
                  {/* Positive */}
                  <div>
                    <div className="analytics-split-item-row">
                      <span>Positive Conversations</span>
                      <span className="font-semibold color-success">{sentimentSplit.Positive}</span>
                    </div>
                    <div className="analytics-progress-bg">
                      <div
                        className="analytics-progress-fill analytics-progress-fill-success"
                        style={{ width: `${(sentimentSplit.Positive / totalCalls) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Neutral */}
                  <div>
                    <div className="analytics-split-item-row">
                      <span>Neutral Conversations</span>
                      <span className="font-semibold color-secondary">
                        {sentimentSplit.Neutral}
                      </span>
                    </div>
                    <div className="analytics-progress-bg">
                      <div
                        className="analytics-progress-fill analytics-progress-fill-neutral"
                        style={{ width: `${(sentimentSplit.Neutral / totalCalls) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Negative */}
                  <div>
                    <div className="analytics-split-item-row">
                      <span>Negative Conversations</span>
                      <span className="font-semibold color-error">{sentimentSplit.Negative}</span>
                    </div>
                    <div className="analytics-progress-bg">
                      <div
                        className="analytics-progress-fill analytics-progress-fill-error"
                        style={{ width: `${(sentimentSplit.Negative / totalCalls) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="analytics-footer-info">
                <span>Buying Signals: {totalBuyingSignals}</span>
                <span>Hesitation Words: {totalHesitations}</span>
              </div>
            </div>
          </div>

          {/* Objection/Intent Counts */}
          <div className="grid-dashboard mt-5">
            <div className="card lg:col-span-6">
              <h2 className="text-section-heading mb-6">Intent Distribution</h2>
              <div className="d-flex flex-col gap-4">
                {(() => {
                  const totalIntentsSum =
                    (Object.values(intentCounts).reduce(
                      (a: any, b: any) => Number(a) + Number(b),
                      0
                    ) as number) || 1;
                  return Object.entries(intentCounts).map(([intent, count]: [string, any]) => (
                    <div key={intent}>
                      <div className="analytics-split-item-row">
                        <span>{intent}</span>
                        <span className="font-semibold">{count} occurrences</span>
                      </div>
                      <div className="analytics-objection-progress-bg">
                        <div
                          className="analytics-objection-progress-fill"
                          style={{ width: `${(count / totalIntentsSum) * 100}%` }}
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="card lg:col-span-6 analytics-playbook-container">
              <div>
                <h2 className="text-section-heading mb-4">AI Coaching Playbook Alerts</h2>
                <div className="d-flex flex-col gap-12px">
                  <div className="analytics-playbook-alert-red">
                    <div className="color-error font-semibold mb-2px">
                      Competition Warnings Active
                    </div>
                    <span className="color-secondary">
                      Objections for pricing/competitors are higher this week. Ensure sales playbook
                      version 2.4 is deployed.
                    </span>
                  </div>
                  <div className="analytics-playbook-alert-green">
                    <div className="color-success font-semibold mb-2px">
                      Excellent BANT Qualification
                    </div>
                    <span className="color-secondary">
                      Budget qualification questions have increased by 14% month-over-month. Keep
                      prompting budget details.
                    </span>
                  </div>
                </div>
              </div>
              <div className="fs-11 color-muted">Coaching playbook models are updated daily.</div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </Layout>
  );
}
