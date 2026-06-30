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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '40vh',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          padding: 'var(--space-6)',
          textAlign: 'center',
          marginBottom: 'var(--space-6)',
          animation: 'fadeInUp 0.3s ease'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>sensors_off</span>
          <h3 className="text-section-heading">No active sales stream</h3>
          <p className="text-body" style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: 'var(--space-1) 0 var(--space-4) 0' }}>
            Ensure your FastAPI uvicorn backend server is running and your microphone is streaming audio. The dashboard will automatically connect and update when a stream starts.
          </p>
          <div style={{ background: 'var(--bg-root)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-geist-mono)', fontSize: '11px', color: 'var(--text-primary)' }}>
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
      <div className="grid-dashboard" style={{ marginTop: 'var(--space-5)' }}>
        <BANTAnalysis />
        <NextSteps />
      </div>

      {/* Row 3: Transcript Log (full width) */}
      <div className="grid-dashboard" style={{ marginTop: 'var(--space-5)' }}>
        <div style={{ gridColumn: '1 / -1' }}>
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
