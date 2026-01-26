/**
 * Authentication Service
 * 
 * Placeholder functions for future API integration.
 * These will handle all authentication-related API calls.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Register a new user
 * 
 * @param {Object} payload - User registration data
 * @param {string} payload.email - User email
 * @param {string} payload.password - User password
 * @param {string} payload.confirm_password - Password confirmation
 * @param {string} payload.first_name - User's first name
 * @param {string} payload.last_name - User's last name
 * @param {string} payload.phone - User's phone number (with country code)
 * @param {string} payload.role - User role: "patient" | "doctor" | "admin" | "hospital"
 * @param {string} payload.organization_name - Organization name (required for non-patient roles)
 * 
 * @returns {Promise<Object>} User object (without token - need to call loginUser after)
 * 
 * Expected Response (HTTP 201):
 * {
 *   id: "user_id",
 *   email: "user@example.com",
 *   first_name: "John",
 *   last_name: "Doe",
 *   phone_number: "+919876543210",
 *   role: "doctor",
 *   organization_name: "Saramedico Clinic",
 *   is_active: true,
 *   created_at: "2024-01-01T00:00:00Z"
 * }
 */
export const registerUser = async (payload) => {
    // TODO: Implement actual API call
    // const response = await fetch(`${API_BASE_URL}/auth/register`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(payload),
    // });
    // 
    // if (!response.ok) {
    //   const error = await response.json();
    //   throw new Error(error.detail || "Registration failed");
    // }
    // 
    // return await response.json();

    console.log("registerUser called with:", payload);
    return null;
};

/**
 * Login user and get authentication token
 * 
 * @param {Object} payload - Login credentials
 * @param {string} payload.email - User email
 * @param {string} payload.password - User password
 * 
 * @returns {Promise<Object>} Authentication token and user data
 * 
 * Expected Response (HTTP 200):
 * {
 *   token: "jwt_token_here",
 *   user: {
 *     id: "user_id",
 *     email: "user@example.com",
 *     first_name: "John",
 *     last_name: "Doe",
 *     role: "doctor",
 *     organization_name: "Saramedico Clinic"
 *   }
 * }
 */
export const loginUser = async (payload) => {
    // TODO: Implement actual API call
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(payload),
    // });
    // 
    // if (!response.ok) {
    //   const error = await response.json();
    //   throw new Error(error.detail || "Login failed");
    // }
    // 
    // return await response.json();

    console.log("loginUser called with:", payload);
    return null;
};

/**
 * Logout user (clear token)
 */
export const logoutUser = async () => {
    // TODO: Implement actual API call if backend has logout endpoint
    // Clear local storage
    // localStorage.removeItem("authToken");
    // localStorage.removeItem("user");

    console.log("logoutUser called");
    return null;
};

/**
 * Verify OTP for 2FA
 * 
 * @param {Object} payload - OTP verification data
 * @param {string} payload.email - User email
 * @param {string} payload.otp - OTP code
 * 
 * @returns {Promise<Object>} Verification result
 */
export const verifyOTP = async (payload) => {
    // TODO: Implement actual API call
    console.log("verifyOTP called with:", payload);
    return null;
};

/**
 * Resend OTP
 * 
 * @param {Object} payload - Resend OTP data
 * @param {string} payload.email - User email
 * 
 * @returns {Promise<Object>} Resend result
 */
export const resendOTP = async (payload) => {
    // TODO: Implement actual API call
    console.log("resendOTP called with:", payload);
    return null;
};
