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
 * Endpoint: GET /api/v1/hospital/dashboard/overview
 */
export const fetchHospitalDashboardOverview = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/hospital/dashboard/overview`, {
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

export const fetchHospitalAppointments = async (filters = {}) => {
    try {
        const now = new Date();
        const startStr = new Date(now.getFullYear(), 0, 1).toISOString(); // Full year range
        const endStr = new Date(now.getFullYear(), 11, 31).toISOString();

        const params = {
            start_date: startStr,
            end_date: endStr,
            event_type: "appointment"
        };

        if (filters.doctor_id) params.doctor_id = filters.doctor_id;
        if (filters.visit_type) params.visit_type = filters.visit_type;

        const query = new URLSearchParams(params).toString();

        const response = await fetch(`${API_BASE_URL}/calendar/organization/events?${query}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        const events = await handleResponse(response);

        const seenAppts = new Set();
        const uniqueEvents = [];

        for (const ev of events) {
            if (ev.appointment_id) {
                if (seenAppts.has(ev.appointment_id)) continue;
                seenAppts.add(ev.appointment_id);
            }
            uniqueEvents.push(ev);
        }

        // Return normalized data structure
        return uniqueEvents.map(ev => ({
            id: ev.appointment_id || ev.id,
            ...ev,
            scheduled_at: ev.start_time,
            patient_name: ev.metadata?.patient_name || ev.user_name || "Patient",
            doctor_name: ev.metadata?.doctor_name || "Practitioner",
            visit_type: ev.metadata?.visit_type || (ev.title?.toLowerCase().includes("video") ? "video" : "in-person")
        }));
    } catch (error) {
        console.error("fetchHospitalAppointments error:", error);
        return [];
    }
};

export const fetchReviewQueue = async () => {
    return [];
};

/**
 * 13. Fetch Organization Departments
 * Endpoint: GET /api/v1/organization/departments
 */
export const fetchOrganizationDepartments = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/organization/departments`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.departments || []);
    } catch (err) {
        console.error("fetchOrganizationDepartments error:", err);
        return [];
    }
};

/**
 * 14. Fetch Hospital Settings
 * Endpoint: GET /api/v1/hospital/settings
 */
export const fetchHospitalSettingsData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/hospital/settings`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchHospitalSettingsData error:", err);
        return {};
    }
};

/**
 * 15. Update Hospital Organization Settings
 * Endpoint: PATCH /api/v1/hospital/settings/organization
 */
export const updateHospitalOrgSettings = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/hospital/settings/organization`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    return await handleResponse(response);
};

/**
 * 16. Update Hospital Admin Profile
 * Endpoint: PATCH /api/v1/hospital/settings/profile
 */
export const updateHospitalAdminProfile = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/hospital/settings/profile`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    return await handleResponse(response);
};

/**
 * 17. Upload Hospital Avatar
 * Endpoint: POST /api/v1/hospital/settings/avatar
 */
export const uploadHospitalAvatar = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const headers = getAuthHeaders();
    delete headers["Content-Type"]; // Let fetch set boundary

    const response = await fetch(`${API_BASE_URL}/hospital/settings/avatar`, {
        method: "POST",
        headers,
        body: formData,
    });
    return await handleResponse(response);
};

/**
 * 18. Update doctor status (Hospital Admin shorthand)
 * Endpoint: PATCH /api/v1/hospital/doctor/{doctor_id}
 * payload: { status: "active" | "inactive" | "on_leave" }
 */
export const updateHospitalDoctorStatus = async (doctorId, newStatus) => {
    return updateHospitalDoctor(doctorId, { status: newStatus });
};




/**
 * Fetch doctors in a specific department.
 * Endpoint: GET /api/v1/doctors/by-department?department={name}
 */
export const fetchDoctorsByDepartment = async (departmentName) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/doctor/by-department?department=${encodeURIComponent(departmentName)}`,
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
            `${API_BASE_URL}/doctor/by-department?department=${encodeURIComponent(departmentName)}`,
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
export async function fetchPatientRecords(patientId) {
    const res = await fetch(
        `${API_BASE_URL}/hospital/patients/${patientId}/records`,
        {
            headers: getAuthHeaders(),
        }
    );

    if (!res.ok) throw new Error("Failed to fetch patient records");
    return res.json();
}

/**
 * Fetch specific patient details
 * Endpoint: GET /api/v1/patients/{patient_id}
 */
export async function fetchPatientDetails(patientId) {
    const res = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch patient details");
    return res.json();
}

/**
 * Fetch presigned URL for a patient document
 * Endpoint: GET /api/v1/hospital/patients/documents/{document_id}/url
 */
export async function fetchDocumentUrl(documentId, disposition = "inline") {
    const res = await fetch(
        `${API_BASE_URL}/hospital/patients/documents/${documentId}/url?disposition=${disposition}`,
        { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error("Failed to fetch document URL");
    return res.json();
}
