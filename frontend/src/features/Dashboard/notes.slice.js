import { createSlice } from "@reduxjs/toolkit";

const notesSlice = createSlice({
  name: "notes",
  initialState: {
    notes: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
    filter: "all", // all | youtube | twitte | image | pdf | web
    searchQuery: "",
  },
  reducers: {
    setNotes: (state, action) => {
      state.notes = action.payload;
    },
    addNote: (state, action) => {
      state.notes.unshift(action.payload);
    },
    removeNote: (state, action) => {
      state.notes = state.notes.filter((n) => n._id !== action.payload);
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setNotes,
  addNote,
  removeNote,
  setFilter,
  setSearchQuery,
  setStatus,
  setError,
} = notesSlice.actions;

export default notesSlice.reducer;
