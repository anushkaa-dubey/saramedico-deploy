import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";


/**
 * Fetch a single consultation by ID
 */
export const fetchConsultationById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/consultations/${id}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Fetch all consultations (with filters)
 */
export const fetchConsultations = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/consultations?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Update consultation status or notes
 */
export const updateConsultation = async (id, updates) => {
    const response = await fetch(`${API_BASE_URL}/consultations/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
    });
    return handleResponse(response);
};

/**
 * Fetch aggregated metrics for the Structured Approval Queue dashboard cards.
 * Endpoint: GET /api/v1/consultations/queue/metrics
 */
export const fetchQueueMetrics = async () => {
    const response = await fetch(`${API_BASE_URL}/consultations/queue/metrics`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Create a new consultation (this will trigger Google Meet logic on backend)
 */
export const createConsultation = async (consultationData) => {
    const response = await fetch(`${API_BASE_URL}/consultations`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(consultationData),
    });
    return handleResponse(response);
};

/**
 * Mark a consultation as complete — triggers AI SOAP note generation.
 * Endpoint: POST /api/v1/consultations/{id}/complete
 */
export const markConsultationComplete = async (consultationId) => {
    const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/complete`, {
        method: "POST",
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Fetch the AI-generated SOAP note for a consultation.
 * Returns 202 while processing, 200 when ready.
 * Endpoint: GET /api/v1/consultations/{id}/soap-note
 * Returns: { status, soap_note: { subjective, objective, assessment, plan } }
 */
export const fetchSoapNote = async (consultationId) => {
    const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/soap-note`, {
        headers: getAuthHeaders(),
    });
    // Return both status and body so caller can handle 202 vs 200
    const body = await response.json().catch(() => ({}));
    return { httpStatus: response.status, ...body };
};

/**
 * Look up the most recent consultation for the current doctor and a specific patient.
 * Used when navigating to the SOAP note page from an approved appointment.
 * Endpoint: GET /api/v1/consultations/by-doctor-patient?patient_id=...
 */
export const fetchConsultationByPatientId = async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/consultations/lookup/by-patient?patient_id=${patientId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Delete a consultation
 */
export const deleteConsultation = async (consultationId) => {
    const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    // the backend may return 204 No Content, in which case there is no body
    if (response.status === 204) return true;
    return handleResponse(response);
};