// shared/types.ts

/** Connection status for the WebSocket stream */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/** Sentiment labels returned by the backend */
export type Sentiment = 'Positive' | 'Neutral' | 'Negative';

/** Intent categories detected by the backend */
export type IntentType = 'PRICING' | 'COMPARISON' | 'OBJECTION' | 'COMMITMENT' | 'INFORMATION';

/**
 * A single engagement record pushed from the backend WebSocket every ~3 seconds.
 * Matches the backend EngagementRecord schema exactly.
 */
export interface EngagementRecord {
  id?: string;
  timestamp: number;
  score: number;
  transcript: string;
  sentiment: string;
  buying_signals: string[];
  hesitations: string[];
  detected_intents: string[];
  intent_confidence: number;
  recommendation: string;
  energy: number;
  confidence: number;
  speaker: string;
}

/** Aggregated session metrics computed from all received records */
export interface SessionAggregates {
  averageScore: number;
  averageEnergy: number;
  averageConfidence: number;
  dominantSentiment: string;
  allBuyingSignals: string[];
  allHesitations: string[];
  allIntents: string[];
  latestRecommendation: string;
  sessionDuration: number;
}
