import axios from "axios";

const baseURL = import.meta.env.VITE_INTEGRATION_TICKET_TRACKING_API_URL || "http://165.22.247.50:1001/";

console.log("[Ticket Tracking] Base URL:", baseURL);

const ticketTrackingAxios = axios.create({
  baseURL: baseURL,
  timeout: 10000,
});

ticketTrackingAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[Ticket Tracking API Error]", error.response || error.message);
    return Promise.reject(error);
  }
);

export default ticketTrackingAxios;
