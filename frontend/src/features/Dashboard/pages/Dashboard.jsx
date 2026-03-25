import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { useNotes } from '../hooks/useNotes';
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

  // Fetch notes on mount — user is guaranteed non-null by PrivateRoute
  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSave = async (noteData) => {
    setIsSaving(true);
    try {
      await handleSaveNote(noteData);
      setShowModal(false);
    } finally {
      setIsSaving(false);
    }
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
