import axios from 'axios';

// O segredo está aqui: o "export const api" permite usar import { api } nos outros arquivos
export const api = axios.create({
    baseURL: 'http://localhost:8080', // Confirme se essa é a porta do seu Spring Boot
});

// Interceptor: Injeta o Token JWT em TODAS as requisições automaticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});