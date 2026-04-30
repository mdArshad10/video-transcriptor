import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { AxiosError, type AxiosResponse } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import axiosInstance from './axiosInstance';

export interface BaseQueryArgs {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: unknown;
    params?: AxiosRequestConfig['params'];
    headers?: AxiosRequestConfig['headers'];
    responseType?: AxiosRequestConfig['responseType'];
    signal?: AbortSignal;
    skipAuthRefresh?: boolean;
}

export interface BaseQueryResponse<T> {
    data: T | null;
    message: string;
    statusCode: number;
    success: boolean;
    totalRecords?: number
}

export interface BaseQueryError {
    status?: number;
    data?: {
        message?: string;
        statusCode?: number;
        success?: boolean;
    };
}

const axiosBaseQuery = (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' }
): BaseQueryFn<BaseQueryArgs, unknown, BaseQueryError> =>
    async ({ url, method, data, params, headers, responseType, signal, skipAuthRefresh }) => {
        try {
            const result: AxiosResponse<BaseQueryResponse<unknown>> = await axiosInstance({
                url: baseUrl + url,
                method,
                data,
                params,
                headers,
                responseType,
                signal,
                skipAuthRefresh,
            });

            // Return in RTK Query expected format: { data: ... }
            return { data: result.data };
        } catch (axiosError) {
            const err = axiosError as AxiosError<BaseQueryResponse<unknown>>;

            // Return error in RTK Query expected format: { error: ... }
            return {
                error: {
                    status: err.response?.status,
                    data: err.response?.data || {
                        message: err.message || 'An error occurred',
                        success: false,
                    }
                }
            };
        }
    };

export default axiosBaseQuery;
