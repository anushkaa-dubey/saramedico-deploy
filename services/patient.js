import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * Fetch patient's appointments history
 * Endpoint: GET /api/v1/appointments/patient-appointments
 */
export const fetchAppointments = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments/patient-appointments`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data.appointments || data.items || data.data || []);
    } catch (err) {
        console.error("fetchAppointments error:", err);
        return [];
    }
};

/**
 * Request a new appointment
 * Endpoint: POST /api/v1/appointments
 */
export const bookAppointment = async (appointmentData) => {
    if (!appointmentData.doctor_id) {
        throw new Error("Doctor selection is required for booking.");
    }

    const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData),
    });
    return handleResponse(response);
};

/**
 * Cancel/Update appointment status (if needed)
 * Endpoint: PATCH /api/v1/appointments/{id}/status
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    return handleResponse(response);
};

/**
 * Fetch patient's medical records
 * Endpoint: GET /api/v1/patient/medical-history/
 */
export const fetchMedicalRecords = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/patient/medical-history/`, {
            headers: getAuthHeaders(),
        });

        // Handle "Method Not Allowed" gracefully - backend might only support POST for upload
        if (response.status === 405) {
            console.warn("GET /patient/medical-history/ is not allowed. Listing may not be implemented.");
            return [];
        }

        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data.records || data.items || data.data || []);
    } catch (err) {
        console.error("fetchMedicalRecords error:", err);
        // Fallback to empty array to prevent UI crash if endpoint is missing
        return [];
    }
};

/**
 * Upload a medical record
 * Endpoint: POST /api/v1/patient/medical-history
 */
export const uploadMedicalRecord = async (formData) => {
    const response = await fetch(`${API_BASE_URL}/patient/medical-history`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: formData,
    });
    return handleResponse(response);
};

/**
 * Fetch patient profile
 * Endpoint: GET /api/v1/auth/me
 */
export const fetchProfile = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Update patient profile
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
 * Search available doctors
 * Endpoint: GET /api/v1/doctors/search with fallback to GET /api/v1/doctors
 */
export const fetchDoctors = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (filters.specialty) queryParams.append("specialty", filters.specialty);
        if (filters.name) queryParams.append("name", filters.name);

        const response = await fetch(`${API_BASE_URL}/doctors/search?${queryParams.toString()}`, {
            headers: getAuthHeaders(),
        });

        let data;
        if (response.ok) {
            data = await handleResponse(response);
        } else {
            // Fallback to general list if search is not supported or fails
            console.warn("Doctor search failed, falling back to general list");
            const fallbackResponse = await fetch(`${API_BASE_URL}/doctors`, {
                headers: getAuthHeaders(),
            });
            data = await handleResponse(fallbackResponse);
        }

        return Array.isArray(data) ? data : (data.doctors || data.items || data.data || []);
    } catch (err) {
        console.error("fetchDoctors error:", err);
        return [];
    }
};

