'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveData } from '@/shared/hooks/LiveDataContext';
import ConnectionIndicator from '@/components/ConnectionIndicator';

interface SessionHeaderProps {
  id?: string;
}

export default function SessionHeader({ id }: SessionHeaderProps) {
  const router = useRouter();
  const {
    records,
    sessionDuration,
    status,
    isLive,
    title,
    clientName,
    date,
    isFavorite,
    toggleFavorite,
  } = useLiveData();

  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasData = records.length > 0;

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}m ${sec}s`;
  };

  const handleFavoriteClick = async () => {
    if (!toggleFavorite || isFavoriting) return;
    setIsFavoriting(true);
    try {
      await toggleFavorite();
    } catch (e) {
      console.error(e);
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!id || isDeleting) return;
    if (!confirm('Are you sure you want to delete this call recording? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/calls/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/calls');
      } else {
        alert('Failed to delete call');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting call');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date nicely
  const formattedDate = date 
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span className="badge badge-accent">
            {isLive ? 'Live Session' : 'Recorded Call'}
          </span>
          {isLive ? (
            <ConnectionIndicator />
          ) : (
            <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              ID: {id?.substring(0, 8)}...
            </span>
          )}
          {hasData && (
            <span className="text-caption" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
              {records.length} segments • {formatDuration(sessionDuration)}
            </span>
          )}
        </div>
        
        <h1 className="text-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLive ? 'Live Call Monitor' : (title || 'Call Report')}
          {!isLive && (
            <button
              onClick={handleFavoriteClick}
              disabled={isFavoriting}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isFavorite ? 'var(--warning)' : 'var(--text-muted)',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s ease',
                outline: 'none'
              }}
              title={isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: isFavorite ? "'FILL' 1" : undefined }}>
                star
              </span>
            </button>
          )}
        </h1>
        
        <p className="text-body" style={{ marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLive ? (
            'Real-time AI-powered conversation coaching'
          ) : (
            <>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{clientName}</span>
              {formattedDate && <span>• Conducted on {formattedDate}</span>}
            </>
          )}
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        {!isLive && (
          <button
            onClick={handleDeleteClick}
            className="btn btn-secondary"
            style={{ borderColor: 'var(--error-muted)', color: 'var(--error)' }}
            disabled={isDeleting}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
            Delete Call
          </button>
        )}
        <button
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `${isLive ? 'live' : id}-transcript.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="btn btn-secondary"
        >
          <span className="material-symbols-outlined">download</span>
          Export JSON
        </button>
      </div>
    </header>
  );
}
