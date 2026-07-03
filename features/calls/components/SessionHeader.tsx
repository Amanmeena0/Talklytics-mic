'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveData } from '@/shared/hooks/LiveDataContext';
import ConnectionIndicator from '@/features/live-session/components/ConnectionIndicator';

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
    isRecording,
    stopSession,
    sessionTitle,
    sessionClientName,
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
    if (
      !confirm('Are you sure you want to delete this call recording? This action cannot be undone.')
    )
      return;

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
    <header className="session-header-root">
      <div>
        <div className="session-header-topline ">
          {isLive ? (
            isRecording ? (
              <span className="badge badge-error badge-pulsing d-flex align-center gap-1">
                <span className="pulse-dot-red" />
                Live Recording
              </span>
            ) : (
              <span className="badge badge-secondary">Live Monitor Idle</span>
            )
          ) : (
            <span className="badge badge-accent">Recorded Call</span>
          )}

          {isLive ? (
            isRecording && <ConnectionIndicator />
          ) : (
            <span className="badge session-header-id-badge">ID: {id?.substring(0, 8)}...</span>
          )}

          {hasData && (
            <span className="text-caption session-header-segments">
              <span className="material-symbols-outlined fs-14">schedule</span>
              {records.length} segments • {formatDuration(sessionDuration)}
            </span>
          )}
        </div>

        <h1 className="text-page-title session-header-title">
          {isLive
            ? isRecording
              ? sessionTitle || 'Live Session'
              : 'Live Call Monitor'
            : title || 'Call Report'}
          {!isLive && (
            <button
              onClick={handleFavoriteClick}
              disabled={isFavoriting}
              className={`session-header-favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
              title={isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <span
                className={`material-symbols-outlined session-header-favorite-icon ${isFavorite ? 'is-favorite' : ''}`}
              >
                star
              </span>
            </button>
          )}
        </h1>

        <p className="text-body session-header-subtitle">
          {isLive ? (
            isRecording && sessionClientName ? (
              <span>
                Active coaching session for: <strong>{sessionClientName}</strong>
              </span>
            ) : (
              'Real-time AI-powered conversation coaching'
            )
          ) : (
            <>
              <span className="session-header-client">{clientName}</span>
              {formattedDate && <span>• Conducted on {formattedDate}</span>}
            </>
          )}
        </p>
      </div>

      <div className="session-header-actions">
        {isLive && isRecording && stopSession && (
          <button
            onClick={async () => {
              if (
                confirm(
                  'Are you sure you want to stop this live coaching session and save it to history?'
                )
              ) {
                await stopSession();
              }
            }}
            className="btn btn-error"
          >
            <span className="material-symbols-outlined fs-18">stop</span>
            Stop & Save Session
          </button>
        )}

        {!isLive && (
          <button
            onClick={handleDeleteClick}
            className="btn btn-secondary session-header-delete-btn"
            disabled={isDeleting}
          >
            <span className="material-symbols-outlined fs-18">delete</span>
            Delete Call
          </button>
        )}

        {hasData && (
          <button
            onClick={() => {
              const dataStr =
                'data:text/json;charset=utf-8,' +
                encodeURIComponent(JSON.stringify(records, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `${isLive ? 'live' : id}-transcript.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="btn btn-secondary"
          >
            <span className="material-symbols-outlined">download</span>
            Export JSON
          </button>
        )}
      </div>
    </header>
  );
}
