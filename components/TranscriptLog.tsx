'use client';

import { useState } from 'react';
import { useLiveData } from '@/shared/hooks/LiveDataContext';

/**
 * Formats seconds to mm:ss
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TranscriptLog() {
  const { records, status, isLive, comments = [], addComment } = useLiveData();

  const [activeTab, setActiveTab] = useState<'transcript' | 'comments'>('transcript');
  const [speakerFilter, setSpeakerFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [commentTimestamp, setCommentTimestamp] = useState<number | null>(null);

  const hasData = records.length > 0;

  // Get unique speakers
  const speakers = hasData ? Array.from(new Set(records.map((r) => r.speaker))) : [];

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSpeaker = speakerFilter === 'All' || record.speaker === speakerFilter;
    const matchesSearch =
      searchQuery === '' ||
      record.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpeaker && matchesSearch;
  });

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !addComment) return;
    try {
      await addComment(newCommentText.trim(), commentTimestamp || undefined);
      setNewCommentText('');
      setCommentTimestamp(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Avatar styles
  const sentimentAvatarStyle = (sentiment: string): { background: string; color: string } => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return { background: 'var(--accent-muted)', color: 'var(--accent)' };
      case 'negative':
        return { background: 'rgba(239, 68, 68, 0.15)', color: 'var(--error)' };
      default:
        return { background: 'var(--bg-elevated)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <section className="card-flush">
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-6)',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-default)',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {/* Main Tab Switcher */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-1)',
              background: 'var(--bg-root)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <button
              onClick={() => setActiveTab('transcript')}
              style={{
                background: activeTab === 'transcript' ? 'var(--bg-card)' : 'none',
                border: 'none',
                color: activeTab === 'transcript' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Transcript
            </button>
            {!isLive && (
              <button
                onClick={() => setActiveTab('comments')}
                style={{
                  background: activeTab === 'comments' ? 'var(--bg-card)' : 'none',
                  border: 'none',
                  color: activeTab === 'comments' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Comments
                {comments.length > 0 && (
                  <span
                    style={{
                      background: 'var(--accent)',
                      color: 'white',
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '50%',
                    }}
                  >
                    {comments.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {status === 'connected' && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--success)',
                display: 'inline-block',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}
            />
          )}
        </div>

        {/* Filters and search */}
        {activeTab === 'transcript' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
            }}
          >
            <div className="search-input" style={{ width: '180px', height: '32px' }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '16px', color: 'var(--text-muted)' }}
              >
                search
              </span>
              <input
                placeholder="Search transcript..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '12px' }}
              />
            </div>

            <div className="filter-tabs">
              <button
                onClick={() => setSpeakerFilter('All')}
                className={`filter-tab ${speakerFilter === 'All' ? 'active' : ''}`}
                style={{ height: '30px', padding: '0 12px', fontSize: '11px' }}
              >
                All
              </button>
              {speakers.map((speaker) => (
                <button
                  key={speaker}
                  onClick={() => setSpeakerFilter(speaker)}
                  className={`filter-tab ${speakerFilter === speaker ? 'active' : ''}`}
                  style={{ height: '30px', padding: '0 12px', fontSize: '11px' }}
                >
                  {speaker}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div
        className="custom-scrollbar"
        style={{
          height: 384,
          overflowY: 'auto',
          padding: 'var(--space-6)',
        }}
      >
        {activeTab === 'transcript' ? (
          /* TRANSCRIPT TAB */
          hasData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, i) => {
                  const avatarStyle = sentimentAvatarStyle(record.sentiment);
                  const initials = record.speaker
                    ? record.speaker
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                    : '?';

                  return (
                    <div
                      key={record.id || i}
                      className="transcript-entry"
                      style={{ animation: 'fadeInUp 0.3s ease' }}
                    >
                      <div className="transcript-avatar" style={avatarStyle}>
                        {initials}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            marginBottom: 'var(--space-1)',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}
                          >
                            {record.speaker}
                          </span>
                          <span className="text-caption">{formatTime(record.timestamp)}</span>

                          {/* Sentiment badge */}
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-full)',
                              background:
                                record.sentiment === 'Positive'
                                  ? 'var(--success-muted)'
                                  : record.sentiment === 'Negative'
                                    ? 'var(--error-muted)'
                                    : 'rgba(156, 163, 175, 0.1)',
                              color:
                                record.sentiment === 'Positive'
                                  ? 'var(--success)'
                                  : record.sentiment === 'Negative'
                                    ? 'var(--error)'
                                    : 'var(--text-secondary)',
                            }}
                          >
                            {record.sentiment}
                          </span>

                          {/* Score indicator */}
                          <span
                            style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}
                          >
                            Score: {record.score}/5
                          </span>

                          {/* Timestamp tag link */}
                          {!isLive && (
                            <button
                              onClick={() => {
                                setCommentTimestamp(record.timestamp);
                                setActiveTab('comments');
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent)',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                                marginLeft: 'auto',
                              }}
                              title="Add timestamped note"
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '14px' }}
                              >
                                chat_bubble
                              </span>
                              Annotate
                            </button>
                          )}
                        </div>
                        <p className="text-body" style={{ margin: 0 }}>
                          {record.transcript}
                        </p>

                        {/* Buying signals & hesitations */}
                        {(record.buying_signals.length > 0 || record.hesitations.length > 0) && (
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 'var(--space-1)',
                              marginTop: 'var(--space-2)',
                            }}
                          >
                            {record.buying_signals.map((signal, j) => (
                              <span
                                key={`buy-${j}`}
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-full)',
                                  background: 'var(--success-muted)',
                                  color: 'var(--success)',
                                }}
                              >
                                🟢 {signal}
                              </span>
                            ))}
                            {record.hesitations.map((h, j) => (
                              <span
                                key={`hes-${j}`}
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-full)',
                                  background: 'var(--warning-muted)',
                                  color: 'var(--warning)',
                                }}
                              >
                                ⚠️ {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-8) 0',
                    color: 'var(--text-muted)',
                  }}
                >
                  <p>No transcript segments match your search criteria.</p>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-8) 0',
                color: 'var(--text-muted)',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 48,
                  display: 'block',
                  marginBottom: 'var(--space-3)',
                  opacity: 0.4,
                }}
              >
                mic
              </span>
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
                {status === 'connecting'
                  ? 'Connecting to backend...'
                  : status === 'connected'
                    ? 'Listening for speech...'
                    : 'Waiting for connection'}
              </p>
              <p className="text-caption">
                Live transcript will appear here as the conversation progresses.
              </p>
            </div>
          )
        ) : (
          /* COMMENTS TAB */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)',
              height: '100%',
            }}
          >
            {/* Comment Form */}
            <form
              onSubmit={handlePostComment}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                background: 'var(--bg-elevated)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span className="text-section-heading" style={{ fontSize: '13px', margin: 0 }}>
                  Add Review Note
                </span>
                {commentTimestamp !== null && (
                  <span
                    style={{
                      fontSize: '11px',
                      background: 'var(--accent-muted)',
                      color: 'var(--accent)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Linked to segment {formatTime(commentTimestamp)}
                    <button
                      type="button"
                      onClick={() => setCommentTimestamp(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent)',
                        cursor: 'pointer',
                        display: 'flex',
                        padding: 0,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                        close
                      </span>
                    </button>
                  </span>
                )}
              </div>
              <textarea
                placeholder="Write a feedback note for the team..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  background: 'var(--bg-root)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '6px 16px', fontSize: '12px' }}
                  disabled={!newCommentText.trim()}
                >
                  Post Note
                </button>
              </div>
            </form>

            {/* List of comments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {comments.length > 0 ? (
                comments.map((comment: any) => (
                  <div
                    key={comment.id}
                    style={{
                      display: 'flex',
                      gap: 'var(--space-3)',
                      animation: 'fadeInUp 0.3s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '1px solid var(--border-default)',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={
                          comment.author?.avatarUrl ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                        }
                        alt={comment.author?.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: 'var(--bg-elevated)',
                        padding: 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 'var(--space-1)',
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>
                          {comment.author?.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {comment.timestamp !== null && (
                            <span
                              style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}
                            >
                              @{formatTime(comment.timestamp)}
                            </span>
                          )}
                          <span className="text-caption" style={{ fontSize: '11px' }}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p
                        className="text-body"
                        style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)' }}
                      >
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-6) 0',
                    color: 'var(--text-muted)',
                  }}
                >
                  <p>No comments or feedback notes have been left yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
