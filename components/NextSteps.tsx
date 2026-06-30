'use client';

import { useState } from 'react';
import { useLiveData } from '@/shared/hooks/LiveDataContext';

export default function NextSteps() {
  const {
    latestRecommendation,
    allBuyingSignals,
    allIntents,
    records,
    isLive,
    nextSteps = [],
    updateNextStep,
    addNextStep,
    deleteNextStep,
    clientName,
  } = useLiveData();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const hasData = records.length > 0;

  // Handle task toggling
  const handleToggle = async (stepId: string, currentStatus: boolean) => {
    if (updateNextStep) {
      await updateNextStep(stepId, !currentStatus);
    }
  };

  // Handle task creation
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !addNextStep) return;
    try {
      await addNextStep(newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (stepId: string) => {
    if (deleteNextStep) {
      await deleteNextStep(stepId);
    }
  };

  // Derive follow-up email text dynamically
  const getFollowUpEmail = () => {
    const prospect = clientName || 'there';
    if (!hasData) {
      return `Hi, great connecting today. I've attached the security brief requested. Looking forward to our sync on the 15th...`;
    }

    const recText = latestRecommendation ? `\n- We will make sure to address: ${latestRecommendation.replace(/^💡\s*/, '')}` : '';
    const signalText = allBuyingSignals.length > 0 ? `\n- I've noted your interest in: ${allBuyingSignals.slice(0, 2).join(' and ')}.` : '';

    return `Hi,

Great connecting today. I wanted to summarize our discussion and lay out the next steps we aligned on:
${recText}${signalText}

I will follow up shortly with any requested documentation. Let me know if you have any questions in the meantime.

Best regards,`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(getFollowUpEmail());
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  // Build the items to render
  const renderSteps = () => {
    if (isLive) {
      // Live session derived items
      const dynamicSteps: { title: string; description: string }[] = [];

      if (latestRecommendation) {
        dynamicSteps.push({
          title: 'Follow AI Recommendation',
          description: latestRecommendation.replace(/^💡\s*/, ''),
        });
      }

      if (allBuyingSignals.length > 0) {
        dynamicSteps.push({
          title: 'Capitalize on Buying Signals',
          description: `Detected signals: ${allBuyingSignals.slice(0, 3).join(', ')}. Reinforce these interests.`,
        });
      }

      if (allIntents.includes('OBJECTION') || allIntents.includes('COMPARISON')) {
        dynamicSteps.push({
          title: 'Address Objections',
          description: 'Competitor comparisons or objections detected. Prepare differentiators.',
        });
      }

      if (allIntents.includes('PRICING')) {
        dynamicSteps.push({
          title: 'Prepare Pricing Proposal',
          description: 'Pricing intent detected — have a clear pricing breakdown ready.',
        });
      }

      // Static fallback when live but no signals yet
      if (dynamicSteps.length === 0) {
        return (
          <div style={{ textAlign: 'center', padding: 'var(--space-4) 0', color: 'var(--text-muted)' }}>
            <p className="text-body" style={{ margin: 0 }}>Waiting for conversation signals to generate recommendations...</p>
          </div>
        );
      }

      return (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {dynamicSteps.map((step, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <div className="task-checkbox" style={{ background: 'var(--accent-muted)', cursor: 'default' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--accent)' }}>auto_awesome</span>
              </div>
              <div>
                <p className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 'var(--space-1)' }}>{step.title}</p>
                <p className="text-caption" style={{ margin: 0 }}>{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
      );
    }

    // Historical Review next-steps checklist
    if (nextSteps.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0', color: 'var(--text-muted)' }}>
          <p className="text-body" style={{ margin: 0 }}>No tasks defined for this call yet.</p>
        </div>
      );
    }

    return (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {nextSteps.map((step: any) => (
          <li key={step.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', flex: 1 }}>
              <button
                onClick={() => handleToggle(step.id, step.isCompleted)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: step.isCompleted ? 'var(--success)' : 'var(--text-secondary)',
                }}
              >
                {step.isCompleted ? (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_box</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_box_outline_blank</span>
                )}
              </button>
              <div style={{ textDecoration: step.isCompleted ? 'line-through' : 'none', opacity: step.isCompleted ? 0.6 : 1, transition: 'all 0.2s ease' }}>
                <p className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 'var(--space-1)' }}>{step.title}</p>
                {step.description && <p className="text-caption" style={{ margin: 0 }}>{step.description}</p>}
              </div>
            </div>
            <button
              onClick={() => handleDeleteTask(step.id)}
              className="icon-btn"
              style={{ color: 'var(--text-muted)', padding: '2px' }}
              title="Delete task"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="lg:col-span-5" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Task list card */}
      <div className="card" style={{ flex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          <h2 className="text-section-heading" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 20 }}>task_alt</span>
            {isLive ? 'Live Coaching Steps' : 'Call Follow-Ups'}
          </h2>
          
          {!isLive && !isAdding && (
            <button
              className="btn btn-ghost"
              style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--accent)' }}
              onClick={() => setIsAdding(true)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px' }}>add</span>
              Add Task
            </button>
          )}
        </div>

        {/* Add Task Form inline */}
        {!isLive && isAdding && (
          <form onSubmit={handleAddTask} style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <input
              type="text"
              placeholder="Task name (e.g. Follow up on proposal)"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-root)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                outline: 'none',
                marginBottom: 'var(--space-2)'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => { setIsAdding(false); setNewTaskTitle(''); }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '4px 10px', fontSize: '12px' }}
                disabled={!newTaskTitle.trim()}
              >
                Add
              </button>
            </div>
          </form>
        )}

        {renderSteps()}
      </div>

      {/* AI Follow-Up Draft */}
      <div className="ai-draft-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          <span
            className="material-symbols-outlined"
            style={{ color: 'var(--accent)', fontSize: 20, fontVariationSettings: "'FILL' 1" }}
          >
            mail
          </span>
          <span className="text-overline" style={{ color: 'var(--accent)' }}>
            {isLive ? 'AI Live Summary' : 'AI Follow-Up Email'}
          </span>
        </div>
        <p className="text-body" style={{ fontStyle: 'italic', marginBottom: 'var(--space-5)', whiteSpace: 'pre-line', fontSize: '13px', lineHeight: '1.5' }}>
          {getFollowUpEmail()}
        </p>
        <button onClick={handleCopyEmail} className="btn btn-primary" style={{ width: 'fit-content' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            {isCopying ? 'check' : 'content_copy'}
          </span>
          {isCopying ? 'Copied to Clipboard!' : 'Copy Email Template'}
        </button>
      </div>
    </section>
  );
}
