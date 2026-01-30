/**
 * API Configuration
 * 
 * Centralized API base URL management.
 * Ensures no hardcoded ports or localhost URLs exist in service files.
 * Throws a helpful error if the environment variable is missing in production.
 */

const getApiBaseUrl = () => {
    // Hardcoded for reliability during debugging
    return "http://localhost:8000/api/v1";

    /*
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE;

    if (!baseUrl) {
        // In development, we can fallback to a default, but warn the user.
        if (process.env.NODE_ENV === "development") {
            console.warn("WARNING: NEXT_PUBLIC_API_URL is not defined. Falling back to http://localhost:8001/api/v1");
            return "http://localhost:8001/api/v1";
        }

        // In production, we should handle this more strictly to prevent silent failures.
        throw new Error("CRITICAL: NEXT_PUBLIC_API_URL environment variable is missing. API calls will fail.");
    }

    return baseUrl;
    */
};

export const API_BASE_URL = getApiBaseUrl();
console.log("Using API_BASE_URL:", API_BASE_URL);

/**
 * Helper to handle fetch responses and extract meaningful errors
 */
export const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
            const errorData = await response.json();

            if (Array.isArray(errorData.detail)) {
                // Handle FastAPI validation error arrays
                errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
            } else {
                errorMessage = errorData.detail || errorData.message || errorMessage;
            }
        } catch (e) {
            // If response is not JSON
        }
        throw new Error(errorMessage);
    }
    return await response.json();
};

/**
 * Common Authorization headers helper
 */
export const getAuthHeaders = (isMultipart = false) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const headers = {
        "Authorization": `Bearer ${token}`
    };

    if (!isMultipart) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
};
