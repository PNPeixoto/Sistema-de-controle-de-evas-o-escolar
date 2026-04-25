import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : undefined);

// Production must define VITE_API_URL with a valid HTTPS domain.
if (!apiBaseURL) {
    throw new Error('VITE_API_URL must be configured for production with a valid HTTPS domain.');
}

export const api = axios.create({
    baseURL: apiBaseURL,
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});
