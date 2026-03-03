import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * GET /api/v1/calendar/month/{year}/{month}
 */
export const fetchCalendarMonth = async (year, month) => {
    const response = await fetch(
        `${API_BASE_URL}/calendar/month/${year}/${month}`,
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    return handleResponse(response);
};

/**
 * GET /api/v1/calendar/day/{date}
 */
export const fetchCalendarDay = async (date) => {
    const response = await fetch(
        `${API_BASE_URL}/calendar/day/${date}`,
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    return handleResponse(response);
};

/**
 * GET /api/v1/calendar/events?start_date=...&end_date=...&event_type=...
 */
export const fetchCalendarEvents = async (params = {}) => {
    const query = new URLSearchParams(params).toString();

    const response = await fetch(
        `${API_BASE_URL}/calendar/events?${query}`,
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    return handleResponse(response);
};

/**
 * POST /api/v1/calendar/events
 */
export const createCalendarEvent = async (event) => {
    const response = await fetch(
        `${API_BASE_URL}/calendar/events`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(event),
        }
    );

    return handleResponse(response);
};

/**
 * PUT /api/v1/calendar/events/{eventId}
 */
export const updateCalendarEvent = async (eventId, event) => {
    const response = await fetch(
        `${API_BASE_URL}/calendar/events/${eventId}`,
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(event),
        }
    );

    return handleResponse(response);
};

/**
 * DELETE /api/v1/calendar/events/{eventId}
 */
export const deleteCalendarEvent = async (eventId) => {
    const response = await fetch(
        `${API_BASE_URL}/calendar/events/${eventId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        }
    );

    if (response.status === 204) return true;

    return handleResponse(response);
};