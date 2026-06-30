'use client';

import { useLiveData } from '@/shared/hooks/LiveDataContext';

export default function BANTAnalysis() {
  const {
    records,
    allIntents,
    averageScore,
    averageConfidence,
    isLive,
    bantBudget,
    bantBudgetMet,
    bantAuthority,
    bantAuthorityMet,
    bantNeed,
    bantNeedMet,
    bantTimeline,
    bantTimelineMet
  } = useLiveData();

  const hasData = records.length > 0;

  // If historical, use database values. Otherwise derive or show placeholder.
  const bantItems = [
    {
      label: 'BUDGET',
      detected: isLive ? allIntents.includes('PRICING') : bantBudgetMet,
      title: isLive
        ? (allIntents.includes('PRICING') ? 'Pricing Discussion Detected' : 'No Budget Signals Yet')
        : (bantBudget ? 'Budget Allocated' : 'No Budget Details'),
      description: isLive
        ? (allIntents.includes('PRICING')
            ? `Pricing-related intents detected with ${Math.round(averageConfidence * 100)}% confidence.`
            : 'No pricing or budget discussions have been identified in the conversation so far.')
        : (bantBudget || 'No budget criteria discussed during the call.'),
      icon: (isLive ? allIntents.includes('PRICING') : bantBudgetMet) ? 'check_circle' : 'radio_button_unchecked',
      iconColor: (isLive ? allIntents.includes('PRICING') : bantBudgetMet) ? 'var(--success)' : 'var(--text-muted)',
    },
    {
      label: 'AUTHORITY',
      detected: isLive ? allIntents.includes('COMMITMENT') : bantAuthorityMet,
      title: isLive
        ? (allIntents.includes('COMMITMENT') ? 'Commitment Signals Found' : 'No Authority Signals Yet')
        : (bantAuthority ? 'Decision Maker Identified' : 'Authority Unverified'),
      description: isLive
        ? (allIntents.includes('COMMITMENT')
            ? 'Commitment-level intents detected — a decision-maker may be present.'
            : 'No commitment or authority signals have been identified yet.')
        : (bantAuthority || 'No authority criteria or decision-maker verified.'),
      icon: (isLive ? allIntents.includes('COMMITMENT') : bantAuthorityMet) ? 'check_circle' : 'radio_button_unchecked',
      iconColor: (isLive ? allIntents.includes('COMMITMENT') : bantAuthorityMet) ? 'var(--success)' : 'var(--text-muted)',
    },
    {
      label: 'NEED',
      detected: isLive ? (allIntents.includes('INFORMATION') || allIntents.includes('COMPARISON')) : bantNeedMet,
      title: isLive
        ? (allIntents.includes('INFORMATION') || allIntents.includes('COMPARISON') ? 'Active Inquiry Detected' : 'No Need Signals Yet')
        : (bantNeed ? 'Need Defined' : 'No Clear Need'),
      description: isLive
        ? (allIntents.includes('INFORMATION') || allIntents.includes('COMPARISON')
            ? 'Information or comparison intents detected — prospect is evaluating options.'
            : 'No information-seeking or comparison signals detected yet.')
        : (bantNeed || 'No operational needs explicitly verified during this call.'),
      icon: (isLive ? (allIntents.includes('INFORMATION') || allIntents.includes('COMPARISON')) : bantNeedMet) ? 'info' : 'radio_button_unchecked',
      iconColor: (isLive ? (allIntents.includes('INFORMATION') || allIntents.includes('COMPARISON')) : bantNeedMet) ? 'var(--info)' : 'var(--text-muted)',
    },
    {
      label: 'TIMELINE',
      detected: isLive ? (allIntents.includes('COMMITMENT') || allIntents.includes('PRICING')) : bantTimelineMet,
      title: isLive
        ? (allIntents.includes('COMMITMENT') || allIntents.includes('PRICING') ? 'Urgency Indicators Present' : 'No Timeline Signals Yet')
        : (bantTimeline ? 'Timeline Established' : 'No Timeline Discussed'),
      description: isLive
        ? (allIntents.includes('COMMITMENT') || allIntents.includes('PRICING')
            ? `Active engagement with ${averageScore.toFixed(1)}/5 avg score suggests timeline pressure.`
            : 'No urgency or timeline-related discussions detected.')
        : (bantTimeline || 'No launch timeline or deployment windows discussed.'),
      icon: (isLive ? (allIntents.includes('COMMITMENT') || allIntents.includes('PRICING')) : bantTimelineMet) ? 'pending' : 'radio_button_unchecked',
      iconColor: (isLive ? (allIntents.includes('COMMITMENT') || allIntents.includes('PRICING')) : bantTimelineMet) ? 'var(--warning)' : 'var(--text-muted)',
    },
  ];

  return (
    <section className="card lg:col-span-7">
      <h2 className="text-section-heading" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 20 }}>fact_check</span>
        BANT Analysis
        {hasData && (
          <span className="badge badge-accent" style={{ marginLeft: 'var(--space-2)', fontSize: 10 }}>
            {isLive ? 'Live' : 'Verified'}
          </span>
        )}
      </h2>

      <div className="bant-grid">
        {bantItems.map((item) => (
          <div key={item.label} className="bant-item" style={{ transition: 'all 0.3s ease', opacity: hasData ? 1 : 0.7 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <span className="text-overline">{item.label}</span>
              <span className="material-symbols-outlined" style={{ color: item.iconColor, fontSize: 18, transition: 'color 0.3s ease' }}>{item.icon}</span>
            </div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 'var(--space-1)', fontSize: 14 }}>{item.title}</p>
            <p className="text-body" style={{ margin: 0 }}>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
