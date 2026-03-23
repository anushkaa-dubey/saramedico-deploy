import { API_BASE_URL, handleResponse } from "./apiConfig";

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
    // Need to get the onboarding token from localStorage
    const token = localStorage.getItem("authToken");
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
    // Need to get the onboarding token from localStorage
    const token = localStorage.getItem("authToken");
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

/**
 * Permanently delete the current user's account and all associated data.
 * Clears local storage after the API responds successfully.
 */
export const deleteMyAccount = async () => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await handleResponse(response);
    // Clear all local session data regardless of backend response
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    return data;
};
