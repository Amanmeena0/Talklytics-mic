'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface HealthCheckState {
  isBackendOnline: boolean;
  backendVersion: string | null;
  isLoading: boolean;
  error: string | null;
}

interface UseHealthCheckResult extends HealthCheckState {
  recheckHealth: () => void;
}

const POLL_INTERVAL_MS = 30_000;

function useHealthCheck(baseUrl: string = 'http://localhost:8000'): UseHealthCheckResult {
  const [state, setState] = useState<HealthCheckState>({
    isBackendOnline: false,
    backendVersion: null,
    isLoading: true,
    error: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkHealth = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const headers: Record<string, string> = {};
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    try {
      const [healthRes, configRes] = await Promise.all([
        fetch(`${baseUrl}/health`, { headers }),
        fetch(`${baseUrl}/config`, { headers }),
      ]);

      if (!healthRes.ok) {
        throw new Error(`Health endpoint returned ${healthRes.status}`);
      }

      let backendVersion: string | null = null;
      if (configRes.ok) {
        try {
          const configData = await configRes.json();
          backendVersion = configData.version ?? null;
        } catch {
          // config response wasn't valid JSON – ignore
        }
      }

      setState({
        isBackendOnline: true,
        backendVersion,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState({
        isBackendOnline: false,
        backendVersion: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [baseUrl]);

  // Initial fetch + polling
  useEffect(() => {
    checkHealth();

    intervalRef.current = setInterval(checkHealth, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [checkHealth]);

  return { ...state, recheckHealth: checkHealth };
}

export default useHealthCheck;
