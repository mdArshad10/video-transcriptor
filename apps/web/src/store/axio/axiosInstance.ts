import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import {
  clearAccessToken,
  selectAccessToken,
  setAccessToken,
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
        const nextToken = response.data?.accessToken ?? null;
        store.dispatch(setAccessToken(nextToken));
        return nextToken;
      })
      .catch(() => {
        store.dispatch(clearAccessToken());
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = selectAccessToken(store.getState());

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
    const status = error.response?.status;

    // if (
    //   status === 401 &&
    //   originalRequest &&
    //   !originalRequest._retry &&
    //   !originalRequest.skipAuthRefresh
    // ) {
    //   if (isRefreshing) {
    //     return new Promise((resolve, reject) => {
    //       subscribeTokenRefresh((nextToken) => {
    //         if (!nextToken) {
    //           reject(error);
    //           return;
    //         }

    //         originalRequest._retry = true;
    //         originalRequest.headers = originalRequest.headers ?? {};
    //         originalRequest.headers.Authorization = `Bearer ${nextToken}`;
    //         resolve(axiosInstance(originalRequest));
    //       });
    //     });
    //   }

    //   originalRequest._retry = true;
    //   isRefreshing = true;

    //   try {
    //     const nextToken = await refreshAccessToken();
    //     onRefreshComplete(nextToken);

    //     if (!nextToken) {
    //       redirectToAuthError();
    //       return Promise.reject(error);
    //     }

    //     originalRequest.headers = originalRequest.headers ?? {};
    //     originalRequest.headers.Authorization = `Bearer ${nextToken}`;
    //     return axiosInstance(originalRequest);
    //   } catch (refreshError) {
    //     onRefreshComplete(null);
    //     store.dispatch(clearAccessToken());
    //     redirectToAuthError();
    //     return Promise.reject(refreshError);
    //   } finally {
    //     isRefreshing = false;
    //   }
    // }

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
