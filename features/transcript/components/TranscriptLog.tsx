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

  const sentimentAvatarClass = (sentiment: string): string => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'transcript-avatar--positive';
      case 'negative':
        return 'transcript-avatar--negative';
      default:
        return 'transcript-avatar--neutral';
    }
  };

  return (
    <section className="card-flush">
      {/* Header bar */}
      <div className="transcript-log-header">
        <div className="transcript-log-header-left">
          {/* Main Tab Switcher */}
          <div className="transcript-log-tabs">
            <button
              onClick={() => setActiveTab('transcript')}
              className={`transcript-log-tab ${activeTab === 'transcript' ? 'is-active' : ''}`}
            >
              Transcript
            </button>
            {!isLive && (
              <button
                onClick={() => setActiveTab('comments')}
                className={`transcript-log-tab transcript-log-tab has-count ${activeTab === 'comments' ? 'is-active' : ''}`}
              >
                Comments
                {comments.length > 0 && (
                  <span className="transcript-log-count">{comments.length}</span>
                )}
              </button>
            )}
          </div>

          {status === 'connected' && <span className="transcript-live-dot" />}
        </div>

        {/* Filters and search */}
        {activeTab === 'transcript' && (
          <div className="transcript-log-filters">
            <div className="search-input transcript-search-input">
              <span className="material-symbols-outlined">search</span>
              <input
                placeholder="Search transcript..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-tabs">
              <button
                onClick={() => setSpeakerFilter('All')}
                className={`filter-tab transcript-filter-tab ${speakerFilter === 'All' ? 'active' : ''}`}
              >
                All
              </button>
              {speakers.map((speaker) => (
                <button
                  key={speaker}
                  onClick={() => setSpeakerFilter(speaker)}
                  className={`filter-tab transcript-filter-tab ${speakerFilter === speaker ? 'active' : ''}`}
                >
                  {speaker}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="custom-scrollbar transcript-log-scroll">
        {activeTab === 'transcript' ? (
          /* TRANSCRIPT TAB */
          hasData ? (
            <div className="transcript-list">
              {filteredRecords.length > 0 ? (
                [...filteredRecords].reverse().map((record, i) => {
                  const avatarClass = sentimentAvatarClass(record.sentiment);
                  const initials = record.speaker
                    ? record.speaker
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                    : '?';

                  return (
                    <div
                      key={record.id || `${filteredRecords.length - 1 - i}`}
                      className="transcript-entry transcript-entry-animate"
                    >
                      <div className={`transcript-avatar ${avatarClass}`}>{initials}</div>
                      <div className="transcript-entry-body">
                        <div className="transcript-entry-meta">
                          <span className="transcript-speaker">{record.speaker}</span>
                          <span className="text-caption">{formatTime(record.timestamp)}</span>

                          {/* Sentiment badge */}
                          <span
                            className={`transcript-sentiment-badge ${
                              record.sentiment === 'Positive'
                                ? 'transcript-sentiment-badge--positive'
                                : record.sentiment === 'Negative'
                                  ? 'transcript-sentiment-badge--negative'
                                  : 'transcript-sentiment-badge--neutral'
                            }`}
                          >
                            {record.sentiment}
                          </span>

                          {/* Score indicator */}
                          <span className="transcript-score">Score: {record.score}/5</span>

                          {/* Timestamp tag link */}
                          {!isLive && (
                            <button
                              onClick={() => {
                                setCommentTimestamp(record.timestamp);
                                setActiveTab('comments');
                              }}
                              className="transcript-annotate-btn"
                              title="Add timestamped note"
                            >
                              <span className="material-symbols-outlined transcript-annotate-icon">
                                chat_bubble
                              </span>
                              Annotate
                            </button>
                          )}
                        </div>
                        <p className="text-body transcript-transcript-text">{record.transcript}</p>

                        {/* Buying signals & hesitations */}
                        {(record.buying_signals.length > 0 || record.hesitations.length > 0) && (
                          <div className="transcript-signals">
                            {record.buying_signals.map((signal, j) => (
                              <span
                                key={`buy-${j}`}
                                className="transcript-signal-chip transcript-signal-chip--positive"
                              >
                                🟢 {signal}
                              </span>
                            ))}
                            {record.hesitations.map((h, j) => (
                              <span
                                key={`hes-${j}`}
                                className="transcript-signal-chip transcript-signal-chip--warning"
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
                <div className="transcript-empty-state">
                  <p>No transcript segments match your search criteria.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="transcript-empty-state">
              <span className="material-symbols-outlined transcript-empty-state-icon">mic</span>
              <p className="transcript-empty-state-title">
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
          <div className="transcript-comments-stack">
            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="transcript-comment-form">
              <div className="transcript-comment-form-header">
                <span className="text-section-heading transcript-comment-heading">
                  Add Review Note
                </span>
                {commentTimestamp !== null && (
                  <span className="transcript-comment-link">
                    Linked to segment {formatTime(commentTimestamp)}
                    <button type="button" onClick={() => setCommentTimestamp(null)}>
                      <span className="material-symbols-outlined transcript-comment-link-icon">
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
                className="transcript-comment-textarea"
              />
              <div className="transcript-comment-actions">
                <button
                  type="submit"
                  className="btn btn-primary transcript-comment-submit"
                  disabled={!newCommentText.trim()}
                >
                  Post Note
                </button>
              </div>
            </form>

            {/* List of comments */}
            <div className="transcript-comment-list">
              {comments.length > 0 ? (
                comments.map((comment: any) => (
                  <div key={comment.id} className="transcript-comment-entry">
                    <div className="transcript-comment-avatar">
                      <img
                        src={
                          comment.author?.avatarUrl ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                        }
                        alt={comment.author?.name}
                        className="transcript-comment-avatar-img"
                      />
                    </div>
                    <div className="transcript-comment-card">
                      <div className="transcript-comment-card-header">
                        <span className="transcript-comment-author">{comment.author?.name}</span>
                        <div className="d-flex align-center gap-8px">
                          {comment.timestamp !== null && (
                            <span className="transcript-comment-link-time">
                              @{formatTime(comment.timestamp)}
                            </span>
                          )}
                          <span className="text-caption transcript-comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-body transcript-comment-content">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="transcript-comment-empty">
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
