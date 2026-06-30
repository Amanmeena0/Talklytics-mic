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

    const recText = latestRecommendation
      ? `\n- We will make sure to address: ${latestRecommendation.replace(/^💡\s*/, '')}`
      : '';
    const signalText =
      allBuyingSignals.length > 0
        ? `\n- I've noted your interest in: ${allBuyingSignals.slice(0, 2).join(' and ')}.`
        : '';

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
          <div className="next-steps-empty">
            <p className="text-body m-0">
              Waiting for conversation signals to generate recommendations...
            </p>
          </div>
        );
      }

      return (
        <ul className="next-steps-list-gap-5">
          {dynamicSteps.map((step, i) => (
            <li key={i} className="d-flex align-start gap-3">
              <div
                className="task-checkbox cursor-default"
                style={{ background: 'var(--accent-muted)' }}
              >
                <span className="material-symbols-outlined fs-14 color-accent">auto_awesome</span>
              </div>
              <div>
                <p className="text-body font-semibold color-primary m-0 mb-1">{step.title}</p>
                <p className="text-caption m-0">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
      );
    }

    // Historical Review next-steps checklist
    if (nextSteps.length === 0) {
      return (
        <div className="next-steps-empty">
          <p className="text-body m-0">No tasks defined for this call yet.</p>
        </div>
      );
    }

    return (
      <ul className="next-steps-list-gap-4">
        {nextSteps.map((step: any) => (
          <li key={step.id} className="d-flex align-start justify-between gap-3">
            <div className="d-flex align-start gap-3 flex-1">
              <button
                onClick={() => handleToggle(step.id, step.isCompleted)}
                style={{
                  color: step.isCompleted ? 'var(--success)' : 'var(--text-secondary)',
                }}
                className="task-toggle-btn"
              >
                {step.isCompleted ? (
                  <span className="material-symbols-outlined fs-20">check_box</span>
                ) : (
                  <span className="material-symbols-outlined fs-20">check_box_outline_blank</span>
                )}
              </button>
              <div
                style={{
                  textDecoration: step.isCompleted ? 'line-through' : 'none',
                  opacity: step.isCompleted ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <p className="text-body font-semibold color-primary m-0 mb-1">{step.title}</p>
                {step.description && <p className="text-caption m-0">{step.description}</p>}
              </div>
            </div>
            <button
              onClick={() => handleDeleteTask(step.id)}
              className="icon-btn color-muted p-2px"
              title="Delete task"
            >
              <span className="material-symbols-outlined fs-18">delete</span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="lg:col-span-5 d-flex flex-col gap-5">
      {/* Task list card */}
      <div className="card flex-1 pos-relative">
        <div className="d-flex justify-between align-center mb-5">
          <h2 className="text-section-heading d-flex align-center gap-2 m-0">
            <span className="material-symbols-outlined color-accent fs-20">task_alt</span>
            {isLive ? 'Live Coaching Steps' : 'Call Follow-Ups'}
          </h2>

          {!isLive && !isAdding && (
            <button
              className="btn btn-ghost fs-12 color-accent"
              style={{ padding: '4px 8px' }}
              onClick={() => setIsAdding(true)}
            >
              <span className="material-symbols-outlined fs-14 mr-4">add</span>
              Add Task
            </button>
          )}
        </div>

        {/* Add Task Form inline */}
        {!isLive && isAdding && (
          <form onSubmit={handleAddTask} className="next-steps-form">
            <input
              type="text"
              placeholder="Task name (e.g. Follow up on proposal)"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="next-steps-input"
              autoFocus
            />
            <div className="d-flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost fs-12"
                style={{ padding: '4px 8px' }}
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskTitle('');
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary fs-12"
                style={{ padding: '4px 10px' }}
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
        <div className="d-flex align-center gap-2 mb-3">
          <span
            className="material-symbols-outlined color-accent fs-20"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mail
          </span>
          <span className="text-overline color-accent">
            {isLive ? 'AI Live Summary' : 'AI Follow-Up Email'}
          </span>
        </div>
        <p className="text-body next-steps-email-body">{getFollowUpEmail()}</p>
        <button onClick={handleCopyEmail} className="btn btn-primary w-fit">
          <span className="material-symbols-outlined fs-16">
            {isCopying ? 'check' : 'content_copy'}
          </span>
          {isCopying ? 'Copied to Clipboard!' : 'Copy Email Template'}
        </button>
      </div>
    </section>
  );
}
