import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * Fetch hospital-wide appointments
 * Endpoint: GET /api/v1/doctor/appointments
 */
export const fetchHospitalAppointments = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/doctor/appointments`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data.appointments || data.items || data.data || []);
    } catch (err) {
        console.error("fetchHospitalAppointments error:", err);
        return [];
    }
};

/**
 * Fetch hospital queue metrics
 * Endpoint: GET /api/v1/consultations/queue/metrics
 */
export const fetchHospitalStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/consultations/queue/metrics`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return {
            notesPendingSignature: data.pending_review || data.pending || 0,
            transcriptionQueueStatus: data.high_urgency || data.urgent || 0,
            averageNoteCompletionTime: data.avg_wait_time_minutes
                ? `${data.avg_wait_time_minutes} mins`
                : (data.avg_completion_time || "0 mins"),
            patientsToday: data.patients_today || 0,
        };
    } catch (err) {
        console.error("fetchHospitalStats error:", err);
        // Return zeroed defaults — page will show 0 not crash
        return {
            notesPendingSignature: 0,
            transcriptionQueueStatus: 0,
            averageNoteCompletionTime: "0 mins",
            patientsToday: 0,
        };
    }
};

/**
 * Fetch Review Queue / Consultations
 * Endpoint: GET /api/v1/consultations
 */
export const fetchReviewQueue = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.visit_state) params.append("visit_state", filters.visit_state);
        if (filters.search) params.append("search", filters.search);
        params.append("limit", filters.limit || 10);

        const response = await fetch(`${API_BASE_URL}/consultations?${params.toString()}`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        const consultations = data.consultations || data.items || [];

        return consultations.map(c => ({
            id: c.id,
            patient: c.patientName || c.patient_name || "Unknown Patient",
            mrn: c.patient_mrn || "N/A",
            provider: c.doctorName || c.doctor_name || "Unknown Provider",
            status: c.visit_state || c.status || "Needs Review",
            urgency: c.urgency_level || "Normal",
            time: c.scheduledAt ? new Date(c.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
            date: c.scheduledAt ? new Date(c.scheduledAt).toLocaleDateString() : "Today",
            department: c.department || "General"
        }));
    } catch (err) {
        console.error("fetchReviewQueue error:", err);
        return [];
    }
};

/**
 * Invite a new staff member (Team invite)
 * Endpoint: POST /api/v1/team/invite
 */
export const inviteStaff = async (staffData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/team/invite`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(staffData)
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("inviteStaff error:", err);
        throw err;
    }
};

/**
 * Fetch Hospital/Organization profile
 * Endpoint: GET /api/v1/organization
 */
export const fetchHospitalProfile = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/organization`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchHospitalProfile error:", err);
        return null;
    }
};

/**
 * Fetch Audit Logs (Hospital-level)
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
 * Fetch Department Staff
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
 * Fetch Pending Team Invites
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
 * Fetch all organization members
 * Endpoint: GET /api/v1/organization/members
 */
export const fetchOrganizationMembers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/organization/members`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.members || data?.users || []);
    } catch (err) {
        console.error("fetchOrganizationMembers error:", err);
        return [];
    }
};
