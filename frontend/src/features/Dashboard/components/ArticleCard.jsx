import React from 'react';
import '../styles/ArticleCard.scss';


const ArticleCard = ({ note }) => {
  const { title, text, tags = [], url } = note;
  const preview = text ? text.slice(0, 220) + '...' : '';
  const displayDate = note._id
    ? new Date(parseInt(note._id.substring(0, 8), 16) * 1000).toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '';

  return (
    <div className="article-card" onClick={() => url && window.open(url, '_blank')}>
      <div className="card-header">
        <span className="type-badge article">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          ARTICLE
        </span>
        <span className="date">{displayDate}</span>
      </div>
      <h3 className="title">{title || 'Untitled'}</h3>
      <p className="summary">{preview}</p>
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

export default ArticleCard;