'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LiveDataContext, type LiveDataContextType } from '@/shared/hooks/LiveDataContext';
import useConvinceSense from '@/shared/hooks/useConvinceSense';
import type { EngagementRecord } from '@/shared/types';
import clientFetch from '@/shared/utils/clientFetch';

interface LiveDashboardProviderProps {
  children: React.ReactNode;
  id?: string; // Optional call ID for historical viewing
  wsUrl?: string;
}

export default function LiveDashboardProvider({ children, id, wsUrl }: LiveDashboardProviderProps) {
  const isLive = !id;

  // ── Session Control States ──
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [autoSummarize, setAutoSummarize] = useState<boolean>(true);
  const [sessionTitle, setSessionTitle] = useState<string>('');
  const [sessionClientName, setSessionClientName] = useState<string>('');
  // New: client‑side timer state
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dynamicWsUrl = useMemo(() => {
    if (!isLive || !isRecording) return null;
    const titleParam = sessionTitle ? `${sessionTitle} - ${sessionClientName}` : 'Live Session';
    const base = wsUrl || 'ws://localhost:8000/ws/records';
    return `${base}?save_to_db=${autoSummarize ? 'true' : 'false'}&user_id=1&title=${encodeURIComponent(titleParam)}`;
  }, [isLive, isRecording, sessionTitle, sessionClientName, autoSummarize, wsUrl]);

  // ── Live Stream State (Active when isLive === true and isRecording === true) ──
  const liveData = useConvinceSense(dynamicWsUrl);

  // ── Historical State (Active when isLive === false) ──
  const [callData, setCallData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!isLive);
  const [error, setError] = useState<string | null>(null);

  // Fetch past call details
  const fetchCallDetails = useCallback(async () => {
    if (isLive || !id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await clientFetch(`/api/calls/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch call details: ${res.statusText}`);
      }
      const data = await res.json();
      setCallData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load call');
    } finally {
      setIsLoading(false);
    }
  }, [id, isLive]);

  useEffect(() => {
    fetchCallDetails();
  }, [fetchCallDetails]);

  // ── Action Handlers ──

  // Toggle favorite status
  const toggleFavorite = useCallback(async () => {
    const activeId = id || callData?.id;
    if (!activeId) return;

    // Optimistic update for historical view
    const currentFavorite = callData ? callData.isFavorite : false;
    if (callData) {
      setCallData((prev: any) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }

    try {
      const res = await clientFetch(`/api/calls/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentFavorite }),
      });
      if (!res.ok) {
        throw new Error('Failed to update favorite status');
      }
      const updated = await res.json();
      // Ensure we align with server state
      if (callData) {
        setCallData((prev: any) => (prev ? { ...prev, isFavorite: updated.isFavorite } : null));
      }
    } catch (err) {
      // Revert on error
      if (callData) {
        setCallData((prev: any) => (prev ? { ...prev, isFavorite: currentFavorite } : null));
      }
      console.error(err);
    }
  }, [id, callData]);

  // Add review comment
  const addComment = useCallback(
    async (content: string, timestamp?: number) => {
      const activeId = id || callData?.id;
      if (!activeId) return;

      try {
        const res = await clientFetch(`/api/calls/${activeId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, timestamp }),
        });
        if (!res.ok) throw new Error('Failed to add comment');
        const newComment = await res.json();

        // Update comments list locally
        if (callData) {
          setCallData((prev: any) =>
            prev
              ? {
                  ...prev,
                  comments: [...(prev.comments || []), newComment],
                }
              : null
          );
        }
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    [id, callData]
  );

  // Toggle next step completion status
  const updateNextStep = useCallback(
    async (stepId: string, isCompleted: boolean) => {
      const activeId = id || callData?.id;
      if (!activeId) return;

      // Optimistic update
      if (callData) {
        setCallData((prev: any) =>
          prev
            ? {
                ...prev,
                nextSteps: prev.nextSteps.map((step: any) =>
                  step.id === stepId ? { ...step, isCompleted } : step
                ),
              }
            : null
        );
      }

      try {
        const res = await clientFetch(`/api/calls/${activeId}/next-steps`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stepId, isCompleted }),
        });
        if (!res.ok) throw new Error('Failed to update next step');
        const updatedStep = await res.json();

        if (callData) {
          setCallData((prev: any) =>
            prev
              ? {
                  ...prev,
                  nextSteps: prev.nextSteps.map((step: any) =>
                    step.id === stepId ? updatedStep : step
                  ),
                }
              : null
          );
        }
      } catch (err) {
        // Revert on error
        if (callData) {
          setCallData((prev: any) =>
            prev
              ? {
                  ...prev,
                  nextSteps: prev.nextSteps.map((step: any) =>
                    step.id === stepId ? { ...step, isCompleted: !isCompleted } : step
                  ),
                }
              : null
          );
        }
        console.error(err);
      }
    },
    [id, callData]
  );

  // Create new next step task
  const addNextStep = useCallback(
    async (title: string, description?: string) => {
      const activeId = id || callData?.id;
      if (!activeId) return;

      try {
        const res = await clientFetch(`/api/calls/${activeId}/next-steps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });
        if (!res.ok) throw new Error('Failed to create next step');
        const newStep = await res.json();

        if (callData) {
          setCallData((prev: any) =>
            prev
              ? {
                  ...prev,
                  nextSteps: [newStep, ...(prev.nextSteps || [])],
                }
              : null
          );
        }
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    [id, callData]
  );

  // Delete next step task
  const deleteNextStep = useCallback(
    async (stepId: string) => {
      const activeId = id || callData?.id;
      if (!activeId) return;

      // Optimistic delete
      if (callData) {
        setCallData((prev: any) =>
          prev
            ? {
                ...prev,
                nextSteps: prev.nextSteps.filter((step: any) => step.id !== stepId),
              }
            : null
        );
      }

      try {
        const res = await clientFetch(`/api/calls/${activeId}/next-steps`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stepId, isDelete: true }),
        });
        if (!res.ok) throw new Error('Failed to delete next step');
      } catch (err) {
        // Re-fetch to align
        fetchCallDetails();
        console.error(err);
      }
    },
    [id, callData, fetchCallDetails]
  );

  // Start recording session
  const startSession = useCallback((title: string, clientName: string, autoSum: boolean) => {
    setSessionTitle(title);
    setSessionClientName(clientName);
    setAutoSummarize(autoSum);
    setIsRecording(true);
    // Initialise client‑side timer
    const now = Date.now();
    setStartTime(now);
    setElapsedMs(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - now);
    }, 1000);
  }, []);

  // Stop recording session, disconnect WebSocket, and redirect to the saved Call page on backend
  const stopSession = useCallback(async () => {
    setIsRecording(false);
    setIsSaving(true);
    // Clear client‑side timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Compute final duration (ms)
    const finalDuration = elapsedMs;

    // If auto‑summarize is disabled, manually POST the call data
    if (!autoSummarize) {
      try {
        await clientFetch('/api/calls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: sessionTitle,
            clientName: sessionClientName,
            duration: Math.floor(finalDuration / 1000),
            records: liveData.records,
            comments: [],
            nextSteps: [],
          }),
        });
      } catch (e) {
        console.error('Failed to manually save call', e);
      }
    }

    // Wait 2.5 seconds to let the backend finish generating the summary (when autoSummarize=true)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    setIsSaving(false);
    if (liveData.callId) {
      window.location.href = `/calls/${liveData.callId}`;
    } else {
      window.location.href = '/calls';
    }
  }, [
    liveData.callId,
    liveData.records,
    sessionTitle,
    sessionClientName,
    autoSummarize,
    elapsedMs,
  ]);

  // ── Construct Context Value ──
  const contextValue = useMemo<LiveDataContextType>(() => {
    if (isLive) {
      return {
        status: liveData.status,
        isLive: true,
        isLoading: false,
        error: null,
        isRecording,
        isSaving,
        autoSummarize,
        sessionTitle,
        sessionClientName,
        latestRecord: liveData.latestRecord,
        records: liveData.records,
        nextSteps: [],
        averageScore: liveData.averageScore,
        averageEnergy: liveData.averageEnergy,
        averageConfidence: liveData.averageConfidence,
        dominantSentiment: liveData.dominantSentiment,
        allBuyingSignals: liveData.allBuyingSignals,
        allHesitations: liveData.allHesitations,
        allIntents: liveData.allIntents,
        latestRecommendation: liveData.latestRecommendation,
        // Use client‑side elapsed time if available, otherwise fallback to backend timestamp
        sessionDuration: startTime ? Math.floor(elapsedMs / 1000) : liveData.sessionDuration,
        toggleFavorite,
        addComment,
        updateNextStep,
        addNextStep,
        deleteNextStep,
        startSession,
        stopSession,
        setAutoSummarize,
      };
    }

    // Historical call values
    const records = callData?.records || [];

    // Aggregates for historical
    const allBuyingSignals = Array.from(
      new Set(records.flatMap((r: any) => r.buying_signals || []))
    ) as string[];
    const allHesitations = Array.from(
      new Set(records.flatMap((r: any) => r.hesitations || []))
    ) as string[];
    const allIntents = Array.from(
      new Set(records.flatMap((r: any) => r.detected_intents || []))
    ) as string[];

    return {
      status: 'disconnected',
      isLive: false,
      isLoading,
      error,
      id: callData?.id,
      title: callData?.title,
      clientName: callData?.clientName,
      date: callData?.date,
      isFavorite: callData?.isFavorite,
      conversionProbability: callData?.conversionProbability,
      summary: callData?.summary,
      bantBudget: callData?.bantBudget,
      bantBudgetMet: callData?.bantBudgetMet,
      bantAuthority: callData?.bantAuthority,
      bantAuthorityMet: callData?.bantAuthorityMet,
      bantNeed: callData?.bantNeed,
      bantNeedMet: callData?.bantNeedMet,
      bantTimeline: callData?.bantTimeline,
      bantTimelineMet: callData?.bantTimelineMet,
      latestRecord: records.length > 0 ? records[records.length - 1] : null,
      records,
      comments: callData?.comments || [],
      nextSteps: callData?.nextSteps || [],
      averageScore: callData?.averageScore || 0,
      averageEnergy: callData?.averageEnergy || 0,
      averageConfidence: callData?.averageConfidence || 0,
      dominantSentiment: callData?.overallSentiment || 'Neutral',
      allBuyingSignals,
      allHesitations,
      allIntents,
      latestRecommendation: records.length > 0 ? records[records.length - 1].recommendation : '',
      sessionDuration: callData?.duration || 0,
      toggleFavorite,
      addComment,
      updateNextStep,
      addNextStep,
      deleteNextStep,
      refetch: fetchCallDetails,
    };
  }, [
    isLive,
    liveData,
    callData,
    isLoading,
    error,
    isRecording,
    isSaving,
    autoSummarize,
    sessionTitle,
    sessionClientName,
    toggleFavorite,
    addComment,
    updateNextStep,
    addNextStep,
    deleteNextStep,
    startSession,
    stopSession,
    fetchCallDetails,
  ]);

  return <LiveDataContext.Provider value={contextValue}>{children}</LiveDataContext.Provider>;
}
