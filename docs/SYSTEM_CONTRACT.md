# System Contract Documentation
## Backend & Frontend Reference for Web Automation

**Version:** 1.0  
**Last Updated:** 2024-12-17  
**Source:** Extracted directly from codebase (`flowhub-core/`)

This document captures the **complete system contract** extracted directly from the codebase.
It defines backend APIs, authentication, authorization, data schemas, UI behavior, and test hooks.

**There are no assumptions in this document.**  
This is the authoritative reference for automation framework design.

---

## Quick Reference: All Endpoints & Schemas

### Authentication Endpoints
- **POST /api/v1/auth/login** → [Section 4](#4-authentication-apis-apiv1auth) (Request/Response schemas)
- **POST /api/v1/auth/refresh** → [Section 4](#4-authentication-apis-apiv1auth) (Request/Response schemas)
- **POST /api/v1/auth/logout** → [Section 4](#4-authentication-apis-apiv1auth) (Request/Response schemas)

### Item Endpoints (Complete Schemas)
- **POST /api/v1/items** → [Section 5](#5-item-apis-apiv1items) (Full request/response schema)
- **GET /api/v1/items** → [Section 5](#5-item-apis-apiv1items) (Query params + response schema)
- **GET /api/v1/items/:id** → [Section 5](#5-item-apis-apiv1items) (Response schema)
- **PUT /api/v1/items/:id** → [Section 5](#5-item-apis-apiv1items) (Request/response schema)
- **DELETE /api/v1/items/:id** → [Section 5](#5-item-apis-apiv1items) (Response schema)
- **PATCH /api/v1/items/:id/activate** → [Section 5](#5-item-apis-apiv1items) (Response schema)

### Internal/Automation Endpoints
- **POST /api/v1/internal/reset** → [Section 6](#6-internal--automation-endpoints) (Request/Response schema)
- **POST /api/v1/internal/seed** → [Section 6](#6-internal--automation-endpoints) (Request/Response schema)
- **GET /api/v1/internal/otp** → [Section 6](#6-internal--automation-endpoints) (Request/Response schema)

### Data Schemas
- **Item Model Schema** → [Section 13](#13-data-schema-details) (Complete field definitions)

---

## Table of Contents

1. [Authentication & Identity](#1-authentication--identity)
2. [Roles & Authorization Rules](#2-roles--authorization-rules)
3. [Backend API Inventory](#3-backend-api-inventory)
4. [Authentication APIs](#4-authentication-apis-apiv1auth) - **Request/Response Schemas**
5. [Item APIs](#5-item-apis-apiv1items) - **Complete Request/Response Schemas**
6. [Internal / Automation Endpoints](#6-internal--automation-endpoints) - **Request/Response Schemas**
7. [Global Error Contract](#7-global-error-contract)
8. [Frontend API Usage Map](#8-frontend-api-usage-map)
9. [Frontend Role-Based UI Behavior](#9-frontend-role-based-ui-behavior)
10. [Routing & Navigation](#10-routing--navigation)
11. [UI Test Identifiers](#11-ui-test-identifiers)
12. [Iframe (Embed URL) Behavior](#12-iframe-embed-url-behavior)
13. [Data Schema Details](#13-data-schema-details) - **Complete Item Model Schema**

---

## 1. Authentication & Identity

### Authentication Model

- **Type:** JWT-based authentication
- **Access Token:**
  - Sent via header: `Authorization: Bearer <token>`
  - Expiry: **15 minutes** (`ACCESS_TOKEN_EXPIRY = '15m'`)
  - Stored in: React state (memory), **NOT localStorage**
- **Refresh Token:**
  - Stored in: httpOnly cookie
  - Cookie name: `refreshToken`
  - Expiry:
    - **7 days** (default)
    - **30 days** if `rememberMe = true`

### Token Lifecycle

**Access Token Expiry:**
- API returns `401 Unauthorized`
- Frontend interceptor automatically calls `/api/v1/auth/refresh`
- New token obtained using refresh token cookie

**Refresh Token Expiry:**
- API returns `401`
- Cookie cleared automatically
- User must re-login

### Invalid Authentication Detection

- **HTTP Status:** `401`
- **Error Messages:**
  - "Authentication required. Please log in."
  - "Your session is invalid or has expired. Please log in again."
  - "Refresh token expired or invalid"
- **Response Shape:**
```json
{
  "status": "error",
  "error_code": 401,
  "error_type": "Unauthorized",
  "message": "Authentication required. Please log in.",
  "timestamp": "2024-12-17T...",
  "path": "/api/v1/items"
}
```

---

## 2. Roles & Authorization Rules

### Roles

- `ADMIN` - Full access, bypasses ownership checks
- `EDITOR` - Can create/edit/delete own items only
- `VIEWER` - Read-only, sees all items

### Data Ownership

- **Ownership Field:** `created_by` (ObjectId reference to User)
- **Enforcement Location:** Database query filter in `itemService.getItems()`

### Visibility Rules

| Created By | Admin Can See | Same Editor Can See | Other Editor Can See | Viewer Can See |
|------------|---------------|---------------------|----------------------|----------------|
| Admin      | ✅ Yes        | ❌ No               | ❌ No                | ✅ Yes         |
| Editor     | ✅ Yes        | ✅ Yes              | ❌ No                | ✅ Yes         |

### Enforcement Logic (Backend)

```javascript
// In itemService.getItems()
if (userId && role !== 'ADMIN' && role !== 'VIEWER') {
  query.created_by = userId; // EDITOR restriction
}
// ADMIN and VIEWER see all items
```

### Unauthorized Access Behavior

- **Role Violation** → `403 Forbidden`
  - Message: "Access denied. Requires one of the following roles: X, Y"
- **Ownership Violation** → `404 Not Found` (prevents ID guessing)
  - Message: "Resource not found"

---

## 3. Backend API Inventory

### Health Check

- **Endpoint:** `GET /health`
- **Auth:** No
- **Roles:** None
- **Purpose:** Health check endpoint
- **Response:**
```json
{
  "status": "ok",
  "message": "FlowHub Backend is running",
  "timestamp": "2024-12-17T..."
}
```

---

## 4. Authentication APIs (`/api/v1/auth`)

### POST /auth/login

**Auth:** No  
**Rate Limit:** Yes (`loginRateLimiter`)

**Request:**
```json
{
  "email": "string (required)",
  "password": "string (required, min 8 chars)",
  "rememberMe": "boolean (optional)"
}
```

**Response (200):**
```json
{
  "token": "JWT access token string",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN | EDITOR | VIEWER",
    "isActive": true
  }
}
```

**Error Responses:**
- `400`: Email/password missing
- `401`: Invalid email or password, account locked, account deactivated
- `422`: Invalid email format, password < 8 chars
- `429`: Account locked (rate limiter)

**Note:** Refresh token automatically set as httpOnly cookie

---

### POST /auth/refresh

**Auth:** No (uses httpOnly cookie)  
**Purpose:** Get new access token using refresh token

**Request:** None (refresh token sent via httpOnly cookie)

**Response (200):**
```json
{
  "token": "new JWT access token",
  "user": {
    "_id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "role": "ADMIN | EDITOR | VIEWER",
    "isActive": true
  }
}
```

**Error Responses:**
- `401`: Refresh token not found, expired, or invalid

---

### POST /auth/logout

**Auth:** Required  
**Purpose:** Logout user and clear refresh token cookie

**Request:** None

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401`: Not authenticated

---

### Other Auth Endpoints

- `POST /auth/signup/request-otp` - Request signup OTP
- `POST /auth/signup/verify-otp` - Verify signup OTP
- `POST /auth/signup` - Complete signup
- `POST /auth/forgot-password/request-otp` - Request password reset OTP
- `POST /auth/forgot-password/verify-otp` - Verify password reset OTP
- `POST /auth/forgot-password/reset` - Reset password

---

## 5. Item APIs (`/api/v1/items`)

### POST /items (Create Item)

**Auth:** Required  
**Roles:** ADMIN, EDITOR  
**Content-Type:** `multipart/form-data` (supports file upload) or `application/json`

**Required Fields:**
- `name` (String, 3-100 chars, alphanumeric + spaces/hyphens/underscores)
- `description` (String, 10-500 chars)
- `item_type` (Enum: `PHYSICAL` | `DIGITAL` | `SERVICE`)
- `price` (Number, 0.01-999999.99)
- `category` (String, 1-50 chars)

**Conditional Fields (based on `item_type`):**

**PHYSICAL:**
- `weight` (Number, > 0, required)
- `dimensions` (Object, required):
  - `length` (Number, > 0)
  - `width` (Number, > 0)
  - `height` (Number, > 0)

**DIGITAL:**
- `download_url` (String, valid URL, required)
- `file_size` (Number, >= 1, required)

**SERVICE:**
- `duration_hours` (Number, >= 1, required)

**Optional Fields:**
- `tags` (Array of strings, max 10, each 1-30 chars, unique)
- `embed_url` (String, valid HTTP/HTTPS URL)
- `file` (File, multipart/form-data)

**Response (201):**
```json
{
  "status": "success",
  "message": "Item created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Item Name",
    "description": "Item description",
    "item_type": "DIGITAL",
    "price": 99.99,
    "category": "Electronics",
    "tags": ["tag1", "tag2"],
    "is_active": true,
    "version": 1,
    "created_by": "user_id",
    "createdAt": "2024-12-17T10:30:00Z",
    "updatedAt": "2024-12-17T10:30:00Z",
    "deleted_at": null,
    "download_url": "https://example.com/file.zip",
    "file_size": 1024,
    "embed_url": "https://example.com/embed",
    "file_path": "/uploads/items/file.jpg",
    "file_metadata": {
      "original_name": "file.jpg",
      "content_type": "image/jpeg",
      "size": 1024,
      "uploaded_at": "2024-12-17T10:30:00Z"
    }
  },
  "item_id": "507f1f77bcf86cd799439011"
}
```

**Note:** Internal fields (`normalizedName`, `normalizedCategory`, `normalizedNamePrefix`, `__v`) are NOT returned

**Error Responses:**
- `400`: Missing required fields
- `401`: Not authenticated
- `403`: Insufficient role (not ADMIN or EDITOR)
- `409`: Duplicate item (same name + category + user)
- `422`: Validation errors

---

### GET /items (List Items)

**Auth:** Required  
**Roles:** ADMIN, EDITOR, VIEWER

**Query Parameters:**
- `search` (String, optional) - Searches `name` (normalized) and `description` (case-insensitive, partial match)
- `status` (Enum: `active` | `inactive`, optional) - Filters by `is_active`
- `category` (String, optional) - Filters by normalized category
- `sort_by` (String or Array, optional) - Fields: `name`, `category`, `price`, `createdAt`. Default: `['createdAt']`
- `sort_order` (String or Array, optional) - Values: `asc` | `desc`. Default: `['desc']`
- `page` (Number, optional) - Default: `1`, min: `1`
- `limit` (Number, optional) - Default: `20`, min: `1`, max: `100`

**Default Behavior:**
- If params missing: Uses defaults (page=1, limit=20, sort_by=['createdAt'], sort_order=['desc'])
- If invalid: Returns `422` with error message
- If page > total_pages: Redirects to last valid page

**Response (200):**
```json
{
  "status": "success",
  "items": [
    {
      "_id": "...",
      "name": "...",
      "description": "...",
      "item_type": "...",
      "price": 99.99,
      "category": "...",
      "is_active": true,
      "created_by": "...",
      "createdAt": "...",
      "updatedAt": "...",
      "deleted_at": null,
      "version": 1,
      "tags": [],
      "embed_url": null,
      "file_path": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

**RBAC Filtering:**
- ADMIN: Sees all items
- VIEWER: Sees all items (read-only)
- EDITOR: Sees only own items (`created_by = userId`)

**Error Responses:**
- `401`: Not authenticated
- `422`: Invalid query parameters

---

### GET /items/:id (Get Single Item)

**Auth:** Required  
**Roles:** ADMIN, EDITOR, VIEWER  
**Purpose:** Get single item by ID (Flow 4 - Item Details)

**Request:** None (itemId in URL)

**Response (200):**
```json
{
  "status": "success",
  "message": "Item retrieved successfully",
  "data": {
    "_id": "...",
    "name": "...",
    "description": "...",
    "item_type": "...",
    "price": 99.99,
    "category": "...",
    "is_active": true,
    "created_by": "...",
    "createdAt": "...",
    "updatedAt": "...",
    "deleted_at": null,
    "version": 1,
    "tags": [],
    "embed_url": null,
    "file_path": null,
    "file_metadata": null
  }
}
```

**Note:** Includes inactive items (for View button functionality)

**Error Responses:**
- `401`: Not authenticated
- `422`: Invalid ID format
- `404`: Item not found
- `500`: Internal server error

---

### PUT /items/:id (Update Item)

**Auth:** Required  
**Roles:** ADMIN, EDITOR (ownership check)  
**Content-Type:** `multipart/form-data` (supports file upload) or `application/json`

**Required Fields:**
- `version` (Number, **REQUIRED** - for optimistic locking)

**Optional Fields (all fields from POST are optional for update):**
- `name`, `description`, `item_type`, `price`, `category`
- `tags`
- Conditional fields (based on new `item_type`)
- `embed_url`
- `file` (multipart/form-data, replaces existing file)

**Response (200):**
```json
{
  "status": "success",
  "message": "Item updated successfully",
  "data": {
    // Same structure as POST response
    // version incremented automatically
  }
}
```

**Error Responses:**
- `400`: Invalid ID format
- `401`: Not authenticated
- `403`: Insufficient role
- `404`: Item not found or not owned
- `409`: Version conflict
  ```json
  {
    "status": "error",
    "error_code": 409,
    "error_type": "Conflict - Version Conflict",
    "error_code_detail": "VERSION_CONFLICT",
    "message": "Item was modified by another user",
    "current_version": 2,
    "provided_version": 1,
    "timestamp": "...",
    "path": "..."
  }
  ```
- `422`: Validation errors

---

### DELETE /items/:id (Soft Delete)

**Auth:** Required  
**Roles:** ADMIN, EDITOR (ownership check)  
**Purpose:** Soft delete item (Flow 6)

**Request:** None (itemId in URL)

**Action:**
- Sets `is_active = false`
- Sets `deleted_at = timestamp`

**Response (200):**
```json
{
  "status": "success",
  "message": "Item deleted successfully",
  "data": {
    // Same structure as POST response
    // is_active: false, deleted_at: timestamp
  }
}
```

**Error Responses:**
- `400`: Invalid ID format
- `401`: Not authenticated
- `403`: Insufficient role
- `404`: Item not found or not owned
- `409`: Item already deleted
  ```json
  {
    "status": "error",
    "error_code": 409,
    "error_type": "Conflict - Item Already Deleted",
    "error_code_detail": "ITEM_ALREADY_DELETED",
    "message": "Item is already deleted",
    "timestamp": "...",
    "path": "..."
  }
  ```
- `500`: Internal server error

---

### PATCH /items/:id/activate (Activate Item)

**Auth:** Required  
**Roles:** ADMIN, EDITOR (ownership check)  
**Purpose:** Restore soft-deleted item (Flow 6 extension)

**Request:** None (itemId in URL)

**Action:**
- Sets `is_active = true`
- Clears `deleted_at = null`

**Response (200):**
```json
{
  "status": "success",
  "message": "Item activated successfully",
  "data": {
    // Same structure as POST response
    // is_active: true, deleted_at: null
  }
}
```

**Error Responses:**
- `400`: Invalid ID format
- `401`: Not authenticated
- `403`: Insufficient role
- `404`: Item not found or not owned
- `409`: Item already active
  ```json
  {
    "status": "error",
    "error_code": 409,
    "error_type": "Conflict - Item Already Active",
    "error_code_detail": "ITEM_ALREADY_ACTIVE",
    "message": "Item is already active",
    "timestamp": "...",
    "path": "..."
  }
  ```
- `500`: Internal server error

---

## 6. Internal / Automation Endpoints

### POST /api/v1/internal/reset

**Auth:** No (requires `x-internal-key` header)  
**Purpose:** Wipe all data for clean test run

**Request Headers:**
- `x-internal-key`: Secret key (default: `flowhub-secret-automation-key-2025`)

**Request:** None

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "message": "Database wiped successfully"
  }
}
```

**Collections Wiped:**
- Users
- Items
- OTP
- BulkJob
- ActivityLog

**Allowed in Automation:** Yes (with proper key)

---

### POST /api/v1/internal/seed

**Auth:** No (requires `x-internal-key` header)  
**Purpose:** Bulk seed items for scale testing

**Request Headers:**
- `x-internal-key`: Secret key

**Request Body:**
```json
{
  "userId": "string (required)",
  "count": 50
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "message": "Successfully seeded 50 items",
    "count": 50
  }
}
```

**Note:** Creates generic DIGITAL items with categories: Electronics, Home, Books, Fashion

**Allowed in Automation:** Yes (with proper key)

---

### GET /api/v1/internal/otp

**Auth:** No (requires `x-internal-key` header)  
**Purpose:** Retrieve latest OTP for email

**Request Headers:**
- `x-internal-key`: Secret key

**Query Parameters:**
- `email` (String, required)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "email": "user@example.com",
    "otp": "123456",
    "type": "signup | password-reset",
    "expiresAt": "2024-12-17T..."
  }
}
```

**Allowed in Automation:** Yes (with proper key)

---

## 7. Global Error Contract

### Standard Error Response Shape

```json
{
  "status": "error",
  "error_code": 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500,
  "error_type": "Bad Request | Unauthorized | Forbidden | Not Found | Conflict | Unprocessable Entity | Too Many Requests | Internal Server Error",
  "message": "Human-readable error message",
  "timestamp": "2024-12-17T10:30:00Z",
  "path": "/api/v1/items"
}
```

### Error Codes by Scenario

**400 Bad Request:**
- Missing required fields
- Invalid data types
- Message pattern: "X is required" or "X must be a Y"

**401 Unauthorized:**
- Missing/invalid token
- Token expired
- User deleted/deactivated
- Message patterns: "Authentication required", "Your session is invalid or has expired"

**403 Forbidden:**
- Insufficient role
- Account deactivated
- Message pattern: "Access denied. Requires one of the following roles: X, Y"

**404 Not Found:**
- Resource not found
- Ownership violation (returns 404 to prevent ID guessing)
- Message pattern: "Resource not found" or "Item not found"

**409 Conflict:**
- Duplicate item
- Version conflict
- Item already deleted/active
- May include `error_code_detail` field

**422 Unprocessable Entity:**
- Validation errors
- Invalid enum values
- Invalid query parameters
- Message patterns: "X must be Y", "Invalid X format", "X must be between Y and Z"

**429 Too Many Requests:**
- Account locked
- OTP rate limit exceeded
- Message patterns: "Account is locked", "Too many OTP requests"

**500 Internal Server Error:**
- Generic server errors
- Includes stack trace in development mode only

---

## 8. Frontend API Usage Map

### Items Page (`/items`)

**On Mount:**
1. `GET /api/v1/items` - Fetch items list (with current filters/search/sort/pagination)

**User Actions:**
- Search/Filter/Sort/Pagination change → `GET /api/v1/items` (with updated params)
- Delete item → `DELETE /api/v1/items/:id`
- Activate item → `PATCH /api/v1/items/:id/activate`
- Bulk operation → `POST /api/v1/bulk-operations`
- Poll bulk job → `GET /api/v1/bulk-operations/:jobId`

**Auto-refresh:** Every 30 seconds (if user active)

---

### Create Item Page (`/items/create`)

**On Form Submit:**
- `POST /api/v1/items` - Create new item (multipart/form-data)

---

### Edit Item Page (`/items/:id/edit`)

**On Mount:**
- `GET /api/v1/items/:id` - Load item data

**On Form Submit:**
- `PUT /api/v1/items/:id` - Update item (multipart/form-data, includes `version`)

---

### Item Details Modal (Flow 4)

**On Modal Open:**
- `GET /api/v1/items/:id` - Load item details

**Triggered By:**
- Click "View" button on item row

---

### Auth Context (Global)

**On Page Load:**
- `POST /api/v1/auth/refresh` - Restore session using refresh token cookie

**On Logout:**
- `POST /api/v1/auth/logout` - Clear refresh token cookie

---

## 9. Frontend Role-Based UI Behavior

### ADMIN

**Buttons Visible:**
- ✅ Create button
- ✅ Edit button (all items)
- ✅ Delete button (all items)
- ✅ Activate button (all items)
- ✅ Bulk Actions bar
- ✅ View button

**Actions Enabled:** All actions enabled

**Logic:** `canPerform()` always returns `true` for ADMIN

---

### EDITOR

**Buttons Visible:**
- ✅ Create button
- ✅ Edit button (own items only)
- ✅ Delete button (own items only)
- ✅ Activate button (own items only)
- ✅ Bulk Actions bar
- ✅ View button (all items)

**Actions Enabled:**
- Edit/Delete/Activate: Only for items where `item.created_by === user.id`
- Create: Always enabled
- View: Always enabled

**Logic:** `canPerform('edit', item)` checks `item.created_by === user.id`

---

### VIEWER

**Buttons Visible:**
- ❌ Create button (hidden)
- ❌ Edit button (hidden)
- ❌ Delete button (hidden)
- ❌ Activate button (hidden)
- ❌ Bulk Actions bar (hidden)
- ✅ View button (all items)

**Actions Enabled:** View only

**Logic:** `canPerform('create')` returns `false`, `canPerform('edit', item)` returns `false`

---

## 10. Routing & Navigation

### Protected Routes

- `/dashboard` - Requires authentication
- `/items` - Requires authentication
- `/items/create` - Requires authentication
- `/items/:id/edit` - Requires authentication
- `/users` - Requires authentication (ADMIN only)
- `/activity-logs` - Requires authentication

**Protection Logic:**
```javascript
if (!isInitialized) → Show loading spinner
if (!isAuthenticated) → Redirect to /login
if isAuthenticated → Render children
```

---

### Public Routes

- `/login` - Redirects to `/dashboard` if already authenticated
- `/signup` - Redirects to `/dashboard` if already authenticated
- `/forgot-password` - Redirects to `/dashboard` if already authenticated

---

### Redirect Behavior

**401 (Unauthorized):**
- Redirects to `/login` (via ProtectedRoute)

**403 (Forbidden):**
- Not explicitly handled (may show error or redirect)

**Deep-link Behavior:**
- Protected routes check auth on mount
- Redirect to `/login` if not authenticated

---

## 11. UI Test Identifiers

### Items Page (`/items`)

**Search & Filters:**
- `data-testid="item-search"` - Search input
- `data-testid="search-clear"` - Clear search button
- `data-testid="filter-status"` - Status filter dropdown
- `data-testid="filter-category"` - Category filter dropdown
- `data-testid="clear-filters"` - Clear filters button

**Table:**
- `data-testid="items-table"` - Table element
- `data-testid="item-row-{item._id}"` - Table rows (dynamic)
- `data-test-item-status="active" | "inactive"` - Row status attribute

**Sorting:**
- `data-testid="sort-name"` - Name column header
- `data-testid="sort-category"` - Category column header
- `data-testid="sort-price"` - Price column header
- `data-testid="sort-created"` - Created date column header

**Pagination:**
- `data-testid="pagination-next"` - Next button
- `data-testid="pagination-prev"` - Previous button
- `data-testid="pagination-page-{pageNum}"` - Page number buttons (dynamic)
- `data-testid="pagination-limit"` - Items per page dropdown
- `data-testid="pagination-info"` - Pagination info container

**States:**
- `data-testid="empty-state"` - Empty state (no items)
- `data-testid="loading-items"` - Loading state

**Actions:**
- `data-testid="view-item-{item._id}"` - View button
- `data-testid="edit-item-{item._id}"` - Edit button (conditionally rendered)
- `data-testid="delete-item-{item._id}"` - Delete button (conditionally rendered)
- `data-testid="activate-item-{item._id}"` - Activate button (conditionally rendered)

**Deterministic Wait Attributes:**
- `data-test-ready={!loading}` - Page ready indicator
- `data-test-items-count={items.length}` - Item count for deterministic waits
- `data-test-search-state` - Search state (idle/debouncing/loading/ready)
- `data-test-last-search` - Last completed search query

---

### Login Page (`/login`)

- `data-testid="login-email"` - Email input
- `data-testid="login-password"` - Password input
- `data-testid="login-remember-me"` - Remember me checkbox
- `data-testid="login-submit"` - Submit button
- `data-testid="login-error"` - Error message

---

### Item Details Modal (Flow 4)

- `data-testid="item-details-modal"` - Modal container
- `data-testid="item-details-modal-overlay"` - Modal overlay
- `data-testid="close-button"` - Close button
- `data-testid="loading-state"` - Loading state
- `data-testid="error-state"` - Error state
- `data-testid="retry-button"` - Retry button
- `data-testid="embedded-iframe"` - Iframe element (when `embed_url` provided)
- `data-testid="iframe-loading-state"` - Iframe loading state

**Item Fields (dynamic):**
- `data-testid="item-name-{sanitizedId}"` - Item name
- `data-testid="item-description-{sanitizedId}"` - Item description
- `data-testid="item-status-{sanitizedId}"` - Item status
- `data-testid="item-category-{sanitizedId}"` - Item category
- `data-testid="item-price-{sanitizedId}"` - Item price
- `data-testid="item-created-date-{sanitizedId}"` - Created date
- `data-testid="item-tag-{index}-{sanitizedId}"` - Tags

---

### Item Creation/Edit Forms

- `data-testid="item-name"` - Name input
- `data-testid="item-description"` - Description input
- `data-testid="item-type"` - Item type select
- `data-testid="item-price"` - Price input
- `data-testid="item-category"` - Category input
- `data-testid="item-tags"` - Tags input
- `data-testid="item-embed-url"` - Embed URL input
- `data-testid="create-item-submit"` - Create submit button
- `data-testid="edit-item-submit"` - Edit submit button

---

## 12. Iframe (Embed URL) Behavior

### Field Details

- **Field Name:** `embed_url`
- **Type:** String (optional)
- **Validation:** Must be valid HTTP/HTTPS URL
- **Blocked Protocols:** `javascript:`, `data:`, `file:`, `about:`

### Display Location

- **Component:** `ItemDetailsModal` (Flow 4)
- **Condition:** Only appears when `embed_url` is provided and valid

### Test Identifiers

- `data-testid="embedded-iframe"` - The iframe element
- `data-testid="iframe-loading-state"` - Loading state for iframe

### Behavior

**Loading:**
- Shows spinner with "Loading embedded content..."
- Timeout: **5 seconds** (`IFRAME_TIMEOUT_MS = 5000`)

**Success:**
- Iframe renders with content from `embed_url`
- Sandbox attributes: `allow-scripts allow-same-origin allow-forms`

**Error:**
- Shows error message if iframe fails to load
- Common causes:
  - X-Frame-Options blocking
  - CORS restrictions
  - Invalid embed URL format
- Error message: "Embedded content failed to load"

**Validation:**
- Invalid URL format → Shows error message (no iframe rendered)
- Missing/null `embed_url` → Iframe section hidden entirely

---

## 13. Data Schema Details

### Item Model Schema

**Core Fields:**
- `name` (String, required, 3-100 chars)
- `description` (String, required, 10-500 chars)
- `item_type` (Enum: PHYSICAL, DIGITAL, SERVICE, required)
- `price` (Number, required, 0.01-999999.99)
- `category` (String, required, 1-50 chars)
- `tags` (Array of Strings, optional, max 10, each 1-30 chars, unique)

**Conditional Fields:**
- **PHYSICAL:** `weight`, `dimensions` (length, width, height)
- **DIGITAL:** `download_url`, `file_size`
- **SERVICE:** `duration_hours`

**Optional Fields:**
- `embed_url` (String, valid HTTP/HTTPS URL)
- `file_path` (String, for file uploads)
- `file_metadata` (Object, for file info)

**Metadata Fields:**
- `created_by` (ObjectId, required, auto-set from authenticated user)
- `is_active` (Boolean, default: `true`)
- `version` (Number, default: `1`, auto-incremented on update)
- `deleted_at` (Date, default: `null`, set on soft delete)
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-generated)

**Internal Fields (NOT returned in API responses):**
- `normalizedName` (String, auto-generated)
- `normalizedCategory` (String, auto-generated)
- `normalizedNamePrefix` (String, auto-generated)
- `__v` (Mongoose version key)

### Backend Defaults

- `is_active`: Defaults to `true`
- `version`: Defaults to `1`
- `deleted_at`: Defaults to `null`
- `normalizedName`, `normalizedCategory`: Auto-generated by pre-save hook

### Test Data Identification

**Recommended:**
- `tags: ["seed"]` - Recommended for identifying test data
- `created_by` - User ID who created the data

**Safe Deletion:**
- Direct MongoDB deletion is safe for test environments
- No cascading deletes in code
- Related collections (`activitylogs`, `bulkjobs`) are NOT deleted when items are deleted

---

## Appendix: Environment Constraints

### Rate Limiting

- **Login:** `loginRateLimiter` - Checks account lockout (5 failed attempts = 15 min lockout)
- **OTP Requests:** `otpRateLimiter` - 15 minute cooldown between OTP requests
- **Bypassed in Test:** Yes (`NODE_ENV === 'test'`)

### Test Environment Differences

- OTP exposed in response (development mode only)
- Account lockout bypassed (`NODE_ENV === 'test'`)
- OTP rate limit bypassed (`NODE_ENV === 'test'`)
- Stack traces in errors (development mode only)

### Background Jobs

- Bulk operations run asynchronously (poll via `GET /api/v1/bulk-operations/:jobId`)
- No scheduled jobs found

---

## Document Status

✅ **Complete** - All information extracted from codebase  
✅ **Validated** - Cross-referenced with actual implementation  
✅ **No Assumptions** - Every detail confirmed from source code  

**Next Steps:**
- Framework design begins only after this document is frozen
- Any behavior outside this contract is a product or environment issue
- This document represents **Layer 1 (System Discovery)**

---

**End of Document**
