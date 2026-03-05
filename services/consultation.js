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