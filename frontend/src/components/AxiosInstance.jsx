import axios from "axios";

// Authentication service
//const baseUrl = 'https://authentication-service-production-d804.up.railway.app/'
// Local development
// const baseUrl = "http://127.0.0.1:8001/";
const baseUrl = "http://127.0.0.1:8000/api/v1/";

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

export default axiosInstance;
