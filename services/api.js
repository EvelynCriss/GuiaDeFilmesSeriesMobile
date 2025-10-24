// services/api.js
import axios from 'axios'; // <--- Importe o Axios

// <--- MUDANÇA: Atualizada a baseURL para a OMDb API
const api = axios.create({
  baseURL: 'https://www.omdbapi.com/', 
});

export default api; // <--- Exporte a instância configurada do Axios