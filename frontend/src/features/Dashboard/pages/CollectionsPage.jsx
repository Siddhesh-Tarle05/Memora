import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllCollections, getAllNotes } from '../services/notes.api';
import NoteCardFactory from '../components/NoteCardFactory';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SaveModal from '../components/SaveModal';
import { useNotes } from '../hooks/useNotes';
import '../styles/CollectionsPage.scss';


const CollectionsPage = () => {
  const user = useSelector((s) => s.auth.user);
  const { searchQuery, handleSearch, handleSaveNote } = useNotes();

  const [collections, setCollections] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [colData, noteData] = await Promise.all([
        getAllCollections(),
        getAllNotes(),
      ]);
      setCollections(colData.collections || []);
      setAllNotes(noteData.notes || []);
    } catch (e) {
      console.error('Collections load error:', e);
      setError(e?.response?.data?.error || e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  // Get notes that belong to selected collection
  const collectionNotes = selectedCollection
    ? allNotes.filter((n) => selectedCollection.noteIds.includes(n._id))
    : [];

  const handleSave = async (data) => {
    if (data?._pdfUploaded) { setShowModal(false); load(); return; }
    setIsSaving(true);
    try { await handleSaveNote(data); setShowModal(false); load(); }
    finally { setIsSaving(false); }
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

          {selectedCollection ? (
            /* ---- Collection drill-down ---- */
            <>
              <div className="col-detail-header">
                <button className="back-btn" onClick={() => setSelectedCollection(null)}>
                  ← Back to Collections
                </button>
                <h1>{selectedCollection.name}</h1>
                <p>{selectedCollection.size} {selectedCollection.size === 1 ? 'note' : 'notes'}</p>
              </div>

              {collectionNotes.length === 0 ? (
                <div className="notes-empty">
                  <div className="empty-icon">📂</div>
                  <h3>No notes found</h3>
                  <p>The notes in this collection may have been deleted.</p>
                </div>
              ) : (
                <div className="notes-grid">
                  {collectionNotes.map((note) => (
                    <NoteCardFactory key={note._id} note={note} />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* ---- Collections grid ---- */
            <>
              <div className="content-header">
                <h1>Collections</h1>
                <p>Your notes organised into smart collections by topic.</p>
              </div>

              {loading && (
                <div className="notes-loading">
                  <div className="loading-spinner" />
                  <p>Loading collections...</p>
                </div>
              )}

              {!loading && error && (
                <div className="notes-empty">
                  <div className="empty-icon">⚠️</div>
                  <h3>Could not load collections</h3>
                  <p>{error}</p>
                  <button onClick={load} style={{
                    marginTop: 12, padding: '8px 20px', background: '#6d28d9',
                    color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600
                  }}>Retry</button>
                </div>
              )}

              {!loading && !error && collections.length === 0 && (
                <div className="notes-empty">
                  <div className="empty-icon">📚</div>
                  <h3>No collections yet</h3>
                  <p>Save some notes and collections will appear automatically.</p>
                </div>
              )}

              {!loading && !error && collections.length > 0 && (
                <div className="collections-grid">
                  {collections.map((col) => (
                    <div
                      key={col._id}
                      className="collection-card"
                      onClick={() => setSelectedCollection(col)}
                    >
                      <div className="col-icon">
                        {col.name.toLowerCase().includes('image') ? '🖼️'
                          : col.name.toLowerCase().includes('video') ? '🎬'
                          : col.name.toLowerCase().includes('frontend') ? '⚛️'
                          : col.name.toLowerCase().includes('science') ? '🔬'
                          : col.name.toLowerCase().includes('tech') ? '💻'
                          : col.name.toLowerCase().includes('general') ? '📖'
                          : '📁'}
                      </div>
                      <div className="col-info">
                        <h3 className="col-name">{col.name}</h3>
                        <p className="col-count">{col.size} {col.size === 1 ? 'note' : 'notes'}</p>
                      </div>
                      <div className="col-arrow">→</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {showModal && (
        <SaveModal onClose={() => setShowModal(false)} onSave={handleSave} isSaving={isSaving} />
      )}
    </div>
  );
};

export default CollectionsPage;
