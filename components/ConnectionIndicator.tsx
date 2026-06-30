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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: '6px 12px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        fontSize: '12px',
        fontWeight: 600,
        transition: 'all 0.3s ease',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: config.color,
          boxShadow: status === 'connected' ? `0 0 8px ${config.color}` : 'none',
          animation: status === 'connected' ? 'pulse-glow 2s ease-in-out infinite' : 'none',
          transition: 'all 0.3s ease',
        }}
      />
      <span style={{ color: config.color }}>{config.label}</span>
    </div>
  );
}
