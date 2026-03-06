import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * =========================
 * ADMIN SERVICE
 * =========================
 */


/* =========================
   Dashboard
========================= */

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


/* =========================
   Settings
========================= */

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

export const updateAdminProfile = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/admin/settings/profile`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

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


/* =========================
   Accounts
========================= */

export const fetchAdminAccounts = async () => {
    try {

        const response = await fetch(`${API_BASE_URL}/admin/accounts`, {
            headers: getAuthHeaders(),
        });

        const data = await handleResponse(response);

        return Array.isArray(data)
            ? data
            : (data?.accounts || data?.members || data?.users || []);

    } catch (err) {

        console.error("fetchAdminAccounts error:", err);

        return [];

    }
};

export const updateAdminAccount = async (id, payload) => {

    const response = await fetch(`${API_BASE_URL}/admin/accounts/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
};

export const adminRemoveMember = async (id) => {

    const response = await fetch(`${API_BASE_URL}/admin/accounts/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    return handleResponse(response);
};


/* =========================
   Appointments
========================= */

export const fetchAdminAppointments = async () => {

    try {

        const response = await fetch(`${API_BASE_URL}/admin/appointments/all`, {
            headers: getAuthHeaders(),
        });

        const data = await handleResponse(response);

        return Array.isArray(data)
            ? data
            : (data?.appointments || data?.items || []);

    } catch (err) {

        console.error("fetchAdminAppointments error:", err);

        return [];

    }

};


/* =========================
   Organization
========================= */

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

export const fetchOrgMembers = async () => {

    try {

        const response = await fetch(`${API_BASE_URL}/organization/members`, {
            headers: getAuthHeaders(),
        });

        const data = await handleResponse(response);

        return Array.isArray(data)
            ? data
            : (data?.members || data?.users || []);

    } catch (err) {

        console.error("fetchOrgMembers error:", err);

        return [];

    }

};

export const fetchOrgStats = async () => {

    try {

        const response = await fetch(`${API_BASE_URL}/admin/organizations/stats`, {
            headers: getAuthHeaders(),
        });

        const data = await handleResponse(response);

        return Array.isArray(data)
            ? data
            : (data?.organizations || data?.stats || []);

    } catch (err) {

        console.error("fetchOrgStats error:", err);

        return [];

    }

};


/* =========================
   Departments
========================= */

export const fetchOrgDepartments = async () => {

    try {

        const response = await fetch(`${API_BASE_URL}/organization/departments`, {
            headers: getAuthHeaders(),
        });

        const data = await handleResponse(response);

        return Array.isArray(data)
            ? data
            : (data?.departments || []);

    } catch (err) {

        console.error("fetchOrgDepartments error:", err);

        return [];

    }

};


/* =========================
   Doctors
========================= */

export const fetchDoctorsByDepartment = async (department) => {

    try {

        const response = await fetch(
            `${API_BASE_URL}/doctors/by-department?department=${encodeURIComponent(department)}`,
            { headers: getAuthHeaders() }
        );

        const data = await handleResponse(response);

        return Array.isArray(data)
            ? data
            : (data?.results || data?.doctors || []);

    } catch (err) {

        console.error("fetchDoctorsByDepartment error:", err);

        return [];

    }

};

export const createHospitalDoctor = async (payload) => {

    const response = await fetch(`${API_BASE_URL}/hospital/doctor/create`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
};

export const updateHospitalDoctor = async (doctorId, payload) => {

    const response = await fetch(`${API_BASE_URL}/hospital/doctor/${doctorId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
};


/* =========================
   Audit Logs
========================= */

export const fetchAdminAuditLogs = async (params = {}) => {

    try {

        const query = new URLSearchParams(params).toString();

        const response = await fetch(
            `${API_BASE_URL}/admin/audit-logs${query ? `?${query}` : ""}`,
            { headers: getAuthHeaders() }
        );

        const data = await handleResponse(response);

        return Array.isArray(data)
            ? data
            : (data?.logs || data?.items || []);

    } catch (err) {

        console.error("fetchAdminAuditLogs error:", err);

        return [];

    }

};

export const exportAuditLogs = async (params = {}) => {

    const query = new URLSearchParams(params).toString();

    const response = await fetch(
        `${API_BASE_URL}/admin/audit-logs/export${query ? `?${query}` : ""}`,
        { headers: getAuthHeaders() }
    );

    return response;
};
export async function adminInviteMember() {
    throw new Error("adminInviteMember not implemented");
}

export async function fetchAdminDoctorDetails() {
    throw new Error("fetchAdminDoctorDetails not implemented");
}

export async function updateOrgSettings() {
    throw new Error("updateOrgSettings not implemented");
}

export async function updateDevSettings() {
    throw new Error("updateDevSettings not implemented");
}

export async function updateBackupSettings() {
    throw new Error("updateBackupSettings not implemented");
}

export async function fetchDepartmentStaff() {
    throw new Error("fetchDepartmentStaff not implemented");
}