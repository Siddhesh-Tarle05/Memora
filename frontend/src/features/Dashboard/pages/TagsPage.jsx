import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllNotes } from '../services/notes.api';
import NoteCardFactory from '../components/NoteCardFactory';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SaveModal from '../components/SaveModal';
import { useNotes } from '../hooks/useNotes';
import '../styles/TagsPage.scss';


const TagsPage = () => {
  const user = useSelector((s) => s.auth.user);
  const { searchQuery, handleSearch, handleSaveNote } = useNotes();

  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
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
      const data = await getAllNotes();
      setAllNotes(data.notes || []);
    } catch (e) {
      console.error('Tags load error:', e);
      setError(e?.response?.data?.error || e.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }

  // Aggregate tags with counts
  const tagMap = {};
  allNotes.forEach((note) => {
    (note.tags || []).forEach((tag) => {
      if (!tagMap[tag]) tagMap[tag] = { tag, count: 0, notes: [] };
      tagMap[tag].count += 1;
      tagMap[tag].notes.push(note);
    });
  });
  const tags = Object.values(tagMap).sort((a, b) => b.count - a.count);
  const tagNotes = selectedTag ? tagMap[selectedTag]?.notes || [] : [];

  const handleSave = async (data) => {
    setIsSaving(true);
    try { await handleSaveNote(data); setShowModal(false); }
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

          {selectedTag ? (
            <>
              <div className="col-detail-header">
                <button className="back-btn" onClick={() => setSelectedTag(null)}>
                  ← Back to Tags
                </button>
                <h1>#{selectedTag}</h1>
                <p>{tagNotes.length} {tagNotes.length === 1 ? 'note' : 'notes'}</p>
              </div>
              <div className="notes-grid">
                {tagNotes.map((note) => (
                  <NoteCardFactory key={note._id} note={note} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="content-header">
                <h1>Tags</h1>
                <p>Browse all your notes by tag.</p>
              </div>

              {loading && (
                <div className="notes-loading">
                  <div className="loading-spinner" />
                  <p>Loading tags...</p>
                </div>
              )}

              {!loading && error && (
                <div className="notes-empty">
                  <div className="empty-icon">⚠️</div>
                  <h3>Could not load tags</h3>
                  <p>{error}</p>
                  <button onClick={load} style={{
                    marginTop: 12, padding: '8px 20px', background: '#6d28d9',
                    color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600
                  }}>Retry</button>
                </div>
              )}

              {!loading && !error && tags.length === 0 && (
                <div className="notes-empty">
                  <div className="empty-icon">🏷️</div>
                  <h3>No tags yet</h3>
                  <p>Tags are auto-generated when you save notes.</p>
                </div>
              )}

              {!loading && !error && tags.length > 0 && (
                <div className="tags-container">
                  <div className="tags-cloud">
                    {tags.map(({ tag, count }) => (
                      <button
                        key={tag}
                        className="tag-pill"
                        onClick={() => setSelectedTag(tag)}
                        style={{ '--count': Math.min(count, 10) }}
                      >
                        #{tag}
                        <span className="tag-count">{count}</span>
                      </button>
                    ))}
                  </div>

                  <div className="tags-list">
                    {tags.map(({ tag, count, notes }) => (
                      <div
                        key={tag}
                        className="tag-row"
                        onClick={() => setSelectedTag(tag)}
                      >
                        <div className="tag-row-info">
                          <span className="tag-row-name">#{tag}</span>
                          <span className="tag-row-count">{count} {count === 1 ? 'note' : 'notes'}</span>
                        </div>
                        <div className="tag-row-previews">
                          {notes.slice(0, 3).map((n) => (
                            <span key={n._id} className="tag-preview-chip">{n.title || 'Untitled'}</span>
                          ))}
                          {count > 3 && <span className="tag-preview-more">+{count - 3} more</span>}
                        </div>
                        <span className="tag-row-arrow">→</span>
                      </div>
                    ))}
                  </div>
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

export default TagsPage;
