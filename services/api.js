// services/api.js
import axios from 'axios';

// <--- MUDANÇA: Atualizada a baseURL para a TMDb API v3
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
});

export default api;