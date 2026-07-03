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

  const isIdleLive = isLive && !isRecording;

  return (
    <header className="session-header-root">
      <div className={isIdleLive ? 'text-center flex flex-col items-center justify-center w-full' : ''}>
        <div className={`flex items-center gap-2.5 flex-wrap ${isIdleLive ? 'justify-center' : ''}`}>
          {isLive ? (
            isRecording ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-100 text-red-700 font-bold text-[10px] tracking-wider uppercase rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                Live Recording
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] tracking-wider uppercase rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Live Monitor Idle
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px] tracking-wider uppercase rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Recorded Call
            </span>
          )}

          {isLive ? (
            isRecording && <ConnectionIndicator />
          ) : (
            <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/60 text-slate-500 font-bold text-[9px] px-2 py-0.5 rounded uppercase">
              ID: {id?.substring(0, 8)}...
            </span>
          )}

          {hasData && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
              <span>•</span>
              <span>{records.length} segments</span>
              <span>•</span>
              <span>{formatDuration(sessionDuration)}</span>
            </span>
          )}
        </div>

        <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 font-sans mt-3 flex items-center gap-2 ${isIdleLive ? 'justify-center text-center' : ''}`}>
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

        <p className={`text-xs font-semibold text-slate-500 mt-1 max-w-xl leading-relaxed font-sans ${isIdleLive ? 'text-center mx-auto' : ''}`}>
          {isLive ? (
            isRecording && sessionClientName ? (
              <span>
                Active coaching session for: <strong className="text-slate-800 font-bold">{sessionClientName}</strong>
              </span>
            ) : (
              'Real-time AI-powered conversation coaching'
            )
          ) : (
            <>
              <strong className="text-slate-800 font-bold">{clientName}</strong>
              {formattedDate && <span className="text-slate-400 font-normal"> • Conducted on {formattedDate}</span>}
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
