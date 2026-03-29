import axios from 'axios';

// O segredo está aqui: o "export const api" permite usar import { api } nos outros arquivos
export const api = axios.create({
    baseURL: 'https://sistema-pnp.onrender.com',
});

// Interceptor: Injeta o Token JWT em TODAS as requisições automaticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});