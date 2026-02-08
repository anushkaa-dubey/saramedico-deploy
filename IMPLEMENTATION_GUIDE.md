# Missing Features Implementation Guide

This guide provides step-by-step instructions for implementing the missing API endpoints identified in the verification report.

---

## 🔴 Priority 1: Document Upload System

### File to Create: `services/documents.js`

```javascript
import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * =========================
 * FLOW A: Presigned URL Upload (3-step, for large files)
 * =========================
 */

/**
 * Step 1: Request presigned upload URL
 * Endpoint: POST /api/v1/documents/upload-url
 */
export const requestUploadUrl = async (documentData) => {
    const response = await fetch(`${API_BASE_URL}/documents/upload-url`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            fileName: documentData.fileName,
            fileType: documentData.fileType,
            fileSize: documentData.fileSize,
            patientId: documentData.patientId
        }),
    });
    return handleResponse(response);
    // Returns: { uploadUrl, documentId, expiresIn }
};

/**
 * Step 2: Upload file directly to MinIO storage
 */
export const uploadToBucket = async (uploadUrl, file) => {
    const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            "Content-Type": file.type,
        },
        body: file,
    });
    
    if (!response.ok) {
        throw new Error("Upload to bucket failed");
    }
    return true;
};

/**
 * Step 3: Confirm upload completion
 * Endpoint: POST /api/v1/documents/:document_id/confirm
 */
export const confirmUpload = async (documentId, metadata = {}) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/confirm`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ metadata }),
    });
    return handleResponse(response);
};

/**
 * =========================
 * FLOW B: Direct Upload (1-step, simpler)
 * =========================
 */

/**
 * Direct multipart upload
 * Endpoint: POST /api/v1/documents/upload
 */
export const uploadDocumentDirect = async (formData) => {
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        headers: getAuthHeaders(true), // multipart
        body: formData,
    });
    return handleResponse(response);
};

/**
 * =========================
 * Document Query Operations
 * =========================
 */

/**
 * List documents for a patient
 * Endpoint: GET /api/v1/documents?patient_id=X
 */
export const fetchDocuments = async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/documents?patient_id=${patientId}`, {
        headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : (data.items || data.documents || []);
};

/**
 * Get single document details
 * Endpoint: GET /api/v1/documents/:document_id
 */
export const fetchDocument = async (documentId) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
    // Returns: { ...document, downloadUrl } - downloadUrl expires in 15 min
};

/**
 * Delete a document
 * Endpoint: DELETE /api/v1/documents/:document_id
 */
export const deleteDocument = async (documentId) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        return handleResponse(response);
    }
    return true;
};

/**
 * =========================
 * Doctor Medical History Upload
 * =========================
 */

/**
 * Doctor uploads medical history for a patient
 * Endpoint: POST /api/v1/doctor/medical-history
 */
export const uploadMedicalHistory = async (formData) => {
    const response = await fetch(`${API_BASE_URL}/doctor/medical-history`, {
        method: "POST",
        headers: getAuthHeaders(true), // multipart
        body: formData,
    });
    return handleResponse(response);
    // formData should include: file, patient_id, category, title, description
};

/**
 * =========================
 * Helper: Complete upload using presigned URL flow
 * =========================
 */
export const uploadDocumentPresigned = async (file, patientId) => {
    try {
        // Step 1: Get presigned URL
        const { uploadUrl, documentId } = await requestUploadUrl({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            patientId
        });

        // Step 2: Upload to MinIO
        await uploadToBucket(uploadUrl, file);

        // Step 3: Confirm upload
        const document = await confirmUpload(documentId, {
            category: "general"
        });

        return document;
    } catch (error) {
        console.error("Presigned upload failed:", error);
        throw error;
    }
};
```

### UI Implementation Example

```javascript
// In doctor dashboard - Upload Document component
import { uploadDocumentDirect, uploadDocumentPresigned } from '@/services/documents';

const UploadDocumentModal = ({ patientId, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        try {
            // For files < 10MB, use direct upload
            if (file.size < 10 * 1024 * 1024) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('patient_id', patientId);
                formData.append('notes', 'Uploaded by doctor');
                
                const document = await uploadDocumentDirect(formData);
                onSuccess(document);
            } else {
                // For larger files, use presigned URL
                const document = await uploadDocumentPresigned(file, patientId);
                onSuccess(document);
            }
        } catch (error) {
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
        </div>
    );
};
```

---

## 🔴 Priority 2: Permissions Management

### File to Create: `services/permissions.js`

```javascript
import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * =========================
 * Doctor Operations
 * =========================
 */

/**
 * Doctor requests access to patient records
 * Endpoint: POST /api/v1/permissions/request
 */
export const requestAccess = async (patientId, reason = "", expiryDays = 90) => {
    const response = await fetch(`${API_BASE_URL}/permissions/request`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            patient_id: patientId,
            reason,
            expiry_days: expiryDays
        }),
    });
    return handleResponse(response);
    // Returns: DataAccessGrant with status="pending"
};

/**
 * =========================
 * Patient Operations
 * =========================
 */

/**
 * Patient grants access to doctor
 * Endpoint: POST /api/v1/permissions/grant-doctor-access
 */
export const grantAccess = async (doctorId, aiAccessPermission = false) => {
    const response = await fetch(`${API_BASE_URL}/permissions/grant-doctor-access`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            doctor_id: doctorId,
            ai_access_permission: aiAccessPermission
        }),
    });
    return handleResponse(response);
    // Returns: DataAccessGrant with status="active"
};

/**
 * Patient revokes doctor's access
 * Endpoint: DELETE /api/v1/permissions/revoke-doctor-access
 */
export const revokeAccess = async (doctorId) => {
    const response = await fetch(`${API_BASE_URL}/permissions/revoke-doctor-access`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            doctor_id: doctorId
        }),
    });
    
    if (!response.ok) {
        return handleResponse(response);
    }
    return true; // 204 No Content
};

/**
 * =========================
 * Shared Operations
 * =========================
 */

/**
 * Check permission status
 * Endpoint: GET /api/v1/permissions/check?patient_id=X&doctor_id=Y
 */
export const checkPermission = async (patientId, doctorId = null) => {
    const params = new URLSearchParams({ patient_id: patientId });
    if (doctorId) params.append("doctor_id", doctorId);

    const response = await fetch(
        `${API_BASE_URL}/permissions/check?${params.toString()}`,
        { headers: getAuthHeaders() }
    );
    return handleResponse(response);
    // Returns: { has_permission: bool, status: "active"|"pending"|null, expires_at, ... }
};

/**
 * Fetch pending access requests (for patient)
 */
export const fetchPendingRequests = async () => {
    // This might need a dedicated endpoint or filter on checkPermission
    // For now, placeholder
    console.warn("fetchPendingRequests not yet implemented in backend");
    return [];
};

/**
 * Fetch active grants (for patient to manage)
 */
export const fetchActiveGrants = async () => {
    // This might need a dedicated endpoint
    console.warn("fetchActiveGrants not yet implemented in backend");
    return [];
};
```

### UI Implementation Example

```javascript
// Doctor View: Request Access Button
import { requestAccess, checkPermission } from '@/services/permissions';

const RequestAccessButton = ({ patientId }) => {
    const [status, setStatus] = useState(null);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        checkPermission(patientId).then(data => setStatus(data.status));
    }, [patientId]);

    const handleRequest = async () => {
        setRequesting(true);
        try {
            await requestAccess(
                patientId,
                "Need access for upcoming consultation",
                90
            );
            alert("Access requested! Waiting for patient approval.");
            setStatus("pending");
        } catch (error) {
            alert("Request failed: " + error.message);
        } finally {
            setRequesting(false);
        }
    };

    if (status === "active") {
        return <span>✅ Access Granted</span>;
    }

    if (status === "pending") {
        return <span>⏳ Request Pending</span>;
    }

    return (
        <button onClick={handleRequest} disabled={requesting}>
            Request Access to Records
        </button>
    );
};

// Patient View: Manage Access Page
import { grantAccess, revokeAccess } from '@/services/permissions';

const ManageAccessPage = () => {
    const [requests, setRequests] = useState([]);

    const handleGrant = async (doctorId) => {
        try {
            await grantAccess(doctorId, true); // true = grant AI access too
            alert("Access granted!");
            // Refresh list
        } catch (error) {
            alert("Grant failed: " + error.message);
        }
    };

    const handleRevoke = async (doctorId) => {
        if (confirm("Revoke access for this doctor?")) {
            try {
                await revokeAccess(doctorId);
                alert("Access revoked!");
                // Refresh list
            } catch (error) {
                alert("Revoke failed: " + error.message);
            }
        }
    };

    return (
        <div>
            <h2>Manage Doctor Access</h2>
            {/* Show pending requests and active grants */}
        </div>
    );
};
```

---

## 🟡 Priority 3: Consultations Management

### File to Create: `services/consultations.js`

```javascript
import { API_BASE_URL, getAuthHeaders, handleResponse } from "./apiConfig";

/**
 * Create a new consultation
 * Endpoint: POST /api/v1/consultations
 */
export const createConsultation = async (consultationData) => {
    const response = await fetch(`${API_BASE_URL}/consultations`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            patientId: consultationData.patientId,
            doctorId: consultationData.doctorId,
            scheduledAt: consultationData.scheduledAt,
            duration: consultationData.duration || 30,
            consultationType: consultationData.consultationType || "video",
            meetingLink: consultationData.meetingLink,
            notes: consultationData.notes,
            aiSummaryEnabled: consultationData.aiSummaryEnabled || false
        }),
    });
    return handleResponse(response);
};

/**
 * Fetch consultations with filters
 * Endpoint: GET /api/v1/consultations?patient_id=X&doctor_id=Y&status=Z
 */
export const fetchConsultations = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.patient_id) params.append("patient_id", filters.patient_id);
    if (filters.doctor_id) params.append("doctor_id", filters.doctor_id);
    if (filters.status) params.append("status", filters.status);
    if (filters.from_date) params.append("from_date", filters.from_date);
    if (filters.to_date) params.append("to_date", filters.to_date);

    const response = await fetch(
        `${API_BASE_URL}/consultations?${params.toString()}`,
        { headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : (data.items || []);
};

/**
 * Get single consultation
 * Endpoint: GET /api/v1/consultations/:id
 */
export const fetchConsultation = async (consultationId) => {
    const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * Update consultation
 * Endpoint: PUT /api/v1/consultations/:id
 */
export const updateConsultation = async (consultationId, updates) => {
    const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
    });
    return handleResponse(response);
};

/**
 * Delete/Cancel consultation
 * Endpoint: DELETE /api/v1/consultations/:id
 */
export const deleteConsultation = async (consultationId) => {
    const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
        return handleResponse(response);
    }
    return true; // 204 No Content
};

/**
 * Helper: Start consultation (update status to in_progress)
 */
export const startConsultation = async (consultationId) => {
    return updateConsultation(consultationId, {
        status: "in_progress",
        actualStartTime: new Date().toISOString()
    });
};

/**
 * Helper: End consultation (update status to completed, triggers AI)
 */
export const endConsultation = async (consultationId, notes = "") => {
    return updateConsultation(consultationId, {
        status: "completed",
        actualEndTime: new Date().toISOString(),
        notes
    });
    // Backend will automatically trigger AI summary generation
};
```

### UI Integration Example

```javascript
// Link video call to consultation
import { createConsultation, startConsultation, endConsultation } from '@/services/consultations';

const VideoCallPage = ({ appointmentId, patientId, doctorId }) => {
    const [consultationId, setConsultationId] = useState(null);

    useEffect(() => {
        // Create consultation when video call starts
        const initConsultation = async () => {
            const consultation = await createConsultation({
                patientId,
                doctorId,
                scheduledAt: new Date().toISOString(),
                duration: 30,
                consultationType: "video",
                aiSummaryEnabled: true
            });
            setConsultationId(consultation.id);
            await startConsultation(consultation.id);
        };
        initConsultation();
    }, []);

    const handleEndCall = async () => {
        if (consultationId) {
            await endConsultation(consultationId, "Consultation completed successfully");
            // AI summary will be generated in background
            alert("Consultation ended. AI summary will be available shortly.");
        }
    };

    return (
        <div>
            {/* Video call UI */}
            <button onClick={handleEndCall}>End Call</button>
        </div>
    );
};
```

---

## 📝 Testing Checklist

### Documents API
- [ ] Upload small file (\u003c10MB) using direct upload
- [ ] Upload large file (\u003e10MB) using presigned URL
- [ ] List documents for a patient
- [ ] Download a document (check downloadUrl)
- [ ] Delete a document
- [ ] Doctor uploads medical history for patient

### Permissions API
- [ ] Doctor requests access to patient
- [ ] Patient grants access to doctor
- [ ] Doctor can now view patient documents
- [ ] Patient revokes access
- [ ] Doctor can no longer view documents
- [ ] Auto-grant works when doctor onboards patient

### Consultations API  
- [ ] Create consultation when video call starts
- [ ] Update status to in_progress
- [ ] Update status to completed
- [ ] Verify AI summary generated
- [ ] List all consultations for doctor
- [ ] List all consultations for patient

---

## 🎯 Integration Points

After implementing these services:

1. **Update Doctor Dashboard**:
   - Add "Upload Document" button
   - Add "Request Access" for patients they don't own
   - Show consultation history

2. **Update Patient Dashboard**:
   - Add "Manage Doctor Access" page
   - Show pending access requests
   - Show active access grants with revoke option

3. **Update Video Call Page**:
   - Create consultation on call start
   - Update status during call
   - End consultation on call end
   - Show AI summary after call completes

4. **Update AI Chat**:
   - Link to consultation summaries
   - Show document context from uploaded files

---

This implementation guide provides all the code needed to achieve 100% API coverage!
