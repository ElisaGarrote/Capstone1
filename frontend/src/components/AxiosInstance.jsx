import axios from 'axios';

const baseUrl = 'http://127.0.0.1:8000/'

const axiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
         accept: 'application/json'
    },
})

export default axiosInstance;