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
