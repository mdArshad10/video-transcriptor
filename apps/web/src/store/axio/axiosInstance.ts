import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import {
  clearAccessToken,
  clearRefreshToken,
  selectAccessToken,
  setAccessToken,
  setRefreshToken,
} from '../auth/accessTokenStore';
import type { AppDispatch, RootState } from '../store';

let store: {
  dispatch: AppDispatch;
  getState: () => RootState;
};

export const injectStore = (_store: {
  dispatch: AppDispatch;
  getState: () => RootState;
}) => {
  store = _store;
};

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshComplete = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const redirectToAuthError = () => {
  if (typeof window !== 'undefined' && window.location.pathname !== '/auth-error') {
    window.location.replace('/auth-error');
  }
};

// Returns the NEW ACCESS TOKEN (not the refresh token) so callers can
// attach it to the Authorization header when retrying failed requests.
const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .then((response) => {
        const nextAccessToken = response.data?.accessToken ?? null;
        const nextRefreshToken = response.data?.refreshToken ?? null;

        store.dispatch(setAccessToken(nextAccessToken));
        store.dispatch(setRefreshToken(nextRefreshToken));

        if (typeof window !== 'undefined') {
          if (nextAccessToken) {
            localStorage.setItem('accessToken', nextAccessToken);
          } else {
            localStorage.removeItem('accessToken');
          }
          if (nextRefreshToken) {
            localStorage.setItem('refreshToken', nextRefreshToken);
          } else {
            localStorage.removeItem('refreshToken');
          }
        }

        // Return the ACCESS TOKEN — callers use this for Bearer auth
        return nextAccessToken;
      })
      .catch(() => {
        store.dispatch(clearAccessToken());
        store.dispatch(clearRefreshToken());
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Reads the access token from Redux first; falls back to localStorage so the
// token survives page refreshes (redux-persist handles rehydration, but this
// is a safety net for the very first request before rehydration completes).
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token = selectAccessToken(store.getState());

    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('accessToken');
      if (token) {
        store.dispatch(setAccessToken(token));
      }
    }

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Whenever any API response contains tokens (e.g. login, verify-token),
// persist them to Redux + localStorage.
axiosInstance.interceptors.response.use(
  (response) => {
    const accessToken = response.data?.accessToken;
    // NOTE: only treat refreshToken field as the refresh token — do NOT fall
    // back to response.data?.token, which is ambiguous and caused a bug where
    // the access token was being stored as a refresh token.
    const refreshToken = response.data?.refreshToken;

    if (accessToken) {
      store.dispatch(setAccessToken(accessToken));
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
      }
    }

    if (refreshToken) {
      store.dispatch(setRefreshToken(refreshToken));
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }

    return response;
  },
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh
    ) {
      if (isRefreshing) {
        // Queue the request until the in-flight refresh finishes
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((nextAccessToken) => {
            if (!nextAccessToken) {
              reject(error);
              return;
            }

            originalRequest._retry = true;
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // refreshAccessToken() now returns the NEW ACCESS TOKEN
        const nextAccessToken = await refreshAccessToken();
        onRefreshComplete(nextAccessToken);

        if (!nextAccessToken) {
          redirectToAuthError();
          return Promise.reject(error);
        }

        // Retry the original request with the new ACCESS token
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        onRefreshComplete(null);
        store.dispatch(clearAccessToken());
        store.dispatch(clearRefreshToken());
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        redirectToAuthError();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (!error.response) {
      toast.error('Network error. Please check your internet connection.');
      return Promise.reject(error);
    }

    const errMsg = error.response.data?.message;
    const errorOptions = {
      classNames: {
        toast: 'bg-red-500 text-white',
      },
    };

    switch (status) {
      case 400:
        toast.error(errMsg ?? 'Bad Request. Please check your input.', errorOptions);
        break;
      case 401:
        if (!originalRequest?.skipAuthRefresh) {
          toast.error(errMsg ?? 'Unauthorized. Please login again.', errorOptions);
        }
        break;
      case 403:
        toast.error(errMsg ?? 'Forbidden. You do not have permission.', errorOptions);
        break;
      case 404:
        toast.error(errMsg ?? 'Not Found. The requested resource could not be found.', errorOptions);
        break;
      case 500:
        toast.error(errMsg ?? 'Server error. Please try again later.', errorOptions);
        break;
      default:
        toast.error(errMsg ?? 'An error occurred. Please try again.', errorOptions);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
