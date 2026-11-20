const RAW_BASE_URL = import.meta.env.VITE_API_URL ?? '';
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export class HttpError extends Error {
    readonly status: number;
    readonly statusText: string;

    constructor(status: number, statusText: string, message?: string) {
        super(message ?? `HTTP ${status}: ${statusText}`);
        this.name = 'HttpError';
        this.status = status;
        this.statusText = statusText;
    }
}

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: HeadersInit;
    signal?: AbortSignal;
    params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
): string {
    if (!BASE_URL) {
        throw new Error('VITE_API_URL is not configured in environment variables');
    }

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${BASE_URL}${normalizedEndpoint}`);

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) {
                url.searchParams.set(key, String(value));
            }
        }
    }

    return url.toString();
}

async function parseErrorMessage(response: Response): Promise<string | undefined> {
    try {
        const data: unknown = await response.json();
        if (typeof data === 'object' && data !== null && 'message' in data) {
            const msg = (data as { message: unknown }).message;
            if (typeof msg === 'string' && msg.trim().length > 0) {
                return msg;
            }
        }
    } catch {
        // Ignore JSON parse errors for non-JSON error responses
    }
    return undefined;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers, signal, params } = options;
    const url = buildUrl(endpoint, params);

    const requestHeaders = new Headers(headers);
    if (body !== undefined && !requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
    });

    if (!response.ok) {
        const errorMessage = await parseErrorMessage(response);
        throw new HttpError(response.status, response.statusText, errorMessage);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export const httpClient = {
    get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
        return request<T>(endpoint, { ...options, method: 'GET' });
    },

    post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
        return request<T>(endpoint, { ...options, method: 'POST', body });
    },

    put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
        return request<T>(endpoint, { ...options, method: 'PUT', body });
    },

    patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
        return request<T>(endpoint, { ...options, method: 'PATCH', body });
    },

    delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
        return request<T>(endpoint, { ...options, method: 'DELETE' });
    },
};
