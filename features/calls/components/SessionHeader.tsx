'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveData } from '@/shared/hooks/LiveDataContext';
import ConnectionIndicator from '@/features/live-session/components/ConnectionIndicator';

import PageHeader from '@/shared/components/Layout/PageHeader';

interface SessionHeaderProps {
  id?: string;
  noBorder?: boolean;
}

export default function SessionHeader({ id, noBorder = false }: SessionHeaderProps) {
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
    <PageHeader
      noBorder={noBorder}
      badge={
        <>
          {isLive ? (
            isRecording ? (
              <span className="inline-flex items-center gap-1.5 text-[9px] bg-rose-50/85 text-rose-700 border border-rose-200/50 backdrop-blur-sm px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-widest shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                Live Recording
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[9px] bg-amber-50/85 text-amber-700 border border-amber-200/50 backdrop-blur-sm px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-widest shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Live Monitor Idle
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[9px] bg-indigo-50/85 text-indigo-700 border border-indigo-200/50 backdrop-blur-sm px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-widest shadow-sm">
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
        </>
      }
      title={
        <h1
          className={`text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent font-sans mt-3 flex items-center gap-2 ${
            isLive
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'
              : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'
          }`}
        >
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
      }
      subtitle={
        isLive ? (
          isRecording && sessionClientName ? (
            <span>
              Active coaching session for:{' '}
              <strong className="text-slate-800 font-bold">{sessionClientName}</strong>
            </span>
          ) : (
            <span>
              <span className="text-indigo-600 font-bold bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100/50">
                Real-time
              </span>{' '}
              AI-powered conversation coaching & sales intelligence
            </span>
          )
        ) : (
          <>
            <strong className="text-slate-800 font-bold">{clientName}</strong>
            {formattedDate && (
              <span className="text-slate-400 font-normal"> • Conducted on {formattedDate}</span>
            )}
          </>
        )
      }
      actions={
        <>
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
        </>
      }
    />
  );
}
