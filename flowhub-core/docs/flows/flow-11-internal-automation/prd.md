# PRD - Flow 11: Internal Automation Control Plane

**Version:** 1.0  
**Status:** ✅ FINALIZED  
**SDET Value:** CRITICAL (Testability, Clean State, and Speed)

---

## 1. Overview
The **Internal Automation Control Plane** is a set of "Backdoor" APIs designed specifically to support high-scale automated testing. These APIs allow the automation framework to bypass slow UI interactions (like manual item creation) and solve synchronization challenges (like reading OTPs).

---

## 2. Business Value
*   **Zero Flakiness:** Enables a "Reset" before every test, ensuring a 100% clean environment.
*   **Execution Speed:** Reduces test setup time from minutes to milliseconds via fast seeding.
*   **Production-Demo Ready:** Allows clearing demo data in production without manual DB access.

---

## 3. Features & Endpoints

### 3.1 Global Reset (`POST /api/v1/internal/reset`)
*   **Function:** Deletes all documents from `Users`, `Items`, `OTPs`, `BulkJobs`, and `ActivityLogs`.
*   **Usage:** Called in the `beforeAll()` hook of a global test suite.

### 3.2 Dynamic OTP Retrieval (`GET /api/v1/internal/otp?email=...`)
*   **Function:** Queries the DB for the most recent, unused OTP for a specific email address.
*   **Usage:** Used in Signup and Forgot Password UI tests to retrieve the "Secret Code" without needing an actual email server.

### 3.3 Fast Data Seeding (`POST /api/v1/internal/seed`)
*   **Function:** Uses high-speed bulk insertion to create 10-100 items for a specific User ID.
*   **Usage:** Used to prepare the state for "Bulk Operation" tests and "Pagination" tests.

---

## 4. Security Guardrails (Safety Key)
Since these endpoints are powerful and available in production, they are protected by a **Safety Key mechanism**:
*   **Header Required:** `X-Internal-Key`
*   **Validation:** Every request must provide a key that matches the server's `INTERNAL_AUTOMATION_KEY`.
*   **Response on Failure:** `401 Unauthorized` with "Invalid or missing Internal Safety Key".

---

## 5. SDET Automation Showcase
1.  **Clean-Start Validation:** Verify that after a `reset`, the dashboard shows "No items found".
2.  **OTP Handshake:** 
    *   Trigger "Forgot Password" in UI.
    *   Call `/internal/otp` via API to get the code.
    *   Type the code into the UI.
    *   Verify successful transition to "Reset Password" screen.
3.  **Stress Seeding:** Inject 500 items via the seeder and verify the UI's pagination and search performance.

