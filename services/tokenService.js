const isClient = typeof window !== "undefined";

// ── Access Token ──────────────────────────────────────────────────────────────

export const getAccessToken = () => {
    if (!isClient) return null;
    return localStorage.getItem("authToken");
};

export const setAccessToken = (token) => {
    if (!isClient || !token) return;
    localStorage.setItem("authToken", token);
};

export const removeAccessToken = () => {
    if (!isClient) return;
    localStorage.removeItem("authToken");
};

// ── Refresh Token ─────────────────────────────────────────────────────────────

export const getRefreshToken = () => {
    if (!isClient) return null;
    return localStorage.getItem("refreshToken");
};

export const setRefreshToken = (token) => {
    if (!isClient || !token) return;
    localStorage.setItem("refreshToken", token);
};

export const removeRefreshToken = () => {
    if (!isClient) return;
    localStorage.removeItem("refreshToken");
};

// ── User Object ───────────────────────────────────────────────────────────────

export const getUser = () => {
    if (!isClient) return null;
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const setUser = (user) => {
    if (!isClient || !user) return;
    localStorage.setItem("user", JSON.stringify(user));
};

export const removeUser = () => {
    if (!isClient) return;
    localStorage.removeItem("user");
};

// ── Composite helpers ─────────────────────────────────────────────────────────

export const setAuthSession = ({ accessToken, refreshToken, user }) => {
    if (accessToken) setAccessToken(accessToken);
    if (refreshToken) setRefreshToken(refreshToken);
    if (user) setUser(user);
};

export const clearTokens = () => {
    if (!isClient) return;
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
};