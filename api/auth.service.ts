import api from './api';
import { User } from '../types';

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

let refreshPromise: Promise<TokenResponse> | null = null;

const AuthService = {
    /**
     * Start Google OAuth login flow by redirecting to backend.
     */
    loginWithGoogle() {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        window.location.href = `${API_BASE_URL}/api/v1/auth/google`;
    },

    /**
     * Manually trigger token refresh.
     * Uses a singleton promise to prevent duplicate requests (e.g. from React StrictMode).
     */
    async refresh(): Promise<TokenResponse> {
        if (refreshPromise) {
            return refreshPromise;
        }

        refreshPromise = api.post<TokenResponse>('/api/v1/auth/refresh')
            .then(response => response.data)
            .finally(() => {
                refreshPromise = null;
            });

        return refreshPromise;
    },

    /**
     * Logout user and clear cookies.
     */
    async logout(): Promise<void> {
        await api.post('/api/v1/auth/logout');
    },

    /**
     * Get current user profile.
     */
    async getMe(): Promise<User> {
        const response = await api.get<User>('/api/v1/users/me');
        return response.data;
    },

    /**
     * Update user profile.
     */
    async updateMe(data: { name: string }): Promise<User> {
        const response = await api.patch<User>('/api/v1/users/me', data);
        return response.data;
    }
};

export default AuthService;
