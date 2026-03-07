import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/* =========================
   Dashboard
========================= */

export const fetchAdminOverview = async () => {

  const response = await fetch(`${API_BASE_URL}/admin/overview`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);

};


/* =========================
   Accounts
========================= */

export const fetchAdminAccounts = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/accounts`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const fetchAdminAccountDetail = async (id) => {
  const response = await fetch(`${API_BASE_URL}/admin/accounts/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const updateAdminAccount = async (id, payload) => {

  const response = await fetch(`${API_BASE_URL}/admin/accounts/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);

};

export const deleteAdminAccount = async (id) => {

  const response = await fetch(`${API_BASE_URL}/admin/accounts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);

};


/* =========================
   Appointments
========================= */

export const fetchAdminAppointments = async () => {

  const response = await fetch(`${API_BASE_URL}/admin/appointments/all`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);

};


/* =========================
   Clinics
========================= */

export const fetchOrgStats = async () => {

  const response = await fetch(`${API_BASE_URL}/admin/organizations/stats`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);

};


/* =========================
   Settings
========================= */

export const fetchAdminSettings = async () => {

  const response = await fetch(`${API_BASE_URL}/admin/settings`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);

};

export const updateAdminProfile = async (payload) => {

  const response = await fetch(`${API_BASE_URL}/admin/settings/profile`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);

};

export const uploadAdminAvatar = async (file) => {

  const formData = new FormData();
  formData.append("file", file);

  const headers = getAuthHeaders();
  delete headers["Content-Type"];

  const response = await fetch(`${API_BASE_URL}/admin/settings/avatar`, {
    method: "POST",
    headers,
    body: formData,
  });

  return handleResponse(response);

};

/**
 * Invite Team Member
 * Endpoint: POST /api/v1/admin/invite
 */
export const adminInviteMember = async (payload) => {

  const response = await fetch(`${API_BASE_URL}/admin/invite`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);

};

/**
 * Get Admin Audit Logs
 * Endpoint: GET /api/v1/admin/audit-logs
 */
export const fetchAdminAuditLogs = async () => {

  const response = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);

};
/**
 * Get Admin Doctor Details
 * Endpoint: GET /api/v1/admin/doctors/{doctor_id}/details
 */
export const fetchAdminDoctorDetails = async (doctorId) => {

  const response = await fetch(
    `${API_BASE_URL}/admin/doctors/${doctorId}/details`,
    {
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);

};