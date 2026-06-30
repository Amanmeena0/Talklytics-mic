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
      <div className="loading-state-container">
        <div className="pulse-dot pulse-dot-large" />
        <p className="text-body">Loading call intelligence report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state-container">
        <span className="material-symbols-outlined fs-48 color-error">error</span>
        <h3 className="text-section-heading">Failed to load report</h3>
        <p className="text-body max-w-400px">{error}</p>
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
