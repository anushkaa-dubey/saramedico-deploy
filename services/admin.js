import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * =========================
 * ADMIN SERVICE
 * All admin-specific API endpoints
 * =========================
 */

/**
 * Get Admin Dashboard Overview
 * Endpoint: GET /api/v1/admin/overview
 */
export const fetchAdminOverview = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/overview`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchAdminOverview error:", err);
        return null;
    }
};

/**
 * Get Admin Settings
 * Endpoint: GET /api/v1/admin/settings
 */
export const fetchAdminSettings = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/settings`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchAdminSettings error:", err);
        return null;
    }
};

/**
 * Update Organization Settings
 * Endpoint: PATCH /api/v1/admin/settings/organization
 */
export const updateOrgSettings = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/settings/organization`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("updateOrgSettings error:", err);
        throw err;
    }
};

/**
 * Update Developer Settings
 * Endpoint: PATCH /api/v1/admin/settings/developer
 */
export const updateDevSettings = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/settings/developer`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("updateDevSettings error:", err);
        throw err;
    }
};

/**
 * Update Backup Settings
 * Endpoint: PATCH /api/v1/admin/settings/backup
 */
export const updateBackupSettings = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/settings/backup`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("updateBackupSettings error:", err);
        throw err;
    }
};

/**
 * Get Admin Accounts List
 * Endpoint: GET /api/v1/admin/accounts
 */
export const fetchAdminAccounts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/accounts`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.accounts || data?.members || data?.users || []);
    } catch (err) {
        console.error("fetchAdminAccounts error:", err);
        return [];
    }
};

/**
 * Invite Team Member (Admin)
 * Endpoint: POST /api/v1/admin/invite
 */
export const adminInviteMember = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/invite`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("adminInviteMember error:", err);
        throw err;
    }
};

/**
 * Remove Team Member (Admin)
 * Endpoint: DELETE /api/v1/admin/accounts/{id}
 */
export const adminRemoveMember = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/accounts/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("adminRemoveMember error:", err);
        throw err;
    }
};

/**
 * Get Doctor Details (Admin)
 * Endpoint: GET /api/v1/admin/doctors/{doctor_id}/details
 */
export const fetchAdminDoctorDetails = async (doctorId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}/details`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchAdminDoctorDetails error:", err);
        return null;
    }
};

/**
 * Get Admin Audit Logs
 * Endpoint: GET /api/v1/admin/audit-logs
 */
export const fetchAdminAuditLogs = async (params = {}) => {
    try {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/admin/audit-logs${query ? `?${query}` : ""}`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.logs || data?.items || []);
    } catch (err) {
        console.error("fetchAdminAuditLogs error:", err);
        return [];
    }
};

/**
 * Get Organization Info
 * Endpoint: GET /api/v1/organization
 */
export const fetchOrganization = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/organization`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchOrganization error:", err);
        return null;
    }
};

/**
 * List Organization Members
 * Endpoint: GET /api/v1/organization/members
 */
export const fetchOrgMembers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/organization/members`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.members || data?.users || []);
    } catch (err) {
        console.error("fetchOrgMembers error:", err);
        return [];
    }
};

/**
 * Invite Organization Member
 * Endpoint: POST /api/v1/organization/invitations
 */
export const inviteOrgMember = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/organization/invitations`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("inviteOrgMember error:", err);
        throw err;
    }
};

/**
 * Get Audit Stats
 * Endpoint: GET /api/v1/audit/stats
 */
export const fetchAuditStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/audit/stats`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchAuditStats error:", err);
        return null;
    }
};

/**
 * Get Audit Logs
 * Endpoint: GET /api/v1/audit/logs
 */
export const fetchAuditLogs = async (params = {}) => {
    try {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/audit/logs${query ? `?${query}` : ""}`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.logs || data?.items || []);
    } catch (err) {
        console.error("fetchAuditLogs error:", err);
        return [];
    }
};

/**
 * Export Audit Logs
 * Endpoint: GET /api/v1/audit/export
 */
export const exportAuditLogs = async (params = {}) => {
    try {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/audit/export${query ? `?${query}` : ""}`, {
            headers: getAuthHeaders(),
        });
        return response; // Return raw response for blob/download handling
    } catch (err) {
        console.error("exportAuditLogs error:", err);
        throw err;
    }
};

/**
 * Get Team Roles
 * Endpoint: GET /api/v1/team/roles
 */
export const fetchTeamRoles = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/team/roles`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.roles || []);
    } catch (err) {
        console.error("fetchTeamRoles error:", err);
        return [];
    }
};

/**
 * List Department Staff
 * Endpoint: GET /api/v1/team/staff
 */
export const fetchDepartmentStaff = async (params = {}) => {
    try {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/team/staff${query ? `?${query}` : ""}`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.staff || data?.members || []);
    } catch (err) {
        console.error("fetchDepartmentStaff error:", err);
        return [];
    }
};

/**
 * List Pending Invites
 * Endpoint: GET /api/v1/team/invites/pending
 */
export const fetchPendingInvites = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/team/invites/pending`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.invites || data?.items || []);
    } catch (err) {
        console.error("fetchPendingInvites error:", err);
        return [];
    }
};

/**
 * Invite Team Member
 * Endpoint: POST /api/v1/team/invite
 */
export const inviteTeamMember = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/team/invite`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("inviteTeamMember error:", err);
        throw err;
    }
};

/**
 * Update Account (Admin)
 * Endpoint: PATCH /api/v1/admin/accounts/{id}
 */
export const updateAdminAccount = async (id, payload) => {
    const response = await fetch(`${API_BASE_URL}/admin/accounts/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

/**
 * Fetch All Appointments (System-wide)
 * Endpoint: GET /api/v1/admin/appointments/all
 */
export const fetchAdminAppointments = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/appointments/all`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.appointments || data?.items || []);
    } catch (err) {
        console.error("fetchAdminAppointments error:", err);
        return [];
    }
};

/**
 * Fetch Organization Stats Table
 * Endpoint: GET /api/v1/admin/organizations/stats
 */
export const fetchOrgStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/organizations/stats`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.organizations || data?.stats || []);
    } catch (err) {
        console.error("fetchOrgStats error:", err);
        return [];
    }
};

/**
 * Update Admin Profile
 * Endpoint: PATCH /api/v1/admin/settings/profile
 */
export const updateAdminProfile = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/admin/settings/profile`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

/**
 * Upload Admin Avatar
 * Endpoint: POST /api/v1/admin/settings/avatar
 */
export const uploadAdminAvatar = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const headers = getAuthHeaders();
    delete headers["Content-Type"];
    const response = await fetch(`${API_BASE_URL}/admin/settings/avatar`, {
        method: "POST",
        headers,
        body: formData,
    });
    return handleResponse(response);
};

/**
 * Get Doctors by Department
 * Endpoint: GET /api/v1/doctors/by-department?department=X
 */
export const fetchDoctorsByDepartment = async (department) => {
    try {
        const response = await fetch(`${API_BASE_URL}/doctors/by-department?department=${encodeURIComponent(department)}`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.results || data?.doctors || []);
    } catch (err) {
        console.error("fetchDoctorsByDepartment error:", err);
        return [];
    }
};

/**
 * Create Doctor Account (Hospital Admin)
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
 * Update Doctor Profile (Hospital Admin)
 * Endpoint: PATCH /api/v1/hospital/doctor/{doctor_id}
 */
export const updateHospitalDoctor = async (doctorId, payload) => {
    const response = await fetch(`${API_BASE_URL}/hospital/doctor/${doctorId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

/**
 * Fetch Organization Departments
 * Endpoint: GET /api/v1/organization/departments
 */
export const fetchOrgDepartments = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/organization/departments`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.departments || []);
    } catch (err) {
        console.error("fetchOrgDepartments error:", err);
        return [];
    }
};

