'use client';

import React from 'react';
import Layout from '@/components/Layout';
import LiveDashboardProvider from '@/components/LiveDashboardProvider';
import SessionHeader from '@/components/SessionHeader';
import ExecutiveSummary from '@/components/ExecutiveSummary';
import EngagementTimeline from '@/components/EngagementTimeline';
import BANTAnalysis from '@/components/BANTAnalysis';
import NextSteps from '@/components/NextSteps';
import TranscriptLog from '@/components/TranscriptLog';
import Footer from '@/components/Footer';
import { useLiveData } from '@/shared/hooks/LiveDataContext';

function LiveCallContent() {
  const { status, records } = useLiveData();
  const hasData = records.length > 0;

  return (
    <>
      {/* Page Header */}
      <SessionHeader />

      {status === 'disconnected' && !hasData && (
        <div className="live-call-no-stream-card">
          <span className="material-symbols-outlined fs-48 color-muted mb-3">sensors_off</span>
          <h3 className="text-section-heading">No active sales stream</h3>
          <p className="text-body live-call-no-stream-text">
            Ensure your FastAPI uvicorn backend server is running and your microphone is streaming
            audio. The dashboard will automatically connect and update when a stream starts.
          </p>
          <div className="live-call-cmd-box">
            uvicorn src.api.app:app --host 127.0.0.1 --port 8000 --reload
          </div>
        </div>
      )}

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
