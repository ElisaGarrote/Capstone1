import axios from 'axios';

const baseUrl = 'https://authentication-service-production-d804.up.railway.app/'

const axiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
         accept: 'application/json'
    },
})

export default axiosInstance;