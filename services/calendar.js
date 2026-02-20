import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * Get day-level event counts for a specific month
 * Endpoint: GET /api/v1/calendar/month/{year}/{month}
 */
export const fetchCalendarMonth = async (year, month) => {
    const response = await fetch(`${API_BASE_URL}/calendar/month/${year}/${month}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Get events for a specific day
 * Endpoint: GET /api/v1/calendar/day/{date}
 */
export const fetchCalendarDay = async (date) => {
    const response = await fetch(`${API_BASE_URL}/calendar/day/${date}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Get filtered events
 * Endpoint: GET /api/v1/calendar/events?start_date=...&end_date=...&event_type=...
 */
export const fetchCalendarEvents = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/calendar/events?${query}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Create a custom calendar event
 * Endpoint: POST /api/v1/calendar/events
 */
export const createCalendarEvent = async (event) => {
    const response = await fetch(`${API_BASE_URL}/calendar/events`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(event),
    });
    return handleResponse(response);
};

/**
 * Update a custom calendar event
 * Endpoint: PATCH /api/v1/calendar/events/{eventId}
 */
export const updateCalendarEvent = async (eventId, event) => {
    const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(event),
    });
    return handleResponse(response);
};

/**
 * Delete a custom calendar event
 * Endpoint: DELETE /api/v1/calendar/events/{eventId}
 */
export const deleteCalendarEvent = async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!response.ok) return handleResponse(response);
    return true;
};
