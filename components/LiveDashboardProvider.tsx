'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LiveDataContext, type LiveDataContextType } from '@/shared/hooks/LiveDataContext';
import useConvinceSense from '@/shared/hooks/useConvinceSense';
import type { EngagementRecord } from '@/shared/types';

interface LiveDashboardProviderProps {
  children: React.ReactNode;
  id?: string; // Optional call ID for historical viewing
  wsUrl?: string;
}

export default function LiveDashboardProvider({ children, id, wsUrl }: LiveDashboardProviderProps) {
  const isLive = !id;

  // ── Live Stream State (Active when isLive === true) ──
  const liveData = useConvinceSense(isLive ? wsUrl : undefined);

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
      const res = await fetch(`/api/calls/${id}`);
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
      const res = await fetch(`/api/calls/${activeId}`, {
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
        const res = await fetch(`/api/calls/${activeId}/comments`, {
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
        const res = await fetch(`/api/calls/${activeId}/next-steps`, {
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
        const res = await fetch(`/api/calls/${activeId}/next-steps`, {
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
        const res = await fetch(`/api/calls/${activeId}/next-steps`, {
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

  // ── Construct Context Value ──
  const contextValue = useMemo<LiveDataContextType>(() => {
    if (isLive) {
      return {
        status: liveData.status,
        isLive: true,
        isLoading: false,
        error: null,
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
        sessionDuration: liveData.sessionDuration,
        toggleFavorite,
        addComment,
        updateNextStep,
        addNextStep,
        deleteNextStep,
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
    toggleFavorite,
    addComment,
    updateNextStep,
    addNextStep,
    deleteNextStep,
    fetchCallDetails,
  ]);

  return <LiveDataContext.Provider value={contextValue}>{children}</LiveDataContext.Provider>;
}
