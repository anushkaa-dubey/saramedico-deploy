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
 * Initiate Google OAuth login
 * Redirects the browser to the backend Google SSO login endpoint.
 * The backend handles the full OAuth flow and the callback.
 *
 * @param {string} [role] - Optional role hint to pass as state (e.g. "doctor", "patient")
 */
export const googleLogin = (role) => {
    // Determine the backend base URL (direct backend URL for OAuth redirect flow)
    // We bypass the Next.js proxy here because the OAuth redirect chain must
    // go through the backend's own origin so Google's redirect_uri matches.
    const backendOrigin =
        process.env.NEXT_PUBLIC_API_URL
            ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
            : "http://localhost:8000";

    const googleLoginUrl = `${backendOrigin}/api/v1/auth/google/login`;

    // Store the role hint so the callback page can use it for routing hints
    if (role && typeof window !== "undefined") {
        sessionStorage.setItem("googleAuthRole", role);
    }

    // Full page redirect — required for the OAuth flow
    window.location.href = googleLoginUrl;
};

/**
 * Handle the Google OAuth callback data.
 * Called by the /auth/google/callback frontend page after the backend
 * redirects with access_token and refresh_token in the query params.
 *
 * @param {object} data - The LoginResponse data (access_token, refresh_token, user)
 * @returns {{ userRole: string }} - The resolved role for routing
 */
export const handleGoogleCallback = (data) => {
    const token = data.access_token || data.token;
    if (token) {
        localStorage.setItem("authToken", token);
    }
    if (data.refresh_token) {
        localStorage.setItem("refreshToken", data.refresh_token);
    }

    const user = data?.user || data;
    if (user && (user.role || user.email)) {
        localStorage.setItem("user", JSON.stringify(user));
    }

    const rawRole = user?.role || "";
    const userRole = String(rawRole).split(".").pop().trim().toLowerCase();

    return { userRole, user };
};

/**
 * Initiate Apple OAuth login
 * Redirects the browser to the backend Apple SSO login endpoint.
 * The backend handles the full OAuth flow and the callback.
 *
 * @param {string} [role] - Optional role hint to pass as state (e.g. "doctor", "patient")
 */
export const appleLogin = (role) => {
    // Determine the backend base URL (direct backend URL for OAuth redirect flow)
    // We bypass the Next.js proxy here because the OAuth redirect chain must
    // go through the backend's own origin so Apple's redirect_uri matches.
    const backendOrigin =
        process.env.NEXT_PUBLIC_API_URL
            ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
            : "http://localhost:8000";

    const appleLoginUrl = `${backendOrigin}/api/v1/auth/apple/login`;

    // Store the role hint so the callback page can use it for routing hints
    if (role && typeof window !== "undefined") {
        sessionStorage.setItem("appleAuthRole", role);
    }

    // Full page redirect — required for the OAuth flow
    window.location.href = appleLoginUrl;
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
