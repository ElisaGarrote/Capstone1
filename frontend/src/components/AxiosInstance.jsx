import axios from "axios";

// Authentication service
// Deployed
// const baseUrl =
//   "https://authentication-service-production-d804.up.railway.app/";

// Local
const baseUrl = "http://localhost:8000/";

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

export default axiosInstance;
