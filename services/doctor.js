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
 * Extract doctor credentials from an uploaded certificate image
 * Endpoint: POST /api/v1/doctor/extract-credentials
 */
export const extractDoctorCredentials = async (certificateFile) => {
    const formData = new FormData();
    formData.append("certificate_image", certificateFile);

    const headers = getAuthHeaders();
    delete headers["Content-Type"]; // Let browser set multipart boundary

    const response = await fetch(`${API_BASE_URL}/doctor/extract-credentials`, {
        method: "POST",
        headers: headers,
        body: formData,
    });
    return handleResponse(response);
};

/**
 * Search Doctors
 * Endpoint: GET /api/v1/doctors/search
 */
export const searchDoctors = async (params = {}) => {
    try {
        const query = new URLSearchParams();
        if (params.query) query.append('query', params.query);
        if (params.specialty) query.append('specialty', params.specialty);
        const url = `${API_BASE_URL}/doctors/search${query.toString() ? `?${query.toString()}` : ''}`;

        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return data?.results || [];
    } catch (err) {
        console.error("searchDoctors error:", err);
        return [];
    }
};

/**
 * Search Global Doctor Directory
 * Endpoint: GET /api/v1/doctors/directory
 */
export const searchDoctorDirectory = async (params = {}) => {
    try {
        const query = new URLSearchParams();
        if (params.query) query.append('query', params.query);
        if (params.specialty) query.append('specialty', params.specialty);
        const url = `${API_BASE_URL}/doctors/directory${query.toString() ? `?${query.toString()}` : ''}`;

        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return data?.results || [];
    } catch (err) {
        console.error("searchDoctorDirectory error:", err);
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
    try {
        const response = await fetch(`${API_BASE_URL}/doctor/tasks/${taskId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        if (response.status === 204 || response.ok) return true;
        return handleResponse(response);
    } catch (err) {
        console.error("deleteTask error:", err);
        return true; // Silently succeed if backend unavailable
    }
};

/**
 * Check if doctor has AI access to a patient's data
 */
export const checkAIPermission = async (patientId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/permissions/check?patient_id=${patientId}`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        // Use has_permission as the primary gate for aiAccess.
        // ai_access_permission may not be set even on valid grants (e.g. auto-grants).
        // The backend AI endpoint enforces its own stricter check — if it 403s,
        // AIChat.jsx will reset aiAccess to false and show the Request Access UI.
        const hasActiveGrant = data.has_permission || false;
        const hasAiFlag = data.ai_access_permission || false;
        return {
            hasPermission: hasActiveGrant,
            // Allow attempt if either general permission or AI flag is true
            aiAccess: hasActiveGrant || hasAiFlag,
        };
    } catch (err) {
        console.error("checkAIPermission error:", err);
        return { hasPermission: false, aiAccess: false };
    }
};


/**
 * Request AI access to a patient's data as a Doctor.
 * The PATIENT must then approve via their app.
 * Endpoint: POST /api/v1/permissions/request
 */
export const requestAIAccess = async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/permissions/request`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            patient_id: patientId,
            reason: "AI Chart Review and Analysis",
            expiry_days: 90
        }),
    });
    return handleResponse(response);
};

// Keep old name as alias for backward compatibility
export const grantAIAccess = requestAIAccess;



/**
 * Fetch patient directory
 */
export const fetchPatients = async () => {
    const response = await fetch(`${API_BASE_URL}/doctor/patients`, {
        headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);

    return data?.all_patients || [];
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
 * Fetch a single patient as a doctor
 * Endpoint: GET /api/v1/doctor/patients/{patient_id}
 */
export const fetchPatientForDoctor = async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/doctor/patients/${patientId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Update a patient's details as a doctor
 * Endpoint: PUT /api/v1/doctor/patients/{patient_id}
 */
export const updatePatientForDoctor = async (patientId, patientData) => {
    const response = await fetch(`${API_BASE_URL}/doctor/patients/${patientId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(patientData),
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
    const data = await handleResponse(response);

    // Fix backend internal minio/docker URLs (minio:9000 or host:9000)
    // Rewrite to public AWS IP:9000 so browsers can access them directly.
    const BACKEND_HOST = process.env.NEXT_PUBLIC_API_URL
        ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
        : 'localhost';
    if (Array.isArray(data)) {
        return data.map(doc => {
            const url = doc.presigned_url || doc.url || doc.download_url;
            if (url && (url.includes('minio:9000') || url.includes(':9000'))) {
                // Rewrite docker-internal hostname to localhost
                doc.presigned_url = url
                    .replace(/^https?:\/\/minio:9000\//, `http://${BACKEND_HOST}:9010/`)
                    .replace(/^https?:\/\/[^/]+:9000\//, `http://${BACKEND_HOST}:9010/`);
            }
            return doc;
        });
    }
    return data;
};

/**
 * Delete a specific document directly
 * Endpoint: DELETE /api/v1/documents/{document_id}
 */
export const deletePatientDocument = async (docId) => {
    const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!response.ok && response.status !== 204 && response.status !== 404) {
        throw new Error(`Delete failed: ${response.status}`);
    }
    return true;
};


/**
 * Fetch a single document by ID to get full details including downloadUrl
 * Endpoint: GET /api/v1/documents/{document_id}
 */
export const fetchDocumentDetails = async (documentId) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        headers: getAuthHeaders(),
    });
    const doc = await handleResponse(response);

    // Fix docker-internal minio URLs → public AWS IP:9000
    const BACKEND_HOST = process.env.NEXT_PUBLIC_API_URL
        ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
        : '107.20.98.130';
    const url = doc.downloadUrl || doc.download_url || doc.presigned_url || doc.url;
    if (url && (url.includes('minio:9000') || url.includes(':9000'))) {
        doc.downloadUrl = url
            .replace(/^https?:\/\/minio:9000\//, `http://${BACKEND_HOST}:9000/`)
            .replace(/^https?:\/\/[^/]+:9000\//, `http://${BACKEND_HOST}:9000/`);
    }
    return doc;
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
 * Fetch a single appointment by ID
 * Endpoint: GET /api/v1/appointments/{id}
 */
export const fetchAppointmentById = async (appointmentId) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};


/**
 * Approve Appointment (Generates Google Meet link)
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
 */
export const onboardPatient = async (patientData) => {
    const response = await fetch(`${API_BASE_URL}/patients`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(patientData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw data;   // throw backend error message
    }

    return data;
};/**
 * Fetch doctor's recent activity feed
 * Endpoint: GET /api/v1/doctor/activity
 */
export const fetchActivityFeed = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/doctor/activity`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.activities || data?.items || []);
    } catch (err) {
        console.error("fetchActivityFeed error:", err);
        return [];
    }
};

/**
 * Fetch doctor's recent patients
 * Endpoint: GET /api/v1/doctor/{doctor_id}/recent-patients
 */
export const fetchRecentPatients = async (doctorId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/doctor/${doctorId}/recent-patients`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.patients || data?.items || data?.data || []);
    } catch (err) {
        console.error("fetchRecentPatients error:", err);
        return [];
    }
};

/**
 * Fetch team members
 * Endpoint: GET /api/v1/team/staff
 */
export const fetchTeamMembers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/team/staff`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : (data?.staff || data?.members || []);
    } catch (err) {
        console.error("fetchTeamMembers error:", err);
        return [];
    }
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
 * Fetch doctor's clinical dashboard metrics
 * Endpoint: GET /api/v1/doctor/me/dashboard
 */
export const fetchDashboardMetrics = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/doctor/me/dashboard`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (err) {
        console.error("fetchDashboardMetrics error:", err);
        return {
            pending_notes: 0,
            urgent_notes: 0,
            patients_today: 0,
            scheduled_today: 0,
            unsigned_orders: 0
        };
    }
};

/**
 * Fetch basic user profile
 */
export const fetchProfile = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Fetch doctor's profile and ensure we have their specific Doctor ID
 */
export const fetchDoctorProfile = async () => {
    try {
        // Use the official 'doctor/me' endpoint from the Swagger docs
        const response = await fetch(`${API_BASE_URL}/doctor/me`, {
            headers: getAuthHeaders(),
        });
        const doctorData = await handleResponse(response);

        // Return a merged object with the correct 'id' priority for AI permissions.
        // We look for 'id' directly as per the DoctorProfileResponse schema.
        return {
            ...doctorData,
            id: doctorData.id || doctorData.doctor_profile?.id
        };
    } catch (err) {
        console.warn("fetchDoctorProfile from /doctor/me failed, trying /auth/me fallback:", err);
        const user = await fetchProfile();
        return {
            ...user,
            id: user.doctor_profile?.id || user.id
        };
    }
};



/**
 * Detect MIME type from file extension when browser doesn't set file.type
 */
const getMimeType = (file) => {
    if (file.type && file.type !== "application/octet-stream") return file.type;
    const ext = file.name.split(".").pop()?.toLowerCase();
    const map = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    return map[ext] || "application/octet-stream";
};

/**
 * Upload a document for a patient
 * Strategies:
 * 1. Presigned URL (Preferred): POST /upload-url -> PUT file directly to S3 -> POST /confirm
 * 2. Direct Multipart (Fallback): POST /upload
 */
export const uploadPatientDocument = async (patientId, file, metadata) => {
    const fileType = getMimeType(file);
    let existingDocumentId = null;
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
                fileType: fileType,
                fileSize: file.size,
                patientId: patientId,
            })
        });

        if (initResponse.ok) {
            const { uploadUrl, documentId } = await initResponse.json();
            existingDocumentId = documentId;

            // Fix docker-internal minio hostname → public AWS IP
            let publicUploadUrl = uploadUrl;
            if (uploadUrl && uploadUrl.includes("minio:")) {
                publicUploadUrl = uploadUrl.replace("http://minio:", "http://107.20.98.130:");
            }

            // MinIO port 9000/9010 is sometimes blocked on corporate networks — fall through to direct tunnel upload
            const isMinioPortBlocked = publicUploadUrl && (
                publicUploadUrl.includes(":9000/") || publicUploadUrl.includes(":9000?") ||
                publicUploadUrl.includes(":9010/") || publicUploadUrl.includes(":9010?")
            );
            if (isMinioPortBlocked) {
                console.warn("MinIO storage port is not reachable — skipping presigned URL, using direct tunnel upload.");
                throw new Error("MinIO port blocked");
            }

            // Step 2: Upload file directly to S3/MinIO
            const uploadResponse = await fetch(publicUploadUrl, {
                method: "PUT",
                headers: { "Content-Type": fileType },
                body: file
            });

            if (!uploadResponse.ok) {
                throw new Error("Failed to upload file to storage.");
            }

            // Step 3: Confirm Upload
            const confirmResponse = await fetch(`${API_BASE_URL}/documents/${documentId}/confirm`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ metadata: metadata || {} })
            });

            return handleResponse(confirmResponse);
        } else {
            console.warn("Presigned URL endpoint not available or failed, falling back to direct upload.");
        }
    } catch (err) {
        console.warn("Presigned upload flow error:", err.message);
    }

    // Fallback: Direct Multipart Upload
    // Backend schema: { file, patient_id, notes? } — 'notes' is a plain string, not JSON
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_id", patientId);
    if (existingDocumentId) {
        formData.append("document_id", existingDocumentId);
    }
    if (metadata?.title) {
        formData.append("notes", metadata.title);
    }

    const headers = getAuthHeaders();
    delete headers["Content-Type"]; // Let browser set multipart boundary

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers: headers,
        body: formData,
    });
    return handleResponse(response);
};


/**
 * Add a new health metric (vital sign) for a patient.
 * Endpoint: POST /api/v1/doctor/patients/{patient_id}/health
 */
export const addPatientHealthMetric = async (patientId, payload) => {
    const response = await fetch(`${API_BASE_URL}/doctor/patients/${patientId}/health`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
};

/**
 * Edit an existing health metric for a patient.
 * Endpoint: PUT /api/v1/doctor/patients/{patient_id}/health/{metric_id}
 */
export const updatePatientHealthMetric = async (patientId, metricId, payload) => {
    const response = await fetch(`${API_BASE_URL}/doctor/patients/${patientId}/health/${metricId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
};

/**
 * Create a new consultation (Google Meet integrated)
 * Endpoint: POST /api/v1/consultations
 */

export const createConsultation = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/consultations`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
};

export const fetchConsultations = async () => {
    const response = await fetch(`${API_BASE_URL}/consultations`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export const completeConsultation = async (consultationId) => {
    const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/complete`, {
        method: "POST",
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};
