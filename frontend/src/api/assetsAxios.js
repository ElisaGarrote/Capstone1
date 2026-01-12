import axios from "axios";
import { ACCESS_TOKEN } from "../constants";

const gatewayUrl = import.meta.env.VITE_API_GATEWAY_URL || "";
const assetsBase = import.meta.env.VITE_ASSETS_API_URL || `${gatewayUrl.replace(/\/$/,"")}/api/assets/`;

const assetsAxios = axios.create({
  baseURL: assetsBase,
  timeout: 10000,
});

assetsAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

assetsAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[Assets API Error]", error.response || error.message);
    return Promise.reject(error);
  }
);

export default assetsAxios;
