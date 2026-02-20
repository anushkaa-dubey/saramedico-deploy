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
    // This is a placeholder as backend might not have this specific endpoint yet
    return {
        notesPendingSignature: 14,
        transcriptionQueueStatus: 8,
        averageNoteCompletionTime: "4.2 hrs"
    };
};

/**
 * Fetch Review Queue
 */
export const fetchReviewQueue = async (filters = {}) => {
    // Placeholder for Structured Review Queue
    return [
        { id: "REV001", patient: "John Von", provider: "Dr. Sarah Wilson", department: "Cardiology", urgency: "High", status: "Needs Review", time: "10:30 AM" },
        { id: "REV002", patient: "Alice Bob", provider: "Dr. Michael Chen", department: "Neurology", urgency: "Medium", status: "Processing", time: "11:45 AM" },
        { id: "REV003", patient: "Jane Roe", provider: "Dr. Elena Rodriguez", department: "Pediatrics", urgency: "Low", status: "Draft Ready", time: "01:15 PM" },
    ];
};
