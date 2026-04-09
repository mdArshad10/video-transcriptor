// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import axiosBaseQuery from '../axio/axiosBasic'

// Define a service using a base URL and expected endpoints
export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: axiosBaseQuery({ baseUrl: 'http://localhost:3000/' }),
    endpoints: () => ({}),
})
