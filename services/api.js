// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com', // Base URL da nossa API de exemplo
});

// Adiciona métodos para POST, PUT e DELETE
export const createPost = (data) => api.post('/posts', data); // POST para criar
export const updatePost = (id, data) => api.put(`/posts/${id}`, data); // PUT para atualizar
export const deletePost = (id) => api.delete(`/posts/${id}`); // DELETE para excluir

export default api; // Mantém a exportação padrão para requisições GET