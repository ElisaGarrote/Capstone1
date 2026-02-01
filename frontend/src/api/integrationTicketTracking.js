import axios from "axios";

// Use ASSETS API as a proxy to external ticket tracking API (avoids mixed content HTTPS->HTTP issue)
const baseURL = import.meta.env.VITE_ASSETS_API_URL || "https://ams-assets.up.railway.app/";

console.log("[Ticket Tracking] Using Assets API proxy, Base URL:", baseURL);

const ticketTrackingAxios = axios.create({
  baseURL: baseURL,
  timeout: 30000,
});

ticketTrackingAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[Ticket Tracking API Error]", error.response || error.message);
    return Promise.reject(error);
  }
);

export default ticketTrackingAxios;
