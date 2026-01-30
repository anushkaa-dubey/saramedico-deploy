import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * =========================
 * PATIENT APPOINTMENTS
 * =========================
 */

/**
 * Fetch patient's appointments
 * ✅ Endpoint: GET /api/v1/appointments/patient-appointments
 */
export const fetchAppointments = async () => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/appointments/patient-appointments`,
            { headers: getAuthHeaders() }
        );
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("fetchAppointments error:", err);
        return [];
    }
};

/**
 * Book new appointment
 * ✅ Endpoint: POST /api/v1/appointments
 * ✅ Patient SELECTS doctor (as per E2E report)
 */
export const bookAppointment = async ({
    doctor_id,
    requested_date,
    reason,
    grant_access_to_history = false,
}) => {
    if (!doctor_id || !requested_date || !reason) {
        throw new Error("doctor_id, requested_date and reason are required");
    }

    const payload = {
        doctor_id,
        requested_date,
        reason,
        grant_access_to_history,
    };

    const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
};

/**
 * Update appointment status (cancel etc.)
 * ✅ Endpoint: PATCH /api/v1/appointments/{id}/status
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
    const response = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}/status`,
        {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ status }),
        }
    );
    return handleResponse(response);
};

/**
 * =========================
 * MEDICAL RECORDS
 * =========================
 */

/**
 * Upload medical record
 * ✅ Endpoint: POST /api/v1/patient/medical-history
 */
export const uploadMedicalRecord = async (formData) => {
    const response = await fetch(
        `${API_BASE_URL}/patient/medical-history`,
        {
            method: "POST",
            headers: getAuthHeaders(true), // multipart
            body: formData,
        }
    );
    return handleResponse(response);
};

/**
 * =========================
 * PROFILE
 * =========================
 */

/**
 * Fetch logged-in user profile
 * ✅ Endpoint: GET /api/v1/auth/me
 */
export const fetchProfile = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Update profile
 * ✅ Endpoint: PATCH /api/v1/auth/me
 */
export const updateProfile = async (updates) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
    });
    return handleResponse(response);
};

/**
 * =========================
 * DOCTORS DIRECTORY
 * =========================
 */

/**
 * Search doctors
 * ✅ Endpoint: GET /api/v1/doctors/search
 * ✅ Always read from response.results
 */
export const fetchDoctors = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.specialty) params.append("specialty", filters.specialty);
        if (filters.query) params.append("query", filters.query);

        const response = await fetch(
            `${API_BASE_URL}/doctors/search?${params.toString()}`,
            { headers: getAuthHeaders() }
        );

        const data = await handleResponse(response);
        return data?.results || [];
    } catch (err) {
        console.error("fetchDoctors error:", err);
        return [];
    }
};
