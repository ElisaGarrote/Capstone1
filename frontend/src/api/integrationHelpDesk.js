import axios from "axios";

const helpDeskAxios = axios.create({
  baseURL: import.meta.env.VITE_CONTEXTS_API_URL,
  timeout: 10000,
});

helpDeskAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[Help Desk API Error]", error.response || error.message);
    return Promise.reject(error);
  }
);

export default helpDeskAxios;
