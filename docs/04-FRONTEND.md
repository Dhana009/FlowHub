# Frontend UI Contracts
## Test Identifiers, Role Behavior, Routing

**Source:** Extracted from `flowhub-core/frontend/src/`

---

## API Usage Map

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

## Role-Based UI Behavior

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

## Routing & Navigation

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

## UI Test Identifiers

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

## Iframe (Embed URL) Behavior

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

**End of Frontend UI Contracts**
