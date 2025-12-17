# PRD - Flow 10: Admin User Management

## 1. Overview
The User Management feature allows Administrators to oversee, monitor, and control all user accounts within FlowHub Core. This is the "Control Plane" for RBAC, enabling admins to promote, demote, or deactivate users.

## 2. User Journey
- **Access:** Only users with the `ADMIN` role can see the "Users" menu in the sidebar.
- **Monitoring:** Admin views a list of all registered users, including their names, emails, current roles, and last login timestamps.
- **Control:** Admin can change any user's role (e.g., promote a `VIEWER` to `EDITOR`).
- **Security:** Admin can deactivate a user account if needed.

## 3. Technical Architecture
### 3.1 API Endpoints
- `GET /api/v1/users`: Returns a paginated list of all users. (Admin Only)
- `PATCH /api/v1/users/:id/role`: Updates the `role` field of a specific user. (Admin Only)
- `DELETE /api/v1/users/:id`: Soft-deletes/deactivates a user account. (Admin Only)

### 3.2 Security Enforcement
- **Route Level:** `rbacMiddleware.authorize(['ADMIN'])` will be applied to all user management routes.
- **Audit Logging:** Every role change or deactivation will be logged in the `ActivityLog` (Flow 9).

## 4. UI Requirements
- **Users Table:** Displays `Name`, `Email`, `Role` (Badge), `Last Login`, and `Actions`.
- **Role Selector:** A dropdown within the table row to change roles instantly.
- **Protection:** If a non-admin tries to navigate to `/users`, they are redirected to the Dashboard with an "Unauthorized" toast.

## 5. SDET Automation Value
- **State Transition Testing:** Automate the flow of demoting an Admin to a Viewer and verifying they lose access to the User Management page immediately.
- **Data Integrity:** Verify that changing a user's role in the Admin UI correctly updates the `role` field in the DB and the user's session.
- **Negative Testing:** Verify that an `EDITOR` cannot call the `GET /api/v1/users` API (403 check).

