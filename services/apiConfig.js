/**
 * API Configuration
 *
 * DEPLOYMENT STRATEGY:
 * ─────────────────────
 * In production (EC2), Nginx sits in front of both the frontend and backend.
 * All traffic arrives on port 80:
 *   /api/*   →  proxied to FastAPI backend (:8000)
 *   /*       →  proxied to Next.js frontend (:3000)
 *
 * Because the browser only ever talks to the SAME origin (port 80),
 * we use a RELATIVE URL ("/api/v1") for all API calls — this completely
 * eliminates CORS issues.
 *
 * For local development without Nginx you can set
 *   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
 * in your .env to hit the backend directly.
 */

const getApiBaseUrl = () => {
    // NEXT_PUBLIC_API_URL is set at build time and available in both
    // server and browser environments.
    const envUrl = process.env.NEXT_PUBLIC_API_URL;

    if (envUrl) {
        let url = envUrl.trim();
        // Remove trailing slash if present
        if (url.endsWith('/')) {
            url = url.slice(0, -1);
        }
        // Ensure it ends with /api/v1
        return url.endsWith('/api/v1') ? url : url + '/api/v1';
    }

    // Fallback — relative URL works when Nginx is in front
    return "/api/v1";
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Gets the backend origin (e.g., http://localhost:8000) for OAuth and absolute URL constructs.
 */
export const getBackendOrigin = () => {
    return process.env.NEXT_PUBLIC_API_URL
        ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
        : "http://localhost:8000";
};

/**
 * Normalises media URLs (e.g. from MinIO) to use the appropriate backend host and port.
 */
export const normalizeMediaUrl = (url) => {
    if (!url) return url;
    
    const backendHost = process.env.NEXT_PUBLIC_API_URL
        ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
        : "localhost";
        
    let fixedUrl = url;
    if (fixedUrl.includes('minio:9000') || fixedUrl.includes(':9000')) {
        fixedUrl = fixedUrl
            .replace(/^https?:\/\/minio:9000\//, `http://${backendHost}:9010/`)
            .replace(/^https?:\/\/[^/]+:9000\//, `http://${backendHost}:9010/`);
    }
    return fixedUrl;
};

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
    // Lazy-import to avoid circular deps (apiConfig is imported by many modules)
    const { getAccessToken } = require("./tokenService");
    const token = getAccessToken();

    const headers = {
        Authorization: token ? `Bearer ${token}` : ""
    };

    if (!isMultipart) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
};
