import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";
import { fetchOrgMembers, fetchDepartmentStaff as fetchAdminDepartmentStaff } from "./admin";

/**
 * 1. Register a New Hospital
 * Endpoint: POST /api/v1/auth/register/hospital
 */
export const registerHospital = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register/hospital`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("registerHospital error:", err);
        throw err;
    }
};

/**
 * 2. Admin Login
 * Endpoint: POST /api/v1/auth/login
 */
export const loginHospital = async (email, password) => {
    try {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("loginHospital error:", err);
        throw err;
    }
};

/**
 * 3. Fetch Home / Overview Page
 * Endpoint: GET /api/v1/admin/overview
 */
export const fetchHospitalDashboardOverview = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/overview`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchHospitalDashboardOverview error:", err);
        return { metrics: {}, recent_activity: [], alerts: [] };
    }
};

/**
 * 4. Fetch Directory Page
 * Endpoint: GET /api/v1/hospital/directory
 */
export const fetchHospitalDirectory = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/hospital/directory`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchHospitalDirectory error:", err);
        return { doctors: [], patients: [] };
    }
};

/**
 * 5. Fetch Appointments & Calendar
 * Endpoint: GET /api/v1/calendar/organization/events
 */
export const fetchOrganizationEvents = async (startDate, endDate, eventType = "appointment") => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append("start_date", startDate);
        if (endDate) params.append("end_date", endDate);
        if (eventType) params.append("event_type", eventType);

        const response = await fetch(`${API_BASE_URL}/calendar/organization/events?${params.toString()}`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("fetchOrganizationEvents error:", err);
        return [];
    }
};

/**
 * 6. Fetch Patients Page
 * Endpoint: GET /api/v1/hospital/patients
 */
export const fetchHospitalPatients = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/hospital/patients`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchHospitalPatients error:", err);
        return { metrics: {}, patients: [] };
    }
};

/**
 * 7. Fetch Staff Data
 * Endpoint: GET /api/v1/team/staff
 */
export const fetchHospitalStaff = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/team/staff`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchHospitalStaff error:", err);
        return [];
    }
};

/**
 * 8. "Invite Doctor" Button
 * Endpoint: POST /api/v1/team/invite
 */
export const inviteHospitalStaff = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/team/invite`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("inviteHospitalStaff error:", err);
        throw err;
    }
};

/**
 * 9. "Create Event" Button
 * Endpoint: POST /api/v1/calendar/events
 */
export const createHospitalEvent = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/calendar/events`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("createHospitalEvent error:", err);
        throw err;
    }
};

/**
 * 10. "Create Task" Button
 * Endpoint: POST /api/v1/tasks
 */
export const createHospitalTask = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("createHospitalTask error:", err);
        throw err;
    }
};

/**
 * 11. Fetch Audit Logs
 * Endpoint: GET /api/v1/audit/logs
 */
export const fetchAuditLogs = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/audit/logs`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchAuditLogs error:", err);
        return [];
    }
};

/**
 * 12. Fetch Organization Overview (Redirected)
 */
export const fetchHospitalStats = async () => {
    return fetchHospitalDashboardOverview();
};


// --- Team & Organization Exports (Aliased from Admin Service where available) ---

export const fetchDepartmentStaff = async (params) => {
    return fetchAdminDepartmentStaff(params);
};

export const fetchOrganizationMembers = async () => {
    return fetchOrgMembers();
};

export const fetchHospitalAppointments = async () => {
    return [];
};

export const fetchReviewQueue = async () => {
    return [];
};
