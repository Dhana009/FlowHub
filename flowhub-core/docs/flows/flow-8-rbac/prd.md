# PRD - Flow 8: Multi-Role Access Control (RBAC)

## 1. Executive Summary
The goal of this flow is to implement a robust **Role-Based Access Control (RBAC)** system. This will transform FlowHub Core from a single-user CRUD app into an enterprise-grade multi-tenant platform. This feature is specifically designed to showcase **Security Automation** and **Complex Permission Matrix Testing** for a Senior SDET role.

## 2. Personas (The Roles)
We will implement three distinct user roles with varying levels of authority:

1.  **ADMIN**: The "Superuser." Can perform every action in the system, including high-leverage bulk operations.
2.  **EDITOR**: The "Standard Worker." Can manage their own content (Create/Read/Update/Deactivate), but is forbidden from performing bulk destructive actions or global settings.
3.  **VIEWER**: The "Read-Only User." Can explore the dashboard and item details but cannot modify any data or see action-oriented UI elements.

## 3. Permission Matrix (The Source of Truth)

| Feature | ADMIN | EDITOR | VIEWER |
| :--- | :---: | :---: | :---: |
| **Login / Profile** | ✅ | ✅ | ✅ |
| **View Item List** | ✅ | ✅ | ✅ |
| **View Item Details** | ✅ | ✅ | ✅ |
| **Create New Item** | ✅ | ✅ | ❌ |
| **Edit Item** | ✅ | ✅ (Own Only) | ❌ |
| **Deactivate Item** | ✅ | ✅ (Own Only) | ❌ |
| **Activate Item** | ✅ | ✅ (Own Only) | ❌ |
| **Bulk Operations** | ✅ | ❌ | ❌ |

## 4. Technical Requirements

### 4.1 Backend Security (The "Security Guard")
*   **User Schema:** Add a `role` field with values: `ADMIN`, `EDITOR`, `VIEWER` (Default: `EDITOR`).
*   **Authorization Middleware:** A central `authorize(...roles)` function to guard Express routes.
*   **Route Locking:**
    *   `POST /api/v1/items`: Allowed for `ADMIN`, `EDITOR`.
    *   `PUT /api/v1/items/:id`: Allowed for `ADMIN`, or `EDITOR` (with ownership check).
    *   `DELETE /api/v1/items/:id`: Allowed for `ADMIN`, or `EDITOR` (with ownership check).
    *   `POST /api/v1/bulk-operations`: **ADMIN ONLY**.
*   **HTTP 403 Forbidden:** The API must return a clear 403 error if a user tries to call a route they are not authorized for.

### 4.2 Frontend Adaptability (The "Invisible UI")
*   **Role-Based Rendering:** The UI must hide buttons/features that the current user cannot access.
    *   `VIEWER`: Cannot see "Create Item," "Edit," "Deactivate," or "Activate" buttons.
    *   `EDITOR`: Cannot see the "Bulk Actions" bar even if items are selected.
*   **State Awareness:** The frontend must receive the `role` during login and store it securely in the `AuthContext`.

## 5. SDET Automation Showcase (The "Killer Scenarios")
This flow allows for the implementation of high-value automation cases:

1.  **Positive Role Validation:** Log in as each role and verify that authorized buttons are present.
2.  **Negative UI Validation (Masking):** Verify that a `VIEWER` physically cannot see the "Create Item" button.
3.  **Cross-Role API Breaking:** Log in as a `VIEWER`, grab a valid JWT, and try to manually `POST` to `/api/v1/bulk-operations`. Verify the system returns `403 Forbidden`.
4.  **Ownership Conflict:** Verify that `EDITOR_A` cannot edit an item created by `EDITOR_B` (Data Isolation).
5.  **Permission Escalation Prevention:** Verify that a user cannot change their own role via the `PUT /profile` API (if implemented).

## 6. Success Criteria
*   The system accurately distinguishes between roles at both the API and UI layers.
*   The "Bulk Operations" feature is safely locked to Admins only.
*   A "Viewer" has a 100% read-only experience.
*   Automation suite can execute a "Permission Matrix" test that validates all 24 combinations in the table above.

