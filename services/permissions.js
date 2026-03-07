import { API_BASE_URL, getAuthHeaders, handleResponse } from './apiConfig';

export const grantDoctorAccess = async (payload) => {
    const response = await fetch(API_BASE_URL + '/permissions/grant-doctor-access', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
};

export const requestAccess = async (payload) => {
    const response = await fetch(API_BASE_URL + '/permissions/request', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
};

export const revokeDoctorAccess = async (payload) => {
    const response = await fetch(API_BASE_URL + '/permissions/revoke-doctor-access', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
};

export const checkPermissions = async (patientId, doctorId) => {
    const response = await fetch(API_BASE_URL + '/permissions/check?patient_id=' + patientId + '&doctor_id=' + doctorId, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};
