import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { useNotes } from '../hooks/useNotes';
import { getResurfacedNotes } from '../services/notes.api';
import NoteCardFactory from '../components/NoteCardFactory';
import FilterBar from '../components/FilterBar';
import SaveModal from '../components/SaveModal';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

import '../styles/Dashboard.scss';

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);

  const {
    filteredNotes,
    status,
    filter,
    searchQuery,
    fetchNotes,
    handleSaveNote,
    handleFilterChange,
    handleSearch,
  } = useNotes();

  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resurfaced, setResurfaced] = useState([]);
  const [hideMemoryLane, setHideMemoryLane] = useState(false);

  // Fetch notes on mount — user is guaranteed non-null by PrivateRoute
  useEffect(() => {
    fetchNotes();
    // Also fetch resurfaced notes for Memory Lane
    getResurfacedNotes().then(res => setResurfaced(res.notes || [])).catch(console.error);
  }, []);

  const handleSave = async (noteData) => {
    // PDF uploads are handled entirely in SaveModal — just refresh notes
    if (noteData?._pdfUploaded) {
      setShowModal(false);
      fetchNotes();
      return;
    }
    setIsSaving(true);
    try {
      await handleSaveNote(noteData);
      setShowModal(false);
      fetchNotes();
    } finally {
      setIsSaving(false);
    }
  };

  const getTimeAgoText = (objectId) => {
    if (!objectId) return '';
    const date = new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return `Today you saved this`;
    if (diffDays === 1) return `1 day ago you saved this`;
    if (diffDays < 30) return `${diffDays} days ago you saved this`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago you saved this`;
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago you saved this`;
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
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="dashboard-content">
          <div className="content-header">
            <h1>Curated Collection</h1>
            <p>Your intellectual garden, where every piece of information is nurtured and interconnected.</p>
          </div>

          {!searchQuery && filter === 'all' && resurfaced.length > 0 && !hideMemoryLane && (
            <div className="memory-lane" style={{ position: 'relative' }}>
              <button 
                onClick={() => setHideMemoryLane(true)}
                style={{
                  position: 'absolute', top: '16px', right: '16px', 
                  background: 'none', border: 'none', cursor: 'pointer', 
                  color: '#9ca3af', padding: '4px'
                }}
                title="Hide Resurfaced Notes"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div className="memory-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9"/>
                </svg>
                <h2>Rediscover</h2>
              </div>
              <div className="resurfaced-grid">
                {resurfaced.map((note) => (
                  <div key={note._id} className="resurface-item" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <div className="resurface-time-label" style={{
                      fontSize: '13px', 
                      fontWeight: '600', 
                      color: '#7c3aed',
                      background: 'rgba(124, 58, 237, 0.08)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      display: 'inline-block',
                      alignSelf: 'flex-start'
                    }}>
                      ⌛ {getTimeAgoText(note._id)}
                    </div>
                    <NoteCardFactory note={note} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <FilterBar activeFilter={filter} onFilterChange={handleFilterChange} />

          {status === 'loading' && (
            <div className="notes-loading">
              <div className="loading-spinner" />
              <p>Loading your notes...</p>
            </div>
          )}

          {status !== 'loading' && filteredNotes.length === 0 && (
            <div className="notes-empty">
              <div className="empty-icon">✦</div>
              <h3>{filter === 'all' ? 'No notes yet' : `No ${filter} notes`}</h3>
              <p>
                {filter === 'all'
                  ? 'Click "Save Item" in the sidebar to add your first note.'
                  : 'Try saving a link that matches this type.'}
              </p>
            </div>
          )}

          {filteredNotes.length > 0 && (
            <div className="notes-grid">
              {filteredNotes.map((note) => (
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
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default Dashboard;
