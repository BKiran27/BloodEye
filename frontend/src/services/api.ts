import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Since we are mocking everything with demo data if the API is down, 
// we will handle this mostly in the hooks/components or just rely on 
// interceptors, but for now we just export the instance.
export default api;
