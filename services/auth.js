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
 * Register a new Hospital organization
 * POST /api/v1/auth/register/hospital
 */
export const registerHospital = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/hospital`, {
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

    // Store refresh token if available
    if (data.refresh_token) {
        localStorage.setItem("refreshToken", data.refresh_token);
    }

    // Store user object — needed by dashboard layout guards
    const user = data?.user || data;
    if (user && (user.role || user.email)) {
        localStorage.setItem("user", JSON.stringify(user));
    }

    return data;
};

/**
 * Logout user
 */
export const logoutUser = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
            // Send request to backend to invalidate token
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
        }
    } catch (err) {
        console.error("Logout API failed:", err);
    } finally {
        // Clear local session state entirely
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
    }
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
 */
export const forgotPassword = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
};
/**
 * Upload profile avatar
 * POST /api/v1/users/me/avatar
 */
export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    return handleResponse(response);
};
