import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * Create a new AI Chat Session
 * POST /api/v1/doctor/ai/chat/session
 */
export const createAIChatSession = async (patientId, title = null) => {
    const response = await fetch(`${API_BASE_URL}/doctor/ai/chat/session`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            patient_id: patientId,
            title: title
        }),
    });
    return handleResponse(response);
};

/**
 * List all AI Chat Sessions for a specific patient
 * GET /api/v1/doctor/ai/chat/sessions?patient_id={uuid}
 */
export const fetchAIChatSessions = async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/doctor/ai/chat/sessions?patient_id=${patientId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Get message history for a specific AI Chat Session
 * GET /api/v1/doctor/ai/chat/session/{session_id}
 */
export const fetchAIChatHistory = async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/doctor/ai/chat/session/${sessionId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Rename an existing AI Chat Session
 * PATCH /api/v1/doctor/ai/chat/session/{session_id}
 */
export const renameAIChatSession = async (sessionId, newTitle) => {
    const response = await fetch(`${API_BASE_URL}/doctor/ai/chat/session/${sessionId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            title: newTitle
        }),
    });
    return handleResponse(response);
};

/**
 * Delete an AI Chat Session
 * DELETE /api/v1/doctor/ai/chat/session/{session_id}
 */
export const deleteAIChatSession = async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/doctor/ai/chat/session/${sessionId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (response.status === 204) return true;
    return handleResponse(response);
};

/**
 * Send a message to the AI Chat (Streaming/SSE)
 * POST /api/v1/doctor/ai/chat/message
 * Note: This returns a raw response for the consumer to handle SSE stream.
 */
export const sendAIChatMessage = async (sessionId, patientId, message, documentId = null) => {
    const response = await fetch(`${API_BASE_URL}/doctor/ai/chat/message`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            session_id: sessionId,
            patient_id: patientId,
            message: message,
            document_id: documentId
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to send message" }));
        throw new Error(error.detail || "Failed to send message");
    }

    return response.body; // Stream reader
};

/**
 * Extract doctor credentials from certificate image (Vision OCR)
 * POST /api/v1/doctor/extract-credentials
 */
export const extractDoctorCredentials = async (imageFile) => {
    const formData = new FormData();
    formData.append("certificate_image", imageFile);

    const headers = getAuthHeaders();
    delete headers["Content-Type"]; // Let browser set boundary

    const response = await fetch(`${API_BASE_URL}/doctor/extract-credentials`, {
        method: "POST",
        headers: headers,
        body: formData,
    });
    return handleResponse(response);
};

// --- Legacy Compatibility Wrappers ---
// These are restored to fix console errors in components that haven't been migrated yet.

/**
 * Legacy single-request AI chat (non-streaming)
 */
export const doctorAIChat = async (payload) => {
    // We'll create a session automatically or use a default one for legacy compatibility
    const response = await fetch(`${API_BASE_URL}/doctor/ai/chat/message`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            session_id: payload.conversation_id || "default",
            patient_id: payload.patient_id,
            message: payload.query,
            document_id: payload.document_id || null
        }),
    });

    if (!response.ok) return handleResponse(response);

    // Legacy expects full JSON response, not a stream.
    // However, if the backend only supports streams now, this might fail.
    // We'll try to read it as JSON first.
    try {
        const text = await response.text();
        return JSON.parse(text);
    } catch (e) {
        // Fallback for stream
        return { response: "Streaming response started. Please update component to handle SSE." };
    }
};

export const patientAIChat = doctorAIChat; // Alias

/**
 * Fetch history (mapped to new session flow)
 */
export const fetchDoctorChatHistory = async (patientId, doctorId) => {
    try {
        const sessions = await fetchAIChatSessions(patientId);
        if (sessions && sessions.length > 0) {
            const history = await fetchAIChatHistory(sessions[0].session_id);
            // Map new format {role, content} to old format {role, message, timestamp}
            return (history.messages || []).map((m, idx) => ({
                id: idx,
                role: m.role,
                message: m.content,
                timestamp: new Date().toISOString()
            }));
        }
        return [];
    } catch (err) {
        console.error("fetchDoctorChatHistory error:", err);
        return [];
    }
};

export const fetchPatientChatHistory = fetchDoctorChatHistory; // Alias
