import { useDispatch, useSelector } from 'react-redux';
import { getAllNotes, saveNote, deleteNote, searchNotes } from '../services/notes.api';
import { setNotes, addNote, removeNote, setStatus, setError, setFilter, setSearchQuery } from '../notes.slice';

export function useNotes() {
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.notes.notes);
  const status = useSelector((state) => state.notes.status);
  const error = useSelector((state) => state.notes.error);
  const filter = useSelector((state) => state.notes.filter);
  const searchQuery = useSelector((state) => state.notes.searchQuery);

  async function fetchNotes() {
    try {
      dispatch(setStatus('loading'));
      const data = await getAllNotes();
      dispatch(setNotes(data.notes));
      dispatch(setStatus('succeeded'));
    } catch (err) {
      dispatch(setError(err.response?.data?.error || 'Failed to fetch notes'));
      dispatch(setStatus('failed'));
    }
  }

  async function handleSaveNote(noteData) {
    try {
      dispatch(setStatus('saving'));
      await saveNote(noteData);
      // Re-fetch to get the newly created note with its DB id
      await fetchNotes();
    } catch (err) {
      dispatch(setError(err.response?.data?.error || 'Failed to save note'));
      dispatch(setStatus('failed'));
      throw err;
    }
  }

  async function handleDeleteNote(id) {
    try {
      await deleteNote(id);
      dispatch(removeNote(id));
    } catch (err) {
      dispatch(setError(err.response?.data?.error || 'Failed to delete note'));
    }
  }

  async function handleSearch(query) {
    dispatch(setSearchQuery(query));
  }

  function handleFilterChange(newFilter) {
    dispatch(setFilter(newFilter));
  }

  // Compute filtered notes client-side
  const filteredNotes = notes.filter((note) => {
    const matchesFilter = filter === 'all' || note.type === filter;
    const matchesSearch =
      !searchQuery ||
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return {
    notes,
    filteredNotes,
    status,
    error,
    filter,
    searchQuery,
    fetchNotes,
    handleSaveNote,
    handleDeleteNote,
    handleSearch,
    handleFilterChange,
  };
}
