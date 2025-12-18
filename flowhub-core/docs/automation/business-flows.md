# **Business Journey Catalog: 10 Core Flows**

This document serves as the **Functional Map** for the SDET team. Every automated test suite should map back to one of these 11 flows.

---

## **1. Core Business Flows**

### **Flow 1: Identity & Access (Auth)**
*   **Purpose:** Secure user entry and session management.
*   **Journeys:** Signup (with OTP), Login (with Remember Me), Logout, Session Persistence, and Cross-tab Synchronization.
*   **API Modules:** `/auth`

### **Flow 2: Item Ingestion (Creation)**
*   **Purpose:** Data entry with complex validation.
*   **Journeys:** Creating Physical, Digital, or Service items with dynamic form fields and file attachments (Images/PDFs).
*   **API Modules:** `/items` (POST)

### **Flow 3: Search & Discovery (Discovery)**
*   **Purpose:** Data retrieval and exploration.
*   **Journeys:** Searching by keyword, filtering by category/status, multi-column sorting, and paginated navigation.
*   **API Modules:** `/items` (GET)

### **Flow 4: Resource Inspection (View)**
*   **Purpose:** Granular data viewing.
*   **Journeys:** Opening item detail modals, viewing uploaded files, and deep-linking directly to items via unique IDs.
*   **API Modules:** `/items/:id` (GET)

### **Flow 5: State Mutation (Update)**
*   **Purpose:** Modifying existing data securely.
*   **Journeys:** Editing item fields and handling **Optimistic Locking** (Verifying the `version` field to prevent concurrent update conflicts).
*   **API Modules:** `/items/:id` (PUT)

### **Flow 6: Lifecycle Management (Lifecycle)**
*   **Purpose:** Record state transitions.
*   **Journeys:** Soft-deactivating an item (Inactive) and restoring it back to the active pool.
*   **API Modules:** `/items/:id` (DELETE/PATCH)

### **Flow 7: Batch Processing (Bulk Ops)**
*   **Purpose:** High-volume state changes.
*   **Journeys:** Selecting multiple items for mass activation/deactivation with an asynchronous progress bar and polling mechanism.
*   **API Modules:** `/bulk-operations`

### **Flow 8: Security Compliance (RBAC)**
*   **Purpose:** Permission enforcement.
*   **Journeys:** Verifying that Viewer/Editor/Admin roles can only see and do exactly what they are permitted to (UI Masking & API Hardening).
*   **Verification:** Expecting 403 Forbidden for unauthorized actions.

### **Flow 9: System Audit (Activity Logs)**
*   **Purpose:** Security observability.
*   **Journeys:** Tracking a chronological audit trail of all system-critical actions (Login, Creation, Bulk, Role Changes).
*   **API Modules:** `/activities`

### **Flow 10: Governance (User Management)**
*   **Purpose:** Administrative control plane.
*   **Journeys:** Admin-only dashboard to list users, change roles, and disable/enable accounts.
*   **API Modules:** `/users`

---

## **2. Automation Infrastructure Flow**

### **Flow 11: Automation Control Plane**
*   **Purpose:** Deterministic test environments.
*   **Hooks:** 
    *   **Global Reset:** Wiping the DB between test runs.
    *   **OTP Retrieval:** Programmatic access to signup codes.
    *   **Fast Seeding:** Injecting 50+ items in <1s for search/pagination testing.
*   **API Modules:** `/internal`

