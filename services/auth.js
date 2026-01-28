import { API_BASE_URL } from "./apiConfig";

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

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Registration failed");
    }

    return await response.json();
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

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();

    // Store token safely
    localStorage.setItem("authToken", data.access_token || data.token);

    return data;
};

/**
 * Logout user
 */
export const logoutUser = async () => {
    const token = localStorage.getItem("authToken");

    if (token) {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (err) {
            console.warn("Logout API failed, clearing local session anyway");
        }
    }

    localStorage.removeItem("authToken");
};

/**
 * Get current user (session restore)
 */
export const getCurrentUser = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) return null;

    return await response.json();
};

/**
 * ------------------------------
 * OTP-BASED AUTH (NOT USED NOW)
 * ------------------------------
 * Backend does NOT currently support OTP.
 * Keeping this for future use.
 */

/*
export const verifyOTP = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "OTP verification failed");
  }

  return await response.json();
};

export const resendOTP = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Resend OTP failed");
  }

  return await response.json();
};
*/
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

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Forgot password request failed");
    }

    return await response.json();
};
