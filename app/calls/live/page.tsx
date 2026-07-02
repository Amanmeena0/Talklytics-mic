'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/shared/components/Layout/Layout';
import LiveDashboardProvider from '@/features/live-session/components/LiveDashboardProvider';
import SessionHeader from '@/features/calls/components/SessionHeader';
import ExecutiveSummary from '@/features/executive-summary/components/ExecutiveSummary';
import EngagementTimeline from '@/features/analytics/components/EngagementTimeline';
import BANTAnalysis from '@/features/bant/components/BANTAnalysis';
import NextSteps from '@/features/next-steps/components/NextSteps';
import TranscriptLog from '@/features/transcript/components/TranscriptLog';
import Footer from '@/shared/components/Layout/Footer';
import { useLiveData } from '@/shared/hooks/LiveDataContext';
import useHealthCheck from '@/shared/hooks/useHealthCheck';

function LiveCallContent() {
  const { status, records, isRecording, isSaving, startSession } = useLiveData();
  const { isBackendOnline, isLoading: isHealthLoading } = useHealthCheck();

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
    if (!isBackendOnline) return;
    if (startSession) {
      startSession(title, clientName, autoSum);
    }
  };

  const hasData = records.length > 0;
  const isSessionActive = isRecording || hasData;

  return (
    <>
      {/* Saving Overlay */}
      {isSaving && (
        <div className="saving-overlay">
          <div className="saving-card">
            <div className="pulse-dot pulse-dot-large mb-4" />
            <h3 className="text-section-heading mb-2 color-primary">Analyzing Conversation</h3>
            <p className="text-body text-center color-secondary max-w-300px">
              Generating LLM executive summary and saving call session details to history. Please hold...
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <SessionHeader />

      {!isSessionActive ? (
        <div className="live-call-config-container">
          <div className="card live-call-config-card">
            <div className="d-flex align-center gap-3 mb-6">
              <span className="material-symbols-outlined fs-32 color-accent">sensors</span>
              <h2 className="text-page-title m-0">Setup Live Sales Stream</h2>
            </div>

            {/* Health status indicator */}
            <div className="health-status-badge-container mb-6">
              {isHealthLoading ? (
                <div className="health-badge health-badge--loading">
                  <span className="material-symbols-outlined spin fs-16">sync</span>
                  Checking FastAPI server...
                </div>
              ) : isBackendOnline ? (
                <div className="health-badge health-badge--online">
                  <span className="health-pulse-dot" />
                  FastAPI Backend Online
                </div>
              ) : (
                <div className="health-badge health-badge--offline">
                  <span className="material-symbols-outlined fs-16">error</span>
                  FastAPI Backend Offline
                </div>
              )}
            </div>

            <form onSubmit={handleStart} className="d-flex flex-col gap-4 w-100">
              <div className="form-group">
                <label htmlFor="call-title" className="form-label">
                  Call Title
                </label>
                <input
                  type="text"
                  id="call-title"
                  className="form-input"
                  placeholder="e.g. Discovery Call - Acme Corp"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={!isBackendOnline}
                />
              </div>

              <div className="form-group">
                <label htmlFor="client-name" className="form-label">
                  Client Name
                </label>
                <input
                  type="text"
                  id="client-name"
                  className="form-input"
                  placeholder="e.g. Acme Corp"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  disabled={!isBackendOnline}
                />
              </div>

              <div className="form-group d-flex align-center justify-between py-2 border-y">
                <div>
                  <span className="form-label-bold d-block">Auto-Summarize on Stop</span>
                  <span className="text-caption color-muted">
                    Generate LLM summary and save records to database automatically.
                  </span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={autoSum}
                    onChange={(e) => setAutoSum(e.target.checked)}
                    disabled={!isBackendOnline}
                  />
                  <span className="slider round" />
                </label>
              </div>

              {!isBackendOnline && (
                <div className="live-call-error-box mt-2">
                  <p className="font-semibold mb-2 color-error d-flex align-center gap-1">
                    <span className="material-symbols-outlined fs-18">terminal</span>
                    FastAPI server not reachable
                  </p>
                  <p className="fs-12 color-secondary m-0">
                    To start, run the following command in your terminal to spin up the python backend:
                  </p>
                  <div className="live-call-cmd-box mt-2 font-mono">
                    uvicorn src.api.app:app --host 127.0.0.1 --port 8000 --reload
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-large mt-4"
                disabled={!isBackendOnline}
              >
                <span className="material-symbols-outlined">play_arrow</span>
                Start Live Session
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* Row 1: Executive Summary + Engagement Timeline */}
          <div className="grid-dashboard">
            <ExecutiveSummary />
            <EngagementTimeline />
          </div>

          {/* Row 2: BANT Analysis + Next Steps */}
          <div className="grid-dashboard mt-5">
            <BANTAnalysis />
            <NextSteps />
          </div>

          {/* Row 3: Transcript Log (full width) */}
          <div className="grid-dashboard mt-5">
            <div className="grid-col-all">
              <TranscriptLog />
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function LiveCallPage() {
  return (
    <Layout>
      <main className="main-content">
        <div className="content-container">
          <LiveDashboardProvider>
            <LiveCallContent />
          </LiveDashboardProvider>
        </div>
        <Footer />
      </main>
    </Layout>
  );
}
