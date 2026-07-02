'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { EngagementRecord } from '@/shared/types';

/** Connection status for the WebSocket stream */
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

const DEFAULT_WS_URL = 'ws://localhost:8000/ws/records';
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Hook return type — live WebSocket data plus derived session aggregates.
 */
export interface UseConvinceSenseReturn {
  status: ConnectionStatus;
  latestRecord: EngagementRecord | null;
  records: EngagementRecord[];
  averageScore: number;
  averageEnergy: number;
  averageConfidence: number;
  dominantSentiment: string;
  allBuyingSignals: string[];
  allHesitations: string[];
  allIntents: string[];
  latestRecommendation: string;
  sessionDuration: number;
  callId: number | null;
}

/**
 * `useConvinceSense` — a React hook that manages a persistent WebSocket
 * connection to the ConvinceSense backend, accumulates engagement records,
 * and computes running session aggregates via `useMemo`.
 *
 * @param wsUrl - WebSocket endpoint (default: `ws://localhost:8000/ws/records`)
 */
export function useConvinceSense(wsUrl: string | null = null): UseConvinceSenseReturn {
  // ── State ──────────────────────────────────────────────────────────────
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [latestRecord, setLatestRecord] = useState<EngagementRecord | null>(null);
  const [records, setRecords] = useState<EngagementRecord[]>([]);
  const [callId, setCallId] = useState<number | null>(null);

  // ── Refs ────────────────────────────────────────────────────────────────
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectCountRef = useRef<number>(0);

  // ── Connect logic ──────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!wsUrl) return;

    // Prevent duplicate connections
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.CONNECTING ||
        wsRef.current.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    setStatus('connecting');
    setRecords([]);
    setLatestRecord(null);
    setCallId(null);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      // Reset retry counter on successful connection
      reconnectCountRef.current = 0;
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string);
        if (data.type === 'session_info') {
          setCallId(data.call_id);
          return;
        }
        const record: EngagementRecord = data;
        setLatestRecord(record);
        setRecords((prev) => [...prev, record]);
      } catch {
        // Silently ignore malformed messages
      }
    };

    ws.onerror = () => {
      setStatus('error');
    };

    ws.onclose = () => {
      setStatus('disconnected');
      wsRef.current = null;

      // Auto-reconnect with retry limit
      if (reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectCountRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, RECONNECT_DELAY_MS);
      }
    };
  }, [wsUrl]);

  // ── Lifecycle ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (wsUrl) {
      connect();
    } else {
      setStatus('disconnected');
    }

    return () => {
      // Clear any pending reconnect timer
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      // Close the WebSocket cleanly
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional close
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, wsUrl]);


  // ── Derived aggregates ─────────────────────────────────────────────────
  const averageScore = useMemo(() => {
    if (records.length === 0) return 0;
    return records.reduce((sum: number, r) => sum + r.score, 0) / records.length;
  }, [records]);

  const averageEnergy = useMemo(() => {
    if (records.length === 0) return 0;
    return records.reduce((sum: number, r) => sum + r.energy, 0) / records.length;
  }, [records]);

  const averageConfidence = useMemo(() => {
    if (records.length === 0) return 0;
    return records.reduce((sum: number, r) => sum + r.confidence, 0) / records.length;
  }, [records]);

  const dominantSentiment = useMemo(() => {
    if (records.length === 0) return '';
    const freq = new Map<string, number>();
    for (const r of records) {
      freq.set(r.sentiment, (freq.get(r.sentiment) ?? 0) + 1);
    }
    let maxCount = 0;
    let dominant = '';
    for (const [sentiment, count] of freq) {
      if (count > maxCount) {
        maxCount = count;
        dominant = sentiment;
      }
    }
    return dominant;
  }, [records]);

  const allBuyingSignals = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      for (const signal of r.buying_signals) {
        set.add(signal);
      }
    }
    return Array.from(set);
  }, [records]);

  const allHesitations = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      for (const h of r.hesitations) {
        set.add(h);
      }
    }
    return Array.from(set);
  }, [records]);

  const allIntents = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      for (const intent of r.detected_intents) {
        set.add(intent);
      }
    }
    return Array.from(set);
  }, [records]);

  const latestRecommendation = useMemo(() => {
    if (records.length === 0) return '';
    return records[records.length - 1].recommendation;
  }, [records]);

  const sessionDuration = useMemo(() => {
    if (records.length === 0) return 0;
    return records[records.length - 1].timestamp;
  }, [records]);

  // ── Return ─────────────────────────────────────────────────────────────
  return {
    status,
    latestRecord,
    records,
    averageScore,
    averageEnergy,
    averageConfidence,
    dominantSentiment,
    allBuyingSignals,
    allHesitations,
    allIntents,
    latestRecommendation,
    sessionDuration,
    callId,
  };
}

export default useConvinceSense;
