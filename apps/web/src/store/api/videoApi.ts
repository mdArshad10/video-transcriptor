import { baseApi } from './baseApi'

// Define a service using a base URL and expected endpoints
export const videoApi = baseApi.injectEndpoints({
    endpoints: () => ({}),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
