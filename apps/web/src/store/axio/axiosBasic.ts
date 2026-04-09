import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { AxiosError, type AxiosResponse } from 'axios';
import axiosInstance from './axiosInstance';

export interface BaseQueryArgs {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    params?: any;
    headers?: any;
    responseType?: any;
    signal?: AbortSignal
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
    async ({ url, method, data, params, headers, responseType, signal }) => {
        try {
            console.log({ baseUrl, url })
            const result: AxiosResponse<BaseQueryResponse<any>> = await axiosInstance({
                url: baseUrl + url,
                method,
                data,
                params,
                headers,
                responseType,
                signal
            });

            console.log({ result });

            // Return in RTK Query expected format: { data: ... }
            return { data: result.data };
        } catch (axiosError) {
            console.log(axiosError);

            const err = axiosError as AxiosError<BaseQueryResponse<any>>;
            console.log(err);
            console.log(url)

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
