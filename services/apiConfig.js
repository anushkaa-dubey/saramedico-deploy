/**
 * API Configuration
 *
 * IMPORTANT: The frontend ALWAYS uses a relative path (/api/v1) so that all
 * requests are routed through Next.js's built-in reverse proxy (next.config.ts).
 * This avoids CORS errors entirely — the browser only ever talks to localhost:3000,
 * and Next.js proxies the request to the real backend on the server side.
 *
 * The NEXT_PUBLIC_API_URL env var is read by next.config.ts (server-side) to
 * know where to forward the proxied requests. It is NOT used here.
 */

const getApiBaseUrl = () => {
    // For browser environments, try to use the full backend URL from env var first
    // This ensures POST requests with large payloads work correctly
    if (typeof window !== "undefined") {
        // If NEXT_PUBLIC_API_URL is set (e.g., in production), use it directly
        if (process.env.NEXT_PUBLIC_API_URL) {
            const url = process.env.NEXT_PUBLIC_API_URL.trim();
            // Remove trailing /api/v1 if present to avoid duplication
            return url.endsWith('/api/v1') ? url : url + '/api/v1';
        }
        
        // For local development, connect directly to localhost:8000
        // This avoids proxy issues with large POST payloads
        return "http://localhost:8000/api/v1";
    }

    // For server-side or non-browser environments, use the environment variable
    // or fallback to localhost.
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL.trim();
    }

    return "http://localhost:8000/api/v1";
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
