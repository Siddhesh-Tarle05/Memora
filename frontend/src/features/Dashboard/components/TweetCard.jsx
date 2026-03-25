import React from 'react';
import HighlightButton from './HighlightButton';
import '../styles/TweetCard.scss';


const TweetCard = ({ note }) => {
  const { title, text, tags = [], url } = note;
  const tweetText = text || title || 'Tweet content';

  return (
    <div className="tweet-card" onClick={() => url && window.open(url, '_blank')}>
      <HighlightButton noteId={note._id} initialIsHighlight={note.isHighlight} />
      <div className="card-header">
        <span className="type-badge tweet">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          TWEET
        </span>
        <span className="smart-tag">⚡ SMART TAGGED</span>
      </div>
      <p className="tweet-text">"{tweetText}"</p>
      <div className="tweet-author">
        <div className="author-avatar">
          {title ? title[0].toUpperCase() : 'T'}
        </div>
        <span className="author-name">{title || 'Twitter User'}</span>
      </div>
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

export default TweetCard;
