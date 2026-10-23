import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiSuccessResponse } from '../types';
import { API_BASE_URL } from '../config/env';

/** An API error, with the HTTP status when the server answered. */
export class ApiRequestError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

// A 401 from these means bad credentials, not an expired login
const NO_REFRESH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];


class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: renew an expired login once, then normalise errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
        if (
          error.response?.status === 401 &&
          original &&
          !original._retried &&
          !NO_REFRESH_ENDPOINTS.some((path) => original.url?.includes(path))
        ) {
          original._retried = true;
          const renewed = await this.renewToken();
          if (renewed) return this.client.request(original);
        }

        // Validator errors carry field-level detail in data.errors — surface the
        // first one instead of the generic top-level "Validation failed" message.
        const fieldErrors = error.response?.data?.data?.errors;
        const detailMessage = Array.isArray(fieldErrors) && fieldErrors.length > 0
          ? fieldErrors[0].message
          : undefined;
        const message =
          detailMessage || error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject(new ApiRequestError(message, error.response?.status));
      }
    );
  }

  // Logins expire server-side and the web renews them with a cookie, which the
  // app doesn't have — so it sends its current token to /refresh instead.
  // Concurrent 401s share one renewal.
  private renewing: Promise<boolean> | null = null;

  private renewToken(): Promise<boolean> {
    this.renewing ??= (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return false;
        const response = await this.client.post<ApiSuccessResponse<{ token: string }>>(
          '/api/auth/refresh',
          undefined,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newToken = response.data.data?.token;
        if (!newToken) return false;
        await AsyncStorage.setItem('token', newToken);
        return true;
      } catch {
        return false;
      } finally {
        this.renewing = null;
      }
    })();
    return this.renewing;
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response = await this.client.get<ApiSuccessResponse<T>>(endpoint, config);
    return response.data;
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response = await this.client.post<ApiSuccessResponse<T>>(endpoint, data, config);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response = await this.client.put<ApiSuccessResponse<T>>(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
    const response = await this.client.delete<ApiSuccessResponse<T>>(endpoint, config);
    return response.data;
  }
}

export const api = new ApiClient(API_BASE_URL);
