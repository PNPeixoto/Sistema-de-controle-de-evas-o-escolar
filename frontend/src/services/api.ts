import axios from 'axios';

// Token em sessionStorage (sobrevive F5, morre ao fechar aba)
export function setToken(token: string | null) {
    if (token) {
        sessionStorage.setItem('pnp_auth', token);
    } else {
        sessionStorage.removeItem('pnp_auth');
    }
}

export function getToken(): string | null {
    return sessionStorage.getItem('pnp_auth');
}

export function clearToken() {
    sessionStorage.removeItem('pnp_auth');
}

export const api = axios.create({
    baseURL: 'https://76.13.226.20',
    withCredentials: true,
});

// Injeta token em toda requisição
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
 