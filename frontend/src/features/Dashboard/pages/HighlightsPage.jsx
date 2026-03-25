import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getHighlightedNotes } from '../services/notes.api';
import NoteCardFactory from '../components/NoteCardFactory';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SaveModal from '../components/SaveModal';

// Reusing Dashboard styles for layout consistency
import '../styles/Dashboard.scss';

const HighlightsPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('loading');
  
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadHighlights = async () => {
    setStatus('loading');
    try {
      const data = await getHighlightedNotes();
      setNotes(data.notes || []);
      setStatus('succeeded');
    } catch (err) {
      console.error(err);
      setStatus('failed');
    }
  };

  useEffect(() => {
    loadHighlights();
  }, []);

  const handleSave = async (noteData) => {
    if (noteData?._pdfUploaded) {
      setShowModal(false);
      loadHighlights();
      return;
    }
    // For standard URL saves, we just close the modal.
    // Assuming the main dashboard handles save. 
    // Ideally we would trigger a save here too.
    setShowModal(false);
  };

  return (
    <div className="dashboard-root">
      <Sidebar
        onSaveClick={() => setShowModal(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main">
        <Navbar
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="dashboard-content">
          <div className="content-header">
            <h1>Highlights</h1>
            <p>Your favorite and most important insights, starred for quick access.</p>
          </div>

          {status === 'loading' && (
            <div className="notes-loading">
              <div className="loading-spinner" />
              <p>Loading highlights...</p>
            </div>
          )}

          {status === 'succeeded' && notes.length === 0 && (
            <div className="notes-empty">
              <div className="empty-icon">⭐</div>
              <h3>No highlights yet</h3>
              <p>Click the star icon on any note card to add it to your highlights.</p>
            </div>
          )}

          {notes.length > 0 && (
            <div className="notes-grid">
              {notes.map((note) => (
                <NoteCardFactory key={note._id} note={note} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <SaveModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          isSaving={false}
        />
      )}
    </div>
  );
};

export default HighlightsPage;
