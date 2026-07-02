'use client';

import React from 'react';
import { useLiveData } from '@/shared/hooks/LiveDataContext';
import type { ConnectionStatus } from '@/shared/types';

const statusConfig: Record<ConnectionStatus, { color: string; label: string; icon: string }> = {
  connecting: { color: 'var(--warning)', label: 'Connecting...', icon: 'sync' },
  connected: { color: 'var(--success)', label: 'Live', icon: 'sensors' },
  disconnected: { color: 'var(--text-muted)', label: 'Disconnected', icon: 'sensors_off' },
  error: { color: 'var(--error)', label: 'Error', icon: 'error' },
};

/**
 * Small indicator showing WebSocket connection status.
 * Displays a pulsing dot when connected, static otherwise.
 */
export default function ConnectionIndicator() {
  const { status } = useLiveData();
  const config = statusConfig[status];

  return (
    <div className="connection-indicator-container">
      <span
        className={`connection-indicator-dot connection-indicator-dot--${status} ${status === 'connected' ? 'is-connected' : ''}`}
      />
      <span className={`connection-indicator-label connection-indicator-label--${status}`}>
        {config.label}
      </span>
    </div>
  );
}
