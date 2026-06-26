import Layout from '@/components/Layout';
import ExecutiveSummary from '@/components/ExecutiveSummary';
import EngagementTimeline from '@/components/EngagementTimeline';
import BANTAnalysis from '@/components/BANTAnalysis';
import NextSteps from '@/components/NextSteps';
import TranscriptLog from '@/components/TranscriptLog';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <Layout>
      <main className="main-content">
        <div className="content-container">
          {/* Page Header */}
          <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <span className="badge badge-accent">Enterprise Sale</span>
                <span className="text-caption">Call ID: CS-9842-X</span>
              </div>
              <h1 className="text-page-title">Post-Call Summary: Acme Corp Q4 Renewal</h1>
              <p className="text-body" style={{ marginTop: 'var(--space-1)' }}>Conducted on Oct 24, 2023 • 24m 12s Duration</p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary">
                <span className="material-symbols-outlined">share</span>
                Share Report
              </button>
              <button className="btn btn-secondary">
                <span className="material-symbols-outlined">download</span>
                Export CSV
              </button>
            </div>
          </header>

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
        </div>

        <Footer />
      </main>
    </Layout>
  );
}
