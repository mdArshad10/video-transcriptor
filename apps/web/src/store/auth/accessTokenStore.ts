import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface AuthState {
  accessToken: string | null,
  refreshToken: string | null
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
    },
    setRefreshToken(state, action: PayloadAction<string | null>) {
      state.refreshToken = action.payload;
    },
    clearAccessToken(state) {
      state.accessToken = null;
    },
    clearRefreshToken(state) {
      state.refreshToken = null;
    },
  },
});

export const { setAccessToken, setRefreshToken, clearAccessToken, clearRefreshToken } = authSlice.actions;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const authReducer = authSlice.reducer;
