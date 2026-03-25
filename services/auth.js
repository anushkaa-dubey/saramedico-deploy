import { API_BASE_URL, handleResponse } from "./apiConfig";
import {
    getAccessToken,
    setAccessToken,
    getRefreshToken,
    setRefreshToken,
    setUser,
    clearTokens,
} from "./tokenService";

/**
 * unified Signup for Doctor / Hospital
 * POST /api/v1/auth/signup
 */
export const signupUser = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

/**
 * Onboard Doctor
 * POST /api/v1/auth/onboarding/doctor
 */
export const onboardDoctor = async (payload) => {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/auth/onboarding/doctor`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

/**
 * Onboard Hospital
 * POST /api/v1/auth/onboarding/hospital
 */
export const onboardHospital = async (payload) => {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/auth/onboarding/hospital`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
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

    // Store token safely via tokenService (sessionStorage)
    if (data.access_token || data.token) {
        setAccessToken(data.access_token || data.token);
    }

    if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
    }

    // Store user object — needed by dashboard layout guards
    const user = data?.user || data;
    if (user && (user.role || user.email)) {
        setUser(user);
    }

    return data;
};

/**
 * Logout user — calls backend to revoke refresh token, then clears all local session data.
 * This is the SINGLE SOURCE OF TRUTH for logout. All logout triggers must call this.
 */
export const logoutUser = async () => {
    try {
        const refreshToken = getRefreshToken();
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
        // Always clear local session — even if the API call fails
        clearTokens();
    }
};

/**
 * Get current user (session restore)
 */
export const getCurrentUser = async () => {
    const token = getAccessToken();

    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                clearTokens();
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

export const googleLogin = (role) => {
    const backendOrigin =
        process.env.NEXT_PUBLIC_API_URL
            ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
            : "http://localhost:8000";

    let googleLoginUrl = `${backendOrigin}/api/v1/auth/google/login`;
    if (role) googleLoginUrl += `?role=${role}`;

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
        setAccessToken(token);
    }
    if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
    }

    const user = data?.user || data;
    if (user && (user.role || user.email)) {
        setUser(user);
    }

    const rawRole = user?.role || "";
    const userRole = String(rawRole).split(".").pop().trim().toLowerCase();

    return { userRole, user };
};

export const appleLogin = (role) => {
    const backendOrigin =
        process.env.NEXT_PUBLIC_API_URL
            ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
            : "http://localhost:8000";

    let appleLoginUrl = `${backendOrigin}/api/v1/auth/apple/login`;
    if (role) appleLoginUrl += `?role=${role}`;

    window.location.href = appleLoginUrl;
};

/**
 * Upload profile avatar
 * POST /api/v1/users/me/avatar
 */
export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    return handleResponse(response);
};

/**
 * Permanently delete the current user's account and all associated data.
 * Clears local storage after the API responds successfully.
 * Backend also revokes all refresh tokens internally.
 */
export const deleteMyAccount = async () => {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await handleResponse(response);
    // Clear all local session data regardless of backend response
    clearTokens();
    return data;
};
