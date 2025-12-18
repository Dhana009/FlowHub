# **Master API Registry: Flow-by-Flow Specification**

This document maps the 10 core business flows to their respective API contracts.

---

## **Flow 1: Identity & Access (Auth)**
*Handles the entire user lifecycle from registration to session management.*
*   **Step 1 (Request OTP):** `POST /auth/signup/request-otp` | Payload: `{email}`
*   **Step 2 (Verify OTP):** `POST /auth/signup/verify-otp` | Payload: `{email, otp}`
*   **Step 3 (Signup):** `POST /auth/signup` | Payload: `{firstName, lastName, email, password, otp, role}`
*   **Login:** `POST /auth/login` | Payload: `{email, password, rememberMe}`
*   **Logout:** `POST /auth/logout` | Header: `Bearer Token`

---

## **Flow 2: Item Ingestion (Creation)**
*The entry point for data. Uses multipart for file support.*
*   **Endpoint:** `POST /items`
*   **Payload:** `multipart/form-data`
*   **Mandatory:** `name`, `description`, `item_type`, `price`, `category`
*   **Conditional:** 
    *   `PHYSICAL` -> `weight`, `length`, `width`, `height`
    *   `DIGITAL` -> `download_url`, `file_size`
    *   `SERVICE` -> `duration_hours`

---

## **Flow 3: Search & Discovery (Filtering)**
*The heavy-lifting GET request for the main table.*
*   **Endpoint:** `GET /items`
*   **Query Params:** `search`, `status` (active/inactive), `category`, `page`, `limit`
*   **Sorting:** `sort_by` (field name), `sort_order` (asc/desc)

---

## **Flow 4: Resource Inspection (View)**
*Retrieve full object details.*
*   **Endpoint:** `GET /items/:id`
*   **Success:** 200 OK with full `Item` JSON object.
*   **Error:** 404 if item doesn't exist or user lacks permission.

---

## **Flow 5: State Mutation (Update)**
*Handles modifications with Optimistic Locking.*
*   **Endpoint:** `PUT /items/:id`
*   **Mandatory:** `version` (Must match current DB version)
*   **Error:** 409 `VERSION_CONFLICT` if version mismatch detected.

---

## **Flow 6: Lifecycle Management (Delete/Restore)**
*Soft-deletion and recovery.*
*   **Delete:** `DELETE /items/:id` (Sets `is_active: false`)
*   **Restore:** `PATCH /items/:id/activate` (Sets `is_active: true`)

---

## **Flow 7: Batch Processing (Bulk)**
*Asynchronous handling of multiple items.*
*   **Initiate:** `POST /bulk-operations` | Payload: `{operation, itemIds[]}`
*   **Monitor:** `GET /bulk-operations/:jobId` (Returns `progress` and `status: completed`)

---

## **Flow 8: Security Compliance (RBAC)**
*Verifying permission boundaries.*
*   **Enforcement:** All `/items` mutations return **403 Forbidden** for `VIEWER` role.
*   **Data Isolation:** `EDITOR` can only mutate items they created (`created_by`).

---

## **Flow 9: System Audit (Activity Logs)**
*Observability for security teams.*
*   **Endpoint:** `GET /activities`
*   **Content:** Chronological log of `USER_LOGIN`, `ITEM_CREATE`, `BULK_START`, etc.

---

## **Flow 10: Governance (Admin User Management)**
*The Control Plane for account access.*
*   **List Users:** `GET /users` (Admin Only)
*   **Change Role:** `PATCH /users/:id/role` | Payload: `{role}`
*   **Disable Account:** `PATCH /users/:id/status` | Payload: `{isActive: false}`
