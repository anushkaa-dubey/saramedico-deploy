import { API_BASE_URL, handleResponse } from "./apiConfig";

/**
 * Submit contact form
 * POST /api/v1/contact/submit
 */
export const submitContactForm = async (formData) => {
    const response = await fetch(`${API_BASE_URL}/contact/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });
    return handleResponse(response);
};
