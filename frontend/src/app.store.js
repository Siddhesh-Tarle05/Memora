import { configureStore } from "@reduxjs/toolkit";
import authReducer from './features/auth/auth.slice';
import notesReducer from './features/Dashboard/notes.slice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: notesReducer,
  },
});

export default store;