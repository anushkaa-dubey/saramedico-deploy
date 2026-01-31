/**
 * API Configuration
 *
 * Centralized API base URL management.
 * - No hardcoded localhost in production
 * - Safe fallback for development
 * - Hard fail in production if env is missing
 */

const getApiBaseUrl = () => {
    const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE;

    if (!baseUrl) {
        if (process.env.NODE_ENV === "development") {
            console.warn(
                "WARNING: NEXT_PUBLIC_API_URL not set. Falling back to http://localhost:8000/api/v1"
            );
            return "http://localhost:8000/api/v1";
        }

        throw new Error(
            "CRITICAL: NEXT_PUBLIC_API_URL is missing. Frontend cannot reach backend."
        );
    }

    return baseUrl;
};

export const API_BASE_URL = getApiBaseUrl();

if (typeof window !== "undefined") {
    console.log("Using API_BASE_URL:", API_BASE_URL);
}

/**
 * Helper to handle fetch responses and extract meaningful errors
 */
export const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;

        try {
            const errorData = await response.json();

            if (Array.isArray(errorData?.detail)) {
                // FastAPI validation errors
                errorMessage = errorData.detail
                    .map(err => `${err.loc.join(".")}: ${err.msg}`)
                    .join(", ");
            } else {
                errorMessage =
                    errorData?.detail ||
                    errorData?.message ||
                    errorMessage;
            }
        } catch {
            // response not JSON
        }

        throw new Error(errorMessage);
    }

    return response.json();
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
