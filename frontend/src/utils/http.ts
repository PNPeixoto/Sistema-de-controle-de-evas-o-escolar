import { isAxiosError } from 'axios';

interface ApiErrorResponse {
    message?: string;
}

export interface PageResponse<T> {
    content?: T[];
    [key: string]: unknown;
}

export type CollectionResponse<T> = T[] | PageResponse<T>;

export function getApiErrorMessage(error: unknown, fallback: string) {
    if (isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message || fallback;
    }
    return fallback;
}

export function normalizeCollection<T>(data: CollectionResponse<T>): T[] {
    if (Array.isArray(data)) {
        return data;
    }
    return Array.isArray(data.content) ? data.content : [];
}
