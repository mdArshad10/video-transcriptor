import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from './api/baseApi'
import { authReducer } from './auth/accessTokenStore'
import { injectStore } from './axio/axiosInstance'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import localStorage from "redux-persist/lib/storage";
import { encryptTransform } from "redux-persist-transform-encrypt";
import { VITE_ENVIRONMENT } from '@/utils/url'

const encrypted = encryptTransform({
    secretKey: 'thisisasupersecrectkeyanditwillbeusedforencryption',
    onError: function (_error) {
        // Handle the error.
    },
})

const persistConfig = {
    key: VITE_ENVIRONMENT == "prod" ? btoa('franmantra-pasdigital-persistant-store') : 'stores',
    storage: VITE_ENVIRONMENT == "prod" ? localStorage : storage,
    whitelist: ['auth'],
    transforms: [encrypted],
}


const persistedAuthReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
})

setupListeners(store.dispatch)
injectStore(store)

export const persistor = persistStore(store);


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
