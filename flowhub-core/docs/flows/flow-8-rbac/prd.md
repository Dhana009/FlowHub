# PRD - Flow 8: Multi-Role Access Control (RBAC)

**Version:** 1.1 (Updated)  
**Status:** ✅ FINALIZED  
**SDET Value:** CRITICAL (Security Automation & Permission Matrix)

---

## 1. Executive Summary
The goal of this flow is to implement a robust **Role-Based Access Control (RBAC)** system. This feature transforms FlowHub Core into an enterprise-ready platform and allows SDETs to showcase **Security Boundary Testing** and **Data Isolation validation**.

---

## 2. Personas (The Roles)

1.  **ADMIN**: The "Superuser." Can manage all items, view all activity logs, and manage user roles/accounts.
2.  **EDITOR**: The "Standard Worker." Can manage their own content (Create/Read/Update/Deactivate) and perform bulk operations on their own items.
3.  **VIEWER**: The "Read-Only User." Can explore the dashboard, item details, and their own activity logs but cannot modify any data.

---

## 3. Permission Matrix (The Source of Truth)

| Feature | ADMIN | EDITOR | VIEWER |
| :--- | :---: | :---: | :---: |
| **Login / Profile** | ✅ | ✅ | ✅ |
| **View Item List** | ✅ (All) | ✅ (All) | ✅ (All) |
| **View Item Details** | ✅ (All) | ✅ (All) | ✅ (All) |
| **Create New Item** | ✅ | ✅ | ❌ |
| **Edit Item** | ✅ (All) | ✅ (Own Only) | ❌ |
| **Deactivate/Activate Item** | ✅ (All) | ✅ (Own Only) | ❌ |
| **Bulk Operations** | ✅ (All) | ✅ (Own Only) | ❌ |
| **View Activity Logs** | ✅ (All) | ✅ (Own Only) | ✅ (Own Only) |
| **User Management** | ✅ | ❌ | ❌ |

---

## 4. Technical Architecture

### 4.1 Real-Time Security Guard (`authMiddleware.js`)
Unlike standard stateless JWTs, FlowHub implements a **Real-Time Database Presence Check**. For every request, the system verifies that the user ID in the token still exists in the database and `isActive` is `true`. This allows immediate session termination if a user is deleted or deactivated.

### 4.2 Authorization Engine (`rbacMiddleware.js`)
A centralized middleware that handles:
*   **Role Validation:** Ensures user belongs to allowed roles.
*   **Ownership Check (IDOR Prevention):** Verifies that non-admins can only modify resources they created.
*   **Security Masking:** Returns `404 Not Found` instead of `403 Forbidden` for inaccessible items to prevent information leakage (Resource existence discovery).

### 4.3 UI Adaptability
The frontend uses `useAuth().canPerform(action, resource)` to dynamically hide UI elements (buttons, sidebars) and prevent unauthorized interactions at the component level.

---

## 5. Security Guardrails (The "Senior" Layer)
*   **Self-Protection:** Admins are forbidden from deactivating or demoting their own accounts via the API.
*   **Audit Trail Integration:** Every unauthorized access attempt (IDOR or Role violation) is automatically logged in the `ActivityLog` for security audits.
*   **Role Change Propagation:** When a user's role is changed, the system forces a token refresh on the next request to apply new permissions.

---

## 6. SDET Automation Strategy
1.  **Permission Matrix Suite:** A data-driven test that logs in as each role and validates access to every core API endpoint.
2.  **IDOR Attack Simulation:** Verifying that `Editor_A` cannot modify `Item_B` even if they have the direct UUID.
3.  **Real-Time Revocation Test:** Automate deleting a user from the DB while they have an active session and verify their next request is blocked.
4.  **Admin Protection Validation:** Verify that an Admin's "Deactivate" button is disabled for their own row in the Users table.
