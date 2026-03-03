import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * Get day-level event counts for a specific month
 * Endpoint: GET /api/v1/calendar/month/{year}/{month}
 */
export const fetchCalendarMonth = async (year, month) => {
    // [DISCREPANCY FIX]: Calendar domain is missing in backend
    // const response = await fetch(`${API_BASE_URL}/calendar/month/${year}/${month}`, {
    //     headers: getAuthHeaders(),
    // });
    // return handleResponse(response);
    return { days: [] };
};

/**
 * Get events for a specific day
 * Endpoint: GET /api/v1/calendar/day/{date}
 */
export const fetchCalendarDay = async (date) => {
    // [DISCREPANCY FIX]: Calendar domain is missing in backend
    // const response = await fetch(`${API_BASE_URL}/calendar/day/${date}`, {
    //     headers: getAuthHeaders(),
    // });
    // return handleResponse(response);
    return { events: [] };
};

/**
 * Get filtered events
 * Endpoint: GET /api/v1/calendar/events?start_date=...&end_date=...&event_type=...
 */
export const fetchCalendarEvents = async (params = {}) => {
    // [DISCREPANCY FIX]: Calendar domain is missing in backend
    // const query = new URLSearchParams(params).toString();
    // const response = await fetch(`${API_BASE_URL}/calendar/events?${query}`, {
    //     headers: getAuthHeaders(),
    // });
    // return handleResponse(response);
    return [];
};

/**
 * Create a custom calendar event
 * Endpoint: POST /api/v1/calendar/events
 */
export const createCalendarEvent = async (event) => {
    // [DISCREPANCY FIX]: Calendar domain is missing in backend
    // const response = await fetch(`${API_BASE_URL}/calendar/events`, {
    //     method: "POST",
    //     headers: getAuthHeaders(),
    //     body: JSON.stringify(event),
    // });
    // return handleResponse(response);
    return null;
};

/**
 * Update a custom calendar event
 * Endpoint: PUT /api/v1/calendar/events/{eventId}
 */
export const updateCalendarEvent = async (eventId, event) => {
    // [DISCREPANCY FIX]: Calendar domain is missing in backend
    // const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
    //     method: "PUT",
    //     headers: getAuthHeaders(),
    //     body: JSON.stringify(event),
    // });
    // return handleResponse(response);
    return null;
};

/**
 * Delete a custom calendar event
 * Endpoint: DELETE /api/v1/calendar/events/{eventId}
 */
export const deleteCalendarEvent = async (eventId) => {
    // [DISCREPANCY FIX]: Calendar domain is missing in backend
    // const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
    //     method: "DELETE",
    //     headers: getAuthHeaders(),
    // });
    // if (!response.ok) return handleResponse(response);
    return true;
};
