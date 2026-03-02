import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * Fetch hospital-wide appointments
 */
export const fetchHospitalAppointments = async () => {
    try {
        // Fallback to fetchAppointments if no specific hospital endpoint
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
 * Fetch hospital stats (notes pending, transcription queue, etc.)
 */
export const fetchHospitalStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/consultations/queue/metrics`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return {
            notesPendingSignature: data.pending_review || 0,
            transcriptionQueueStatus: data.high_urgency || 0,
            averageNoteCompletionTime: `${data.avg_wait_time_minutes || 0} mins`
        };
    } catch (err) {
        console.error("fetchHospitalStats error:", err);
        return {
            notesPendingSignature: 0,
            transcriptionQueueStatus: 0,
            averageNoteCompletionTime: "0 mins"
        };
    }
};

/**
 * Fetch Review Queue
 */
export const fetchReviewQueue = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.visit_state) params.append("visit_state", filters.visit_state);
        if (filters.search) params.append("search", filters.search);
        params.append("limit", filters.limit || 5);

        const response = await fetch(`${API_BASE_URL}/consultations?${params.toString()}`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        const consultations = data.consultations || data.items || [];

        return consultations.map(c => ({
            id: c.id,
            patient: c.patientName || "Unknown Patient",
            mrn: c.patient_mrn || "N/A",
            provider: c.doctorName || "Unknown Provider",
            status: c.visit_state || c.status || "Needs Review",
            urgency: c.urgency_level || "Normal",
            time: c.scheduledAt ? new Date(c.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
            date: c.scheduledAt ? new Date(c.scheduledAt).toLocaleDateString() : "Today"
        }));
    } catch (err) {
        console.error("fetchReviewQueue error:", err);
        return [];
    }
};
