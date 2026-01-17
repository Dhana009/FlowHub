# PRD - Flow 10: Admin User Management (The Control Plane)

**Version:** 1.1 (Updated)  
**Status:** ✅ FINALIZED  
**SDET Value:** HIGH (System Admin Automation & State Control)

---

## 1. Overview
The User Management feature allows Administrators to oversee and control all user accounts. This is the "Control Plane" for the RBAC system, enabling admins to promote, demote, or deactivate users in real-time.

---

## 2. Technical Architecture

### 2.1 API Endpoints (Admin Only)
*   **`GET /api/v1/users`**: Paginated list of all users.
*   **`PATCH /api/v1/users/:id/role`**: Updates user role (`ADMIN`, `EDITOR`, `VIEWER`).
*   **`PATCH /api/v1/users/:id/status`**: Activates or Deactivates a user account.
*   **`DELETE /api/v1/users/:id`**: Legacy deactivation endpoint.

### 2.2 Security Guardrails
*   **Self-Deactivation Block:** Admins are physically prevented (at both API and UI layers) from deactivating their own account.
*   **Self-Demotion Block:** Admins cannot change their own role (e.g., they cannot demote themselves to VIEWER), ensuring at least one admin always remains in the system.
*   **Atomic State Updates:** UI uses absolute positioning for loaders in the role dropdown to prevent **table column drifting** during state changes.

---

## 3. User Journey (Admin)
1.  **Access:** Admin navigates to the "Users" page via the sidebar.
2.  **Management:** Admin views a stabilized table of all users.
3.  **Role Change:** Admin selects a new role from a compact dropdown. A small spinner appears *inside* the dropdown while processing.
4.  **Account Status:** Admin can toggle "Activate/Deactivate" buttons. A confirmation dialog appears before deactivation.
5.  **Feedback:** A short, clear Toast notification (e.g., "Role updated") appears on success.

---

## 4. Security & Audit Trail
*   **Audit Logging:** Every role change, deactivation, or activation is recorded in the **Activity Logs** with details of who performed the action and which user was affected.
*   **Session Termination:** Deactivating a user or changing their role triggers the **Real-Time Security Guard** (Flow 8), causing the user's current session to be invalidated on their next request.

---

## 5. SDET Automation Strategy
1.  **Privilege Escalation Test:** Attempt to promote a `VIEWER` to `ADMIN` using an `EDITOR`'s token. Verify `403 Forbidden`.
2.  **Self-Destruction Prevention Test:** Automate an Admin trying to deactivate themselves via the API and verify the `403 Security Block` response.
3.  **Session Invalidation Loop:** 
    - Log in as `User_A`.
    - Log in as `Admin`.
    - `Admin` deactivates `User_A`.
    - Verify `User_A`'s next API call returns `401 Unauthorized` immediately.
4.  **UI Resilience Test:** Verify that the "Users" table columns do not shift or jump when the role change loader is active.
