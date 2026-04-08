import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://76.13.226.20',
    withCredentials: true, // Envia cookies HttpOnly automaticamente
});
