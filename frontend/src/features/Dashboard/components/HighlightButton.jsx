import React, { useState } from 'react';
import { toggleNoteHighlight } from '../services/notes.api';
import '../styles/HighlightButton.scss';

const HighlightButton = ({ noteId, initialIsHighlight }) => {
  const [isHighlight, setIsHighlight] = useState(initialIsHighlight || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation(); // Prevent card clicks
    e.preventDefault();
    if (isLoading) return;

    // Optimistic UI update
    setIsHighlight(!isHighlight);
    setIsLoading(true);

    try {
      const res = await toggleNoteHighlight(noteId);
      setIsHighlight(res.isHighlight);
    } catch (err) {
      console.error('Failed to toggle highlight', err);
      // Revert on failure
      setIsHighlight(isHighlight);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`highlight-btn ${isHighlight ? 'active' : ''}`}
      onClick={handleToggle}
      title={isHighlight ? "Remove from Highlights" : "Add to Highlights"}
      disabled={isLoading}
      aria-label="Toggle highlight"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={isHighlight ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
};

export default HighlightButton;
