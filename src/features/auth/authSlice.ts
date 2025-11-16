import { createSlice } from '@reduxjs/toolkit';
import type { User } from '../../hooks/useApi';
type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
};
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isAuthenticated: false,
        user: null,
        token: null,
    } as AuthState,
    reducers: {
        login: (state, payload) => {
            const user: User = payload.payload.user;
            const token: string = payload.payload.token;
            state.isAuthenticated = true;
            state.user = user;
            state.token = token;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
        },
    },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
