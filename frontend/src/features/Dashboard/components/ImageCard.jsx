import React from 'react';
import '../styles/ImageCard.scss';


const ImageCard = ({ note }) => {
  const { title, url, tags = [] } = note;
  const displayDate = note._id
    ? new Date(parseInt(note._id.substring(0, 8), 16) * 1000).toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '';

  return (
    <div className="image-card" onClick={() => url && window.open(url, '_blank')}>
      <div className="image-wrap">
        <img src={url} alt={title || 'Image'} className="note-image" />
        <div className="image-overlay">
          <span className="type-badge image">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            IMAGE
          </span>
          <span className="date">{displayDate}</span>
        </div>
      </div>
      <div className="image-footer">
        <h3 className="title">{title || 'Image'}</h3>
        <div className="tags">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;