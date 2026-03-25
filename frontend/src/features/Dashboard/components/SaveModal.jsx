import React, { useState, useRef } from 'react';
import { uploadPdfNote } from '../services/notes.api';
import '../styles/SaveModal.scss';

const SaveModal = ({ onClose, onSave, isSaving }) => {
  const [mode, setMode] = useState('url'); // 'url' | 'pdf'

  // URL mode state
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  // PDF mode state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // ------ URL submit ------
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) { setError('URL is required'); return; }
    setError('');
    try {
      await onSave({ url: url.trim(), title: title.trim() || undefined });
      onClose();
    } catch {
      setError('Failed to save note. Please try again.');
    }
  };

  // ------ PDF submit ------
  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) { setError('Please select a PDF file'); return; }
    setError('');
    setUploadProgress(true);
    try {
      await uploadPdfNote(pdfFile, pdfTitle.trim() || undefined);
      onClose();
      // Trigger a notes refresh by calling onSave with a sentinel
      if (onSave) onSave({ _pdfUploaded: true });
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to upload PDF. Please try again.');
    } finally {
      setUploadProgress(false);
    }
  };

  // ------ Drag & drop ------
  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError('');
    } else {
      setError('Only PDF files are allowed');
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setPdfFile(file); setError(''); }
  };

  const isLoading = isSaving || uploadProgress;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">✦</span>
            <h2>Save to Memora</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Mode tab toggle */}
        <div className="modal-tabs">
          <button
            className={`modal-tab${mode === 'url' ? ' active' : ''}`}
            onClick={() => { setMode('url'); setError(''); }}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            URL / Link
          </button>
          <button
            className={`modal-tab${mode === 'pdf' ? ' active' : ''}`}
            onClick={() => { setMode('pdf'); setError(''); }}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Upload PDF
          </button>
        </div>

        {/* ---- URL MODE ---- */}
        {mode === 'url' && (
          <form onSubmit={handleUrlSubmit} className="modal-form">
            <p className="modal-subtitle">Paste a link — we'll detect the type automatically.</p>
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
              <span className="type-hint pdf-hint">PDF Link</span>
            </div>
            <button type="submit" className="save-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="spinner-row"><span className="spinner" /> Saving...</span>
              ) : '✦ Save Note'}
            </button>
          </form>
        )}

        {/* ---- PDF MODE ---- */}
        {mode === 'pdf' && (
          <form onSubmit={handlePdfSubmit} className="modal-form">
            <p className="modal-subtitle">Upload a PDF — we'll extract text, generate tags, and make it searchable.</p>

            {/* Drop zone */}
            <div
              className={`pdf-dropzone${dragging ? ' dragging' : ''}${pdfFile ? ' has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {pdfFile ? (
                <div className="pdf-file-info">
                  <span className="pdf-file-icon">📄</span>
                  <div>
                    <p className="pdf-file-name">{pdfFile.name}</p>
                    <p className="pdf-file-size">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    className="pdf-remove-btn"
                    onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                  >✕</button>
                </div>
              ) : (
                <div className="pdf-dropzone-placeholder">
                  <span className="pdf-drop-icon">📋</span>
                  <p><strong>Drop PDF here</strong> or click to browse</p>
                  <p className="pdf-drop-hint">Max 20 MB · PDF files only</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Title (optional)</label>
              <input
                type="text"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                placeholder="Auto-extracted from PDF if left empty"
              />
            </div>

            {error && <p className="modal-error">{error}</p>}

            <button type="submit" className="save-btn" disabled={isLoading || !pdfFile}>
              {isLoading ? (
                <span className="spinner-row"><span className="spinner" /> Uploading & Processing...</span>
              ) : '📄 Upload PDF'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SaveModal;
