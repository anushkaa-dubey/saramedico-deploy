import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * AI Document Processing
 * Endpoint: POST /api/v1/doctor/ai/process-document
 */
export const processDocumentWithAI = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/doctor/ai/process-document`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

/**
 * Trigger AI document analysis
 * Endpoint: POST /api/v1/documents/{document_id}/analyze
 */
export const analyzeDocument = async (documentId) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/analyze`, {
        method: "POST",
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

/**
 * Get document processing status
 * Endpoint: GET /api/v1/documents/{document_id}/status
 */
export const getDocumentStatus = async (documentId) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/status`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

/**
 * Helper for text responses
 */
const handleTextResponse = async (response) => {
    const text = await response.text();
    if (!response.ok) {
        throw new Error(text || `Request failed with status ${response.status}`);
    }
    return text;
};

/**
 * Doctor AI Chat
 * Endpoint: POST /api/v1/doctor/ai/chat/doctor
 * Returns plain text string
 */
export const doctorAIChat = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/doctor/ai/chat/doctor`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    const text = await handleTextResponse(response);
    return { response: text };
};

/**
 * Patient AI Chat
 * Endpoint: POST /api/v1/doctor/ai/chat/patient
 * Returns plain text string
 */
export const patientAIChat = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/doctor/ai/chat/patient`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    const text = await handleTextResponse(response);
    return { response: text };
};

/**
 * Fetch Patient Chat History
 * Endpoint: GET /api/v1/doctor/ai/chat-history/patient?patient_id=...
 */
export const fetchPatientChatHistory = async (patientId) => {
    const response = await fetch(
        `${API_BASE_URL}/doctor/ai/chat-history/patient?patient_id=${patientId}`,
        {
            headers: getAuthHeaders(),
        }
    );
    const text = await handleTextResponse(response);
    try {
        return JSON.parse(text);
    } catch (e) {
        console.warn("Chat history is not valid JSON, returning []", e);
        return [];
    }
};

/**
 * Fetch Doctor Chat History
 * Endpoint: GET /api/v1/doctor/ai/chat-history/doctor?patient_id=...&doctor_id=...
 */
export const fetchDoctorChatHistory = async (patientId, doctorId) => {
    const response = await fetch(
        `${API_BASE_URL}/doctor/ai/chat-history/doctor?patient_id=${patientId}&doctor_id=${doctorId}`,
        {
            headers: getAuthHeaders(),
        }
    );
    const text = await handleTextResponse(response);
    try {
        return JSON.parse(text);
    } catch (e) {
        console.warn("Chat history is not valid JSON, returning []", e);
        return [];
    }
};
