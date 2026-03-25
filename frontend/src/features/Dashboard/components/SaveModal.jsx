import React, { useState } from 'react';
import '../styles/SaveModal.scss';


const SaveModal = ({ onClose, onSave, isSaving }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('URL is required');
      return;
    }
    setError('');
    try {
      await onSave({ url: url.trim(), title: title.trim() || undefined });
      onClose();
    } catch {
      setError('Failed to save note. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">✦</span>
            <h2>Save to Memora</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="modal-subtitle">
          Paste a link — we'll detect the type automatically.
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>URL *</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or article link..."
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Auto-detected if left empty"
            />
          </div>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-types">
            <span className="type-hint article-hint">Article</span>
            <span className="type-hint video-hint">YouTube</span>
            <span className="type-hint tweet-hint">Tweet</span>
            <span className="type-hint image-hint">Image</span>
            <span className="type-hint pdf-hint">PDF</span>
          </div>

          <button type="submit" className="save-btn" disabled={isSaving}>
            {isSaving ? (
              <span className="spinner-row">
                <span className="spinner" /> Saving...
              </span>
            ) : (
              '✦ Save Note'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SaveModal;
