# PRD - Flow 9: Activity Logs

## 1. Overview
The Activity Logs feature provides a comprehensive audit trail for all significant actions within FlowHub Core. This serves as a critical observability layer for both users and SDET automated verification suites.

## 2. User Journey
- **Logging:** When a user performs an action (Create, Edit, Delete, Bulk, Login), the system asynchronously records the event.
- **Viewing (Viewer/Editor):** Users can access an "Activity Logs" page to see a chronological history of their own actions.
- **Viewing (Admin):** Admins can see a global dashboard of all activities across all users.

## 3. Technical Architecture
### 3.1 Data Model (`ActivityLog`)
- `userId`: Reference to User.
- `action`: String (e.g., `ITEM_CREATED`, `USER_LOGIN`).
- `resourceType`: String (e.g., `ITEM`, `USER`, `BULK_JOB`).
- `resourceId`: ID of the affected resource.
- `details`: Object containing specific metadata (e.g., field changes, bulk success counts).
- `ipAddress`: Captured from the request.
- `timestamp`: Defaults to now.

### 3.2 Non-Blocking Implementation
- The logging service is designed to be "Fire and Forget."
- Main business logic (e.g., saving an item) does NOT wait for the log to be persisted before returning a response to the user.

## 4. Security & RBAC
- **Data Isolation:** Non-admins can only query logs where `userId` matches their session ID.
- **Admin Visibility:** Admins can query any log.
- **IDOR Protection:** API endpoints enforce ownership checks on log retrieval.

## 5. SDET Automation Value
- **Audit Trail Validation:** Automation scripts can perform a UI action and then call the Activity API to verify that the system correctly recorded the audit entry.
- **Integrity Testing:** Ensures that sensitive operations (like Bulk Delete) always leave a traceable mark.
- **Security Testing:** Verifies that Viewers cannot see logs belonging to other users.

## 6. Performance Requirements
- **Logging Latency:** < 10ms impact on the main request.
- **Query Performance:** Indexed by `userId` and `timestamp` for fast retrieval.

