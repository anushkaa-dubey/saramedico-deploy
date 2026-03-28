import { API_BASE_URL, getAuthHeaders, handleResponse, normalizeMediaUrl } from "./apiConfig";

/**
 * =========================
 * PATIENT APPOINTMENTS
 * =========================
 */

/**
 * Fetch patient's appointments
 * Endpoint: GET /api/v1/appointments/patient-appointments
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
 * Fetch a single appointment by ID
 * Endpoint: GET /api/v1/appointments/{id}
 */
export const fetchAppointmentById = async (appointmentId) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};


/**
 * Fetch consultations for the currently logged-in user (patient or doctor)
 * The backend base /consultations endpoint is role-aware and handles authentication context automatically.
 */
export const fetchMyConsultations = async () => {
    const response = await fetch(`${API_BASE_URL}/consultations`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Fetch a single consultation by ID
 * Endpoint: GET /api/v1/consultations/{id}
 */
export const fetchConsultationDetails = async (consultationId) => {
    const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Fetch SOAP note for a consultation
 * Endpoint: GET /api/v1/consultations/{id}/soap-note
 */
export const fetchSoapNote = async (consultationId) => {
    const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/soap-note`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};
/**
 * Book new appointment
 *  Endpoint: POST /api/v1/appointments
 *  Patient SELECTS doctor
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
 *  Endpoint: PATCH /api/v1/appointments/{id}/status
 */
export const updateAppointmentStatus = async (appointmentId, status, reschedule_note = null) => {
    const payload = { status };
    if (reschedule_note) payload.reschedule_note = reschedule_note;

    const response = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}/status`,
        {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        }
    );
    return handleResponse(response);
};

// export const getMyConsultations = async (limit) => {
//     const url = limit ? `${API_BASE_URL}/consultations?limit=${limit}` : `${API_BASE_URL}/consultations`;
//     const response = await fetch(url, { headers: getAuthHeaders() });
//     return handleResponse(response);
// };

export const getHealthMetrics = async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/health`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * =========================
 * MEDICAL RECORDS
 * =========================
 */

export const fetchMedicalRecords = async () => {
    const response = await fetch(`${API_BASE_URL}/documents`, {
        headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    // The /documents endpoint returns { documents: [...], total: N }
    const rawDocs = Array.isArray(data) ? data : (data?.documents || data?.records || []);

    // Fix backend internal minio/docker URLs AND normalise camelCase -> snake_case
    // The /documents schema uses camelCase (downloadUrl, fileName, uploadedAt, fileType)
    // while the patient records UI expects snake_case (presigned_url, file_name, uploaded_at)
    return rawDocs.map(doc => {
        // Normalise – carry camelCase through AND add snake_case aliases
        const url = doc.downloadUrl || doc.presigned_url || doc.url || doc.download_url;
        const fixedUrl = normalizeMediaUrl(url);

        return {
            ...doc,
            // snake_case aliases so all UI components work regardless of which endpoint they came from
            file_name: doc.file_name || doc.fileName,
            file_type: doc.file_type || doc.fileType,
            uploaded_at: doc.uploaded_at || doc.uploadedAt,
            presigned_url: fixedUrl || null,
            download_url: fixedUrl || null,
        };
    });
};

export const getMyDocuments = async (patientId) => {
    const url = patientId
        ? `${API_BASE_URL}/documents?patient_id=${patientId}`
        : `${API_BASE_URL}/documents`;

    const response = await fetch(url, { headers: getAuthHeaders() });
    const data = await handleResponse(response);

    return data?.documents || [];
};
export const uploadMedicalHistory = async (formData) => {
    const headers = getAuthHeaders();
    delete headers["Content-Type"];

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers,
        body: formData,
    });
    return handleResponse(response);
};

/**
 * =========================
 * PROFILE
 * =========================
 */

/**
 * Fetch logged-in user profile
 * Endpoint: GET /api/v1/auth/me
 */
export const fetchProfile = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return data?.user || data;
};
/**
 * Update profile
 * [DISCREPANCY FIX]: PATCH /api/v1/auth/me is missing in backend
 */
// export const updateProfile = async (updates) => {
//     const response = await fetch(`${API_BASE_URL}/auth/me`, {
//         method: "PATCH",
//         headers: getAuthHeaders(),
//         body: JSON.stringify(updates),
//     });
//     return handleResponse(response);
// };

/**
 * =========================
 * DOCTORS DIRECTORY
 * =========================
 */

/**
 * Search doctors
 * Endpoint: GET /api/v1/doctors/search
 * Always read from response.results
 */
export const fetchDoctors = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.specialty) params.append("specialty", filters.specialty);
        if (typeof filters.query === "string" && filters.query.length >= 2) {
            params.append("query", filters.query);
        }

        const response = await fetch(
            `${API_BASE_URL}/doctors/directory?${params.toString()}`,
            { headers: getAuthHeaders() }
        );

        const data = await handleResponse(response);
        return data?.results || [];
    } catch (err) {
        console.error("fetchDoctors error:", err);
        return [];
    }
};

/**
 * =========================
 * PERMISSIONS (Patient side)
 * =========================
 */

/**
 * Fetch pending doctor access requests for the logged-in patient
 * Endpoint: GET /api/v1/permissions/check  (we call with patient's own token — backend infers patient_id)
 * Returns list of pending grants where patient needs to respond
 */
export const fetchPendingAccessRequests = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/permissions/check`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        // Backend may return an array of grants or a single object.
        if (Array.isArray(data)) return data.filter(g => g.status === "pending");
        // If single object (one doctor), wrap in array if pending
        if (data && data.status === "pending") return [data];
        return [];
    } catch (err) {
        console.error("fetchPendingAccessRequests error:", err);
        return [];
    }
};

/**
 * Grant a doctor access to the patient's data (with optional AI access)
 * Endpoint: POST /api/v1/permissions/grant-doctor-access
 */
export const grantDoctorAccess = async (doctorId, aiAccess = true) => {
    const response = await fetch(`${API_BASE_URL}/permissions/grant-doctor-access`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            doctor_id: doctorId,
            ai_access_permission: aiAccess,
        }),
    });
    return handleResponse(response);
};

/**
 * Revoke a doctor's access
 * Endpoint: DELETE /api/v1/permissions/revoke-doctor-access
 */
export const revokeDoctorAccess = async (doctorId) => {
    const response = await fetch(`${API_BASE_URL}/permissions/revoke-doctor-access`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ doctor_id: doctorId }),
    });
    if (response.status === 204) return true;
    return handleResponse(response);
};
