# Saramedico Frontend Gap Analysis & Development Roadmap

## 1. Executive Summary

Based on the comparison between the **Saramedico Platform Master Development Specification** and the current code implementation, the project has a solid foundational shell (Dashboards for Patient, Doctor, Admin) but is missing the **core AI-driven functional modules** ("Reader" and "Listener") that define the business value.

The current state is primarily a "UI Shell" with static or placeholder content. To reach "Phase 2" and "Phase 3" of the master spec, significant frontend development is required to build the interactive tools for document analysis and live consultation.

---

## 2. Detailed Gap Analysis

### 🚨 Critical Gaps (Missing Functionality)

#### **Module A: Document Intelligence Studio ("The Reader")**
*   **Status:** ❌ Completely Missing
*   **Spec Requirement:** A dedicated "Split-View" workspace with:
    *   **Left:** PDF Viewer (PDF.js/react-pdf) with canvas rendering security.
    *   **Right:** AI Chat Panel (RAG) for Q&A.
    *   **Features:** "Smart Uploader" with Drag & Drop + Auto-Redact Toggle.
    *   **Interactive Elements:** Clickable citations (e.g., "[Page 4]" links that scroll the PDF) and AI Timeline view.
*   **Current State:** No dedicated route or component found for this. `dashboard/doctor/patients` has a visual tab for "Documents" but no logic or viewer implementation.

#### **Module B: Ambient Clinical Agent ("The Listener")**
*   **Status:** ⚠️ Partially Implemented / Placeholder
*   **Spec Requirement:** A "Live Consultation" mode with:
    *   **Recording Mode:** Large Start/Stop button, real-time waveform visualizer, language selector.
    *   **Post-Visit/Review Mode (3-Column Layout):**
        1.  **Transcript:** Real-time text with speaker diarization.
        2.  **SOAP Note:** AI-generated structured note (Subjective, Objective, Assessment, Plan) in editable text areas.
        3.  **Assist Panel:** AI Tags (e.g., [Anxious]) and Remedy suggestions.
*   **Current State:**
    *   `dashboard/doctor/live-consult` is merely a setup/config page.
    *   `dashboard/doctor/video-call` has a 2-column layout (Video + Transcript). It lacks the critical **SOAP Note Editor** and the **3-column structure**. The "Add Note" feature is too basic compared to the spec.

#### **Patient Management**
*   **Status:** ⚠️ Partially Implemented
*   **Spec Requirement:**
    *   **Unified Directory:** Searchable table of patients.
    *   **Comprehensive Profile:** A dedicated view with tabs for "Visits" (Timeline of SOAP notes) and "Documents" (PDFs).
*   **Current State:**
    *   `dashboard/doctor/patients` list exists visually.
    *   Split-view profile exists but is purely visual. The "tabs" do not switch views. The "Documents" view is missing.

#### **Onboarding & Authentication**
*   **Status:** ❌ Missing / Not Verified
*   **Spec Requirement:**
    *   **Onboarding Wizard:** 3-Step tour (Specialty -> Upload Sample -> Mic Test).
    *   **Authentication:** MFA challenge screens (though backend dependent, UI is needed).
*   **Current State:** Focused on dashboards; entry flows appear absent.


## 3. Recommended Frontend Roadmap (Milestones)

Since the immediate goal is **Frontend completion**, we should proceed in this order:

### **Milestone 1: The "Listener" (Module B) Deep Dive** 🎙️
*Focus: Turning the "Video Call" page into the robust "Ambient Agent" specified.*
1.  **Refactor `video-call` Layout:** Convert the 2-column layout to the specified **3-column grid** (Transcript | SOAP Editor | Assist).
2.  **Build SOAP Editor:** Create a rich-text editor component with specific sections (S, O, A, P) that can receive "streamed" text.
3.  **Build Assist Panel:** Create the "Tagging UI" (clickable chips) and "Remedies" search bar placeholder.
4.  **Enhance Recording UI:** Implement the high-fidelity waveform visualizer using the Web Audio API (or a library like `wavesurfer.js`) on the definition page.

### **Milestone 2: The "Reader" (Module A) Build-out** 📄
*Focus: Building the Document Analysis Studio.*
1.  **Create Route:** `/dashboard/doctor/documents/[id]` or `/dashboard/doctor/chart-review`.
2.  **PDF Viewer Integration:** Implement `react-pdf` to render PDFs securely.
3.  **Split-Pane Layout:** Build a resizable split-pane component.
4.  **AI Chat Component:** Build the chat interface with specific styling for "Citations" (highlighted links).
5.  **Timeline Component:** A vertical step-list for extracted medical events.

### **Milestone 3: Patient Profile & Management** 👤
*Focus: Connecting the specific modules to the patient record.*
1.  **Activate Profile Tabs:** Make the "Visits" and "Documents" tabs in `dashboard/doctor/patients` functional.
2.  **Documents List View:** Create the UI to list uploaded PDFs for a specific patient.
3.  **Visits Timeline:** Enhance the list of past visits to link to the *completed* SOAP notes.

### **Milestone 4: Onboarding & Polish** ✨
1.  **Onboarding Wizard:** Build the standalone 3-step modal/page.
2.  **Uploaders:** Build the Drag & Drop zone with the "Redact PII" toggle switch.

---

## 4. Immediate Next Step

**Action:** Begin **Milestone 1** by refactoring the `doctor/video-call` page to match the "Ambient Clinical Agent" 3-column specification. This is the highest value differentiator for the "Premium" tier.
