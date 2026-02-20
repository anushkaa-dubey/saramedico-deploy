import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * Fetch doctor's tasks
 * Endpoint: GET /api/v1/doctor/tasks
 */
export const fetchTasks = async () => {
    try {
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

/**
 * Upload a document for a patient
 * Endpoint: POST /api/v1/documents/upload
 * Payload: Multipart form-data with 'file', 'patient_id', 'metadata'
 */
/**
 * Upload a document for a patient
 * Strategies:
 * 1. Presigned URL (Preferred): POST /upload-url -> PUT file -> POST /confirm
 * 2. Direct Multipart (Fallback): POST /upload
 */
export const uploadPatientDocument = async (patientId, file, metadata) => {
    try {

        // Step 1: Request Presigned URL
        const initResponse = await fetch(`${API_BASE_URL}/documents/upload-url`, {
            method: "POST",
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type || "application/octet-stream",
                fileSize: file.size,
                patientId: patientId,
                ...metadata
            })
        });

        if (initResponse.ok) {
            const { uploadUrl, documentId } = await initResponse.json();

            // Step 2: Upload payload to S3 (No auth headers, just the file)
            const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type || "application/octet-stream"
                },
                body: file
            });

            if (!uploadResponse.ok) {
                throw new Error("Failed to upload file to storage.");
            }

            // Step 3: Confirm Upload
            const confirmResponse = await fetch(`${API_BASE_URL}/documents/${documentId}/confirm`, {
                method: "POST",
                headers: getAuthHeaders()
            });

            return handleResponse(confirmResponse);
        } else {
            // If 404 or other error, throw to trigger fallback
            console.warn("Presigned URL endpoint not available or failed, falling back to direct upload.");
        }
    } catch (err) {
        console.warn("Presigned upload flow error:", err);
    }

    // Fallback: Direct Multipart Upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_id", patientId);
    if (metadata) {
        formData.append("metadata", JSON.stringify(metadata));
    }

    const headers = getAuthHeaders();
    if (headers["Content-Type"]) {
        delete headers["Content-Type"];
    }

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers: headers,
        body: formData,
    });
    return handleResponse(response);
};
