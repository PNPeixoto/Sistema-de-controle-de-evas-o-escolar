import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
    baseURL: apiBaseURL,
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});