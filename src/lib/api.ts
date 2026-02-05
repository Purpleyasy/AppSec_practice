// API client wrapper - centralized headers and 401 handling
import { getToken, clearToken } from './auth';

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    // Unauthorized - clear session and redirect to login
    clearToken();
    window.location.href = '/login';
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text || response.statusText);
  }

  return response.json();
}

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const token = getToken();
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const token = getToken();
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async put<T>(path: string, body?: unknown): Promise<T> {
    const token = getToken();
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string): Promise<T> {
    const token = getToken();
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<T>(response);
  },
};
