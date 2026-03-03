import { API_BASE_URL, handleResponse } from "./apiConfig";

/**
 * Register a new user
 */
export const registerUser = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

/**
 * Login user and get authentication token
 */
export const loginUser = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await handleResponse(response);

    // Store token safely
    if (data.access_token || data.token) {
        localStorage.setItem("authToken", data.access_token || data.token);
    }

    return data;
};

/**
 * Logout user
 */
export const logoutUser = async () => {
    // [DISCREPANCY FIX]: POST /auth/logout is missing in backend
    // Clearing local session only until backend support is added
    localStorage.removeItem("authToken");
};

/**
 * Get current user (session restore)
 */
export const getCurrentUser = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("authToken");
            }
            return null;
        }

        return await response.json();
    } catch (e) {
        return null;
    }
};

/**
 * Request password reset link
 * [DISCREPANCY FIX]: POST /auth/forgot-password is missing in backend
 */
// export const forgotPassword = async (payload) => {
//     const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//     });
//
//     return handleResponse(response);
// };
