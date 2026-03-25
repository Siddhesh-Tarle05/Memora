import React from 'react';
import HighlightButton from './HighlightButton';
import '../styles/PdfCard.scss';


const PdfCard = ({ note }) => {
  const { title, text, tags = [], url } = note;
  const preview = text || '';
  const displayDate = note._id
    ? new Date(parseInt(note._id.substring(0, 8), 16) * 1000).toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '';

  return (
    <div className="pdf-card" onClick={() => url && window.open(url, '_blank')}>
      <HighlightButton noteId={note._id} initialIsHighlight={note.isHighlight} />
      <div className="card-header">
        <span className="type-badge pdf">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          PDF
        </span>
        <span className="date">{displayDate}</span>
      </div>
      <div className="pdf-icon-area">
        <div className="pdf-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span className="pdf-ext">PDF</span>
        </div>
      </div>
      <h3 className="title">{title || 'Document'}</h3>
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

export default PdfCard;
