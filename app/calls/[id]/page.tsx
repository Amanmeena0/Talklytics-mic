'use client';

import React from 'react';
import { useParams } from 'next/navigation';
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

function CallDetailContent({ id }: { id: string }) {
  const { isLoading, error } = useLiveData();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 'var(--space-4)' }}>
        <div className="pulse-dot" style={{ width: '16px', height: '16px' }} />
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Loading call intelligence report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 'var(--space-4)', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--error)' }}>error</span>
        <h3 className="text-section-heading">Failed to load report</h3>
        <p className="text-body" style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <SessionHeader id={id} />

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

export default function CallDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <Layout>
      <main className="main-content">
        <div className="content-container">
          <LiveDashboardProvider id={id}>
            <CallDetailContent id={id} />
          </LiveDashboardProvider>
        </div>
        <Footer />
      </main>
    </Layout>
  );
}
