import api from './api';

/**
 * Service for interacting with the Notes API.
 * All requests are sent to /api/v1/notes on port 5005 with Bearer token authentication.
 */

export const getNotes = async (params = {}) => {
  const response = await api.get('/notes', { params });
  return response.data;
};

export const getNoteById = async (id) => {
  const response = await api.get(`/notes/${id}`);
  return response.data;
};

export const createNote = async (noteData) => {
  const response = await api.post('/notes', noteData);
  return response.data;
};

export const updateNote = async (id, noteData) => {
  const response = await api.put(`/notes/${id}`, noteData);
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};

export default {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
};
