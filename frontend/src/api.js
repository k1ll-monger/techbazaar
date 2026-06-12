import axios from 'axios';

const api = axios.create({
    baseURL: 'https://techbazaar-backend-webservice.onrender.com/api',
    withCredentials: true
});

export default api;