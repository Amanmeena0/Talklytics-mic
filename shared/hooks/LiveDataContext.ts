'use client';

import React, { createContext, useContext } from 'react';
import type { EngagementRecord, ConnectionStatus } from '@/shared/types';

/** Shape of the live/historical data context provided to all dashboard components */
export interface LiveDataContextType {
  // Connection / Mode
  status: ConnectionStatus;
  isLive: boolean;
  isLoading: boolean;
  error: string | null;

  // Session Control States
  isRecording?: boolean;
  isSaving?: boolean;
  autoSummarize?: boolean;
  sessionTitle?: string;
  sessionClientName?: string;

  // Metadata (for past calls or active session)
  id?: string;
  title?: string;
  clientName?: string;
  date?: string;
  isFavorite?: boolean;
  conversionProbability?: number;
  summary?: string;

  // BANT Fields
  bantBudget?: string;
  bantBudgetMet?: boolean;
  bantAuthority?: string;
  bantAuthorityMet?: boolean;
  bantNeed?: string;
  bantNeedMet?: boolean;
  bantTimeline?: string;
  bantTimelineMet?: boolean;

  // Raw data
  latestRecord: EngagementRecord | null;
  records: EngagementRecord[];
  comments?: any[];
  nextSteps?: any[];

  // Aggregates
  averageScore: number;
  averageEnergy: number;
  averageConfidence: number;
  dominantSentiment: string;
  allBuyingSignals: string[];
  allHesitations: string[];
  allIntents: string[];
  latestRecommendation: string;
  sessionDuration: number;

  // Actions
  toggleFavorite?: () => Promise<void>;
  addComment?: (content: string, timestamp?: number) => Promise<void>;
  updateNextStep?: (stepId: string, isCompleted: boolean) => Promise<void>;
  addNextStep?: (title: string, description?: string) => Promise<void>;
  deleteNextStep?: (stepId: string) => Promise<void>;
  refetch?: () => Promise<void>;

  // Session control actions
  startSession?: (title: string, clientName: string, autoSummarize: boolean) => void;
  stopSession?: () => Promise<void>;
  setAutoSummarize?: (val: boolean) => void;
}

const defaultValue: LiveDataContextType = {
  status: 'disconnected',
  isLive: true,
  isLoading: false,
  error: null,
  isRecording: false,
  isSaving: false,
  autoSummarize: true,
  sessionTitle: '',
  sessionClientName: '',
  latestRecord: null,
  records: [],
  averageScore: 0,
  averageEnergy: 0,
  averageConfidence: 0,
  dominantSentiment: 'Neutral',
  allBuyingSignals: [],
  allHesitations: [],
  allIntents: [],
  latestRecommendation: '',
  sessionDuration: 0,
};

export const LiveDataContext = createContext<LiveDataContextType>(defaultValue);

/**
 * Hook to consume call data (live or historical) from anywhere in the component tree.
 */
export function useLiveData(): LiveDataContextType {
  return useContext(LiveDataContext);
}
