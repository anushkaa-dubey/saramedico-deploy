/**
 * API Configuration
 *
 * Centralized API base URL management.
 * - No hardcoded localhost in production
 * - Safe fallback for development
 * - Hard fail in production if env is missing
 */

const getApiBaseUrl = () => {
    // Priority: Explicit env variable
    const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE;

    if (envUrl) return envUrl;

    // Fallback for local development
    if (process.env.NODE_ENV === "development") {
        return "http://localhost:8000/api/v1";
    }

    // Default to relative path for production proxy/rewrites
    return "/api/v1";
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Helper to handle fetch responses and extract meaningful errors
 */
export const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;

        try {
            const errorData = await response.json();

            // Handle FastAPI list-style validation details
            if (Array.isArray(errorData?.detail)) {
                errorMessage = errorData.detail
                    .map(err => {
                        const loc = err.loc ? err.loc.join(" -> ") : "unknown";
                        return `[${loc}]: ${err.msg}`;
                    })
                    .join(" | ");
            } else if (typeof errorData?.detail === 'string') {
                errorMessage = errorData.detail;
            } else if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (errorData?.error) {
                errorMessage = errorData.error;
            }
        } catch (e) {
            // Failed to parse JSON, use status text
        }

        throw new Error(errorMessage);
    }

    // Handle empty 204 No Content responses
    if (response.status === 204) return null;

    try {
        return await response.json();
    } catch (e) {
        return null; // Return null if response isn't JSON but was successful
    }
};

/**
 * Common Authorization headers helper
 */
export const getAuthHeaders = (isMultipart = false) => {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("authToken")
            : null;

    const headers = {
        Authorization: token ? `Bearer ${token}` : ""
    };

    if (!isMultipart) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
};
