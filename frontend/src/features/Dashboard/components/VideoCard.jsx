import React from 'react';
import HighlightButton from './HighlightButton';
import '../styles/VideoCard.scss';


const VideoCard = ({ note }) => {
  const { title, url, tags = [] } = note;
  const displayDate = note._id
    ? new Date(parseInt(note._id.substring(0, 8), 16) * 1000).toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '';

  // Extract YouTube video ID for thumbnail
  const getYtId = (u = '') => {
    const m = u.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  };
  const ytId = getYtId(url);
  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

  return (
    <div className="video-card" onClick={() => url && window.open(url, '_blank')}>
      <HighlightButton noteId={note._id} initialIsHighlight={note.isHighlight} />
      <div className="card-header">
        <span className="type-badge video">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
          VIDEO
        </span>
        <span className="date">{displayDate}</span>
      </div>
      <div className="thumbnail-wrap">
        {thumb ? (
          <img src={thumb} alt={title} className="thumbnail" />
        ) : (
          <div className="thumbnail-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
        )}
        <div className="play-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
      </div>
      <h3 className="title">{title || 'YouTube Video'}</h3>
      <div className="card-footer">
        <div className="tags">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
