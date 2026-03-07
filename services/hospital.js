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
 * Endpoint: GET /api/v1/hospital/overview
 */
export const fetchHospitalDashboardOverview = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/hospital/overview`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchHospitalDashboardOverview error:", err);
        return {};
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

// export const fetchDepartmentStaff = async (params) => {
//     return fetchAdminDepartmentStaff(params);
// };

// export const fetchOrganizationMembers = async () => {
//     return fetchOrgMembers();
// };

export const fetchHospitalAppointments = async () => {
    return [];
};

export const fetchReviewQueue = async () => {
    return [];
};

/**
 * Fetch departments for the organization.
 * Endpoint: GET /api/v1/organization/departments
 */
export const fetchOrganizationDepartments = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/organization/departments`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        // Accepts { departments: [...] } or a plain array
        return Array.isArray(data) ? data : (data?.departments || []);
    } catch (err) {
        console.error("fetchOrganizationDepartments error:", err);
        return [];
    }
};



/**
 * Fetch doctors in a specific department.
 * Endpoint: GET /api/v1/doctors/by-department?department={name}
 */
export const fetchDoctorsByDepartment = async (departmentName) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/doctors/by-department?department=${encodeURIComponent(departmentName)}`,
            { headers: getAuthHeaders() }
        );
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.results || data?.doctors || []);
    } catch (err) {
        console.error("fetchDoctorsByDepartment error:", err);
        return [];
    }
};

/**
 * Invite / create a new doctor account under the hospital.
 * Endpoint: POST /api/v1/hospital/doctor/create
 */
export const createHospitalDoctor = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/hospital/doctor/create`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

/**
 * Fetch pending doctor invites.
 * Endpoint: GET /api/v1/hospital/doctor/invites
 */
export const fetchPendingInvites = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/hospital/doctor/invites`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.pending_invites || []);
    } catch (err) {
        console.error("fetchPendingInvites error:", err);
        return [];
    }
};

/**
 * Update a hospital doctor's role.
 * Endpoint: PATCH /api/v1/hospital/doctor/{doctor_id}
 */
export const updateHospitalDoctor = async (doctorId, updates) => {
    const response = await fetch(`${API_BASE_URL}/hospital/doctor/${doctorId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
    });
    return handleResponse(response);
};

/**
 * Set doctor's own availability status.
 * Endpoint: POST /api/v1/doctor/status
 * payload: { status: "active" | "inactive" | "busy" }
 */
export const setDoctorStatus = async (status) => {
    const response = await fetch(`${API_BASE_URL}/doctor/status`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    return handleResponse(response);
};

/**
 * Fetch all doctors with their active/inactive status (Hospital Admin).
 * Endpoint: GET /api/v1/hospital/doctor/status
 * Returns array of doctors with status field.
 */
export const fetchHospitalDoctorStatus = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/hospital/doctors/status`, {
            headers: getAuthHeaders(),
        });

        const data = await handleResponse(response);

        const active = data?.active_doctors || [];
        const inactive = data?.inactive_doctors || [];

        return [...active, ...inactive];

    } catch (err) {
        console.error("fetchHospitalDoctorStatus error:", err);
        return [];
    }
};

export const fetchDepartmentStaff = async (departmentName) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/doctors/by-department?department=${encodeURIComponent(departmentName)}`,
            { headers: getAuthHeaders() }
        );
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.results || []);
    } catch (err) {
        console.error("fetchDepartmentStaff error:", err);
        return [];
    }
};

export const fetchOrganizationMembers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/team/staff`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.staff || []);
    } catch (err) {
        console.error("fetchOrganizationMembers error:", err);
        return [];
    }
};