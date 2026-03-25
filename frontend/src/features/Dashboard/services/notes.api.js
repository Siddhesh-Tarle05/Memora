import axios from 'axios';

const Api = axios.create({
  baseURL: 'http://localhost:3000/api/data',
  withCredentials: true,
});

export async function getAllNotes() {
  const response = await Api.get('/getnotes');
  return response.data;
}

export async function saveNote({ url, title, text }) {
  const response = await Api.post('/extract', { url, title, text });
  return response.data;
}

export async function searchNotes(query) {
  const response = await Api.post('/search', { query });
  return response.data;
}

export async function deleteNote(id) {
  const response = await Api.delete(`/delete/${id}`);
  return response.data;
}

export async function getAllCollections() {
  const response = await Api.get('/getcollections');
  return response.data;
}

export async function getGraphData() {
  const response = await Api.get('/getgraph');
  return response.data;
}

export async function uploadPdfNote(file, title) {
  const formData = new FormData();
  formData.append('pdf', file);
  if (title) formData.append('title', title);
  const response = await Api.post('/uploadpdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function toggleNoteHighlight(id) {
  const response = await Api.patch(`/notes/${id}/highlight`);
  return response.data;
}

export async function getHighlightedNotes() {
  const response = await Api.get('/highlights');
  return response.data;
}

export async function getResurfacedNotes() {
  const response = await Api.get('/resurface');
  return response.data;
}
