import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * Fetch doctor's tasks
 * Endpoint: GET /api/v1/doctor/tasks
 */
export const fetchTasks = async () => {
    try {
        console.log("Fetching tasks from:", `${API_BASE_URL}/doctor/tasks`);
        const response = await fetch(`${API_BASE_URL}/doctor/tasks`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data.tasks || data.items || data.data || []);
    } catch (err) {
        console.error("fetchTasks error:", err);
        return [];
    }
};

/**
 * Add a new task
 * Endpoint: POST /api/v1/doctor/tasks
 */
export const addTask = async (task) => {
    const response = await fetch(`${API_BASE_URL}/doctor/tasks`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(task),
    });
    return handleResponse(response);
};

/**
 * Update an existing task
 * Endpoint: PATCH /api/v1/doctor/tasks/{taskId}
 */
export const updateTask = async (taskId, updates) => {
    const response = await fetch(`${API_BASE_URL}/doctor/tasks/${taskId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
    });
    return handleResponse(response);
};

/**
 * Delete a task
 * Endpoint: DELETE /api/v1/doctor/tasks/{taskId}
 */
export const deleteTask = async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/doctor/tasks/${taskId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        return handleResponse(response);
    }
    return true;
};

/**
 * Fetch patient directory
 */
export const fetchPatients = async () => {
    const response = await fetch(`${API_BASE_URL}/doctor/patients`, {
        headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : (data.patients || data.items || data.data || []);
};

/**
 * Fetch patient profile details
 * Endpoint: GET /api/v1/patients/{id}
 */
export const fetchPatientProfile = async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Fetch patient medical documents (with permission)
 * Endpoint: GET /api/v1/doctor/patients/{patient_id}/documents
 */
export const fetchPatientDocuments = async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/doctor/patients/${patientId}/documents`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Fetch appointment requests for doctor
 * Endpoint: GET /api/v1/doctor/appointments
 */
export const fetchAppointments = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/doctor/appointments`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data.appointments || data.items || data.data || []);
    } catch (err) {
        console.error("fetchDoctorAppointments error:", err);
        return [];
    }
};

/**
 * Approve Appointment (Generates Zoom)
 * Endpoint: POST /api/v1/appointments/{id}/approve
 */
export const approveAppointment = async (appointmentId, data = {}) => {
    // Backend requires appointment_time. Default to requested_date if passed or now+1h
    const payload = {
        appointment_time: data.appointment_time || new Date(Date.now() + 3600000).toISOString(),
        doctor_notes: data.doctor_notes || ""
    };

    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/approve`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
};

/**
 * Update appointment status (e.g., Decline or status update)
 * Endpoint: PATCH /api/v1/appointments/{id}/status
 * payload example: { status: "declined", doctor_notes: "..." }
 */
export const updateAppointmentStatus = async (appointmentId, status, notes = "") => {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, doctor_notes: notes }),
    });
    return handleResponse(response);
};

/**
 * Onboard/Invite a new patient (Doctor creating patient)
 * Endpoint: POST /api/v1/patients
 */
export const onboardPatient = async (patientData) => {
    const response = await fetch(`${API_BASE_URL}/patients`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(patientData),
    });
    return handleResponse(response);
};

/**
 * Fetch team members
 */
export const fetchTeamMembers = async () => {
    return [];
};

/**
 * Create a new SOAP note
 */
export const createSOAPNote = async (soapNote) => {
    console.log("createSOAPNote placeholder called");
    return null;
};

/**
 * Update doctor's profile
 * (Includes specialty, onboarding_complete, etc.)
 */
export const updateDoctorProfile = async (updates) => {
    // Note: The backend uses /auth/me for some profile updates or /doctor/profile
    // Based on test_full_flow.js, it uses /doctor/profile
    const response = await fetch(`${API_BASE_URL}/doctor/profile`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
    });
    return handleResponse(response);
};
/**
 * Fetch logged-in doctor profile
 * Endpoint: GET /api/v1/auth/me
 */
export const fetchProfile = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};
