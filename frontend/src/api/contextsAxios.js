import axios from "axios";

// Use fallback for Railway deployments where env vars may not be set at build time
const contextsAxios = axios.create({
  baseURL: import.meta.env.VITE_CONTEXTS_API_URL || 
    (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/contexts/` : '') || 
    '/api/contexts/',
  timeout: 30000,
});

contextsAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[Contexts API Error]", error.response || error.message);
    return Promise.reject(error);
  }
);

export default contextsAxios;
