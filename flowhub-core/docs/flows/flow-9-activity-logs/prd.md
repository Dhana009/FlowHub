# PRD - Flow 9: Activity Logs (The Audit Trail)

**Version:** 1.1 (Updated)  
**Status:** ✅ FINALIZED  
**SDET Value:** HIGH (Observability & Event Verification)

---

## 1. Overview
The Activity Logs feature provides a comprehensive audit trail for all significant actions within FlowHub Core. This serves as a critical observability layer for system administrators and a "truth source" for SDET automated verification suites.

---

## 2. Technical Architecture

### 2.1 Non-Blocking Architecture
Logging is designed as a **"Fire and Forget"** service. Core business logic (e.g., creating an item) does not wait for the log persistence to complete. This ensures zero performance impact on the user's primary journey.

### 2.2 Data Model (`ActivityLog`)
*   **userId**: Reference to the user who performed the action.
*   **action**: Enum (e.g., `ITEM_CREATED`, `BULK_OP_COMPLETED`, `USER_ROLE_UPDATED`).
*   **resourceType**: Enum (`ITEM`, `USER`, `BULK_OPERATION`, `AUTH`).
*   **details**: JSON object containing context (e.g., `{ "oldRole": "EDITOR", "newRole": "ADMIN" }`).
*   **metadata**: IP Address and User Agent for security forensics.

---

## 3. Tracked Actions

| Category | Actions |
| :--- | :--- |
| **Authentication** | `USER_LOGIN`, `USER_REGISTER`, `USER_LOGOUT` |
| **Items** | `ITEM_CREATED`, `ITEM_UPDATED`, `ITEM_DEACTIVATED`, `ITEM_ACTIVATED` |
| **Bulk Ops** | `BULK_OP_STARTED`, `BULK_OP_COMPLETED` |
| **Admin** | `USER_ROLE_UPDATED`, `USER_DEACTIVATED`, `USER_ACTIVATED` |

---

## 4. Security & RBAC
*   **Visibility:** Admins can view activity logs for all users. Editors and Viewers can only see their own activity history.
*   **Integrity:** Activity logs are immutable via the API (no Edit/Delete endpoints).
*   **IDOR Protection:** The `GET /api/v1/activity-logs` endpoint automatically filters by the requesting user's ID unless they hold the `ADMIN` role.

---

## 5. UI Implementation (`ActivityLogsPage.jsx`)
*   **Global View (Admin):** Chronological list of all system events.
*   **Personal View (User):** Chronological list of the user's own actions.
*   **Visual Indicators:** Color-coded action badges (Green for Created, Red for Deactivated, Amber for Updated).

---

## 6. SDET Automation showcase
1.  **Event Correlation Test:** Perform a "Bulk Deactivate" and verify that exactly one `BULK_OP_STARTED` and one `BULK_OP_COMPLETED` entry appears in the logs with matching item counts.
2.  **Forensic Integrity Test:** Verify that an Admin's action of "Changing User Role" is correctly logged with both the old and new role names in the `details` field.
3.  **Cross-Role Privacy Test:** Verify that a `VIEWER` cannot see an `ADMIN's` login logs via the API.
