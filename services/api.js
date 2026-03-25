import axios from "axios";
import { API_BASE_URL } from "./apiConfig";
import {
    getAccessToken,
    setAccessToken,
    getRefreshToken,
    clearTokens,
} from "./tokenService";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── On app load: prime the default Authorization header if token exists ────────
if (typeof window !== "undefined") {
    const existingToken = getAccessToken();
    if (existingToken) {
        api.defaults.headers.common["Authorization"] = `Bearer ${existingToken}`;
    }
}

// ── Response interceptor: silent token refresh on 401 ─────────────────────────
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onTokenRefreshed = (newToken) => {
    refreshSubscribers.forEach((cb) => cb(newToken));
    refreshSubscribers = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401; skip refresh / login endpoints to prevent loops
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh") &&
            !originalRequest.url?.includes("/auth/login")
        ) {
            // If a refresh is already in-flight, queue this request
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((newToken) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                // No refresh token — immediately force-logout, no API call
                isRefreshing = false;
                _forceLogout();
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                const newAccessToken = data.access_token || data.token;
                if (!newAccessToken) throw new Error("No access token in refresh response");

                // Persist via tokenService
                setAccessToken(newAccessToken);

                // Update Axios defaults AND the original request — must do BOTH
                api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                onTokenRefreshed(newAccessToken);
                isRefreshing = false;

                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = []; // drain queue before logout
                _forceLogout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Clear all local session data and redirect to login.
 * Called when refresh token fails or is missing.
 * Uses clearTokens() from tokenService for consistency.
 */
function _forceLogout() {
    clearTokens();
    if (typeof window !== "undefined") {
        // Guard against multiple concurrent redirects
        if (!window.__loggingOut) {
            window.__loggingOut = true;
            window.location.href = "/auth/login";
        }
    }
}

export default api;
