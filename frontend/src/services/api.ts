import axios from 'axios';

// Token em memória (NÃO localStorage — mais seguro, some ao fechar aba)
let memoryToken: string | null = null;

export function setToken(token: string | null) {
    memoryToken = token;
}

export function getToken(): string | null {
    return memoryToken;
}

export function clearToken() {
    memoryToken = null;
}

export const api = axios.create({
    baseURL: 'https://76.13.226.20',
    withCredentials: true, // Tenta enviar cookie se existir
});

// Interceptor: injeta token do memory como fallback se cookie não funcionar
api.interceptors.request.use((config) => {
    if (memoryToken) {
        config.headers.Authorization = `Bearer ${memoryToken}`;
    }
    return config;
});
