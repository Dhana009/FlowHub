# FlowHub Application - Complete QA Answers for Web Automation

**Date:** Generated for Automation Testing  
**Purpose:** Comprehensive answers to all application questions for test automation

---

## Flow 1: Authentication

### What happens after successful login?
- **Redirect:** User is redirected to `/dashboard` (Dashboard page)
- **Dashboard shows:**
  - Stats cards (Total Items, Active Items, Inactive Items)
  - Quick actions (Create Item, View Items)
  - Recent activity feed
- **No direct redirect to Items List** - user must navigate via menu or quick actions

### Is there a "Remember Me" option?
- **Yes** - Checkbox on login form
- **Location:** `data-testid="login-remember-me"`
- **Behavior:**
  - **Checked:** Refresh token expires in **30 days** (session persists across browser restarts)
  - **Unchecked:** Refresh token expires in **7 days** (default)
  - JWT access token always expires in **15 minutes** (regardless of Remember Me)

### Session timeout duration?
- **JWT Access Token:** 15 minutes
- **Refresh Token:** 
  - 7 days (default, Remember Me unchecked)
  - 30 days (if Remember Me checked)
- **Auto-refresh:** System automatically refreshes expired JWT using refresh token
- **No auto-logout:** Session persists until user logs out or refresh token expires
- **Account Lockout:** 15 minutes after 5 failed login attempts

### Can users change passwords?
- **Yes** - Via "Forgot Password" flow (not a direct "Change Password" feature)
- **Flow:**
  1. User clicks "Forgot password?" link on login page
  2. Request OTP: `POST /auth/forgot-password/request-otp`
  3. Verify OTP: `POST /auth/forgot-password/verify-otp`
  4. Reset password: `POST /auth/forgot-password/reset`
- **Password requirements:** Same as signup (min 8 chars, uppercase, lowercase, number, special char)
- **Validation:** New password must be different from current password

### Is there email verification?
- **Yes** - OTP-based email verification during signup
- **Flow:**
  1. Request OTP: `POST /auth/signup/request-otp`
  2. Verify OTP: `POST /auth/signup/verify-otp`
  3. Complete signup: `POST /auth/signup`
- **OTP expiration:** 10 minutes
- **OTP format:** 6 digits (100000-999999)

---

## Flow 2: Item Creation

### What fields are in the create form?

**Required Fields:**
- **Name** (text, 3-100 chars, alphanumeric + spaces/hyphens/underscores)
- **Description** (text, 10-500 chars)
- **Item Type** (dropdown: PHYSICAL, DIGITAL, SERVICE)
- **Price** (number, min 0.01, max 999999.99, 2 decimal places)
- **Category** (text, 1-50 chars, normalized to Title Case)

**Optional Fields:**
- **Tags** (comma-separated string, max 10 tags, each 1-30 chars)
- **Embed URL** (optional, for iframe content in details modal)
- **File Upload** (optional, see file types below)

**Conditional Fields (based on Item Type):**

**If PHYSICAL:**
- Weight (kg, number, min 0.01)
- Dimensions: Length, Width, Height (cm, each min 0.01)

**If DIGITAL:**
- Download URL (required if DIGITAL)
- File Size (bytes, required if DIGITAL)

**If SERVICE:**
- Duration (hours, integer, min 1, required if SERVICE)

### Which fields are mandatory vs optional?

**Mandatory:**
- Name ✅
- Description ✅
- Item Type ✅
- Price ✅
- Category ✅
- Conditional fields based on type (Weight/Dimensions for PHYSICAL, Download URL/File Size for DIGITAL, Duration for SERVICE)

**Optional:**
- Tags
- Embed URL
- File Upload

### What file types are allowed for upload?
- **Allowed types:** `.jpg`, `.jpeg`, `.png`, `.pdf`, `.doc`, `.docx`
- **File size limits:**
  - **Min:** 1 KB
  - **Max:** 5 MB
- **Validation:** Real-time on file selection
- **Test ID:** `data-testid="item-file-upload"`

### Is it single-step or multi-step form?
- **Single-step form** - All fields on one page
- **Conditional rendering** - Fields show/hide based on Item Type selection

### Are there conditional fields?
- **Yes** - Based on Item Type:
  - **PHYSICAL** → Shows Weight + Dimensions (Length, Width, Height)
  - **DIGITAL** → Shows Download URL + File Size
  - **SERVICE** → Shows Duration (hours)
- **Test IDs:**
  - `data-testid="physical-fields"`
  - `data-testid="digital-fields"`
  - `data-testid="service-fields"`

### Real-time validation or on submit?
- **Both:**
  - **Real-time:** Validation on blur (when field loses focus)
  - **On submit:** Full form validation before API call
- **Error display:** Errors shown below each field with `data-testid="field-error"`

---

## Flow 3: Item List

### What columns are shown in the table?

**Required Columns:**
- **Name** (full text, sortable, searchable)
- **Description** (truncated to 100 chars, tooltip on hover, NOT sortable)
- **Status** (badge: Active/Inactive, color-coded, NOT sortable)
- **Category** (text, sortable, filterable)
- **Price** (currency format: $X.XX, sortable)
- **Created Date** (MM/DD/YYYY format, sortable)
- **Actions** (View, Edit, Delete buttons)

**Optional Columns (can be toggled):**
- Updated Date
- Created By
- Tags

### Which columns are sortable?
- **Sortable:** Name, Category, Price, Created Date
- **NOT Sortable:** Description, Status, Actions
- **Sort indicators:** Visual arrows (↑ ↓) on sortable headers
- **Test IDs:** `data-testid="sort-{fieldName}"`

### How many items per page (pagination)?
- **Default:** 20 items per page
- **Configurable:** User can change page size
- **Options:** Likely 10, 20, 50, 100 (need to verify in code)
- **Test ID:** `data-testid="pagination-limit"`
- **Pagination controls:**
  - Previous: `data-testid="pagination-prev"`
  - Next: `data-testid="pagination-next"`
  - Page numbers: `data-testid="pagination-page-{number}"`

### What can you search by?
- **Search fields:** Name and Description
- **Name search:** Normalized (lowercase, trimmed, whitespace normalized) and searched against `normalizedName` field
- **Description search:** Original query (trimmed) searched against `description` field
- **Test ID:** `data-testid="item-search"`
- **Placeholder:** "Search items by name or description..."

### What filters are available?
- **Status filter:** Dropdown (All, Active, Inactive)
  - Test ID: `data-testid="filter-status"`
- **Category filter:** Dropdown (All + list of categories)
  - Test ID: `data-testid="filter-category"`
- **Clear filters button:** `data-testid="clear-filters"`
- **No date range filter** (not implemented)

### Can you select multiple items for bulk actions?
- **Yes** - Bulk operations supported
- **Who can use:** ADMIN (all items) and EDITOR (own items only)
- **Test ID:** Checkbox for selection: `data-testid="item-checkbox-{id}"`
- **Bulk actions:** Likely delete/deactivate (need to verify specific actions)

---

## Flow 4: Item Details

### How do you open details?
- **Method:** Click "View" button in Actions column
- **Test ID:** `data-testid="item-view-{id}"` or similar
- **Alternative:** Click on item row (need to verify)

### Is it a modal or separate page?
- **Modal popup** - Opens as overlay, not separate page
- **State machine:** CLOSED → OPENING → LOADING → LOADED → ERROR (with retry logic)
- **Test ID:** `data-testid="item-details-modal"`

### What information is shown?
- **All item fields:**
  - Name
  - Description (full text)
  - Item Type
  - Price (formatted as currency)
  - Category
  - Tags (if any)
  - Status (Active/Inactive)
  - Created Date (MM/DD/YYYY)
  - Updated Date (if available)
  - Conditional fields (Weight/Dimensions for PHYSICAL, Download URL/File Size for DIGITAL, Duration for SERVICE)
  - File attachment (if uploaded)
  - Embed URL content (if provided)

### Is there an iframe? What's inside it?
- **Yes** - Iframe shown if `embed_url` is provided
- **Content:** External content from embed_url (videos, demos, etc.)
- **Security:** Only allows `http://` and `https://` protocols (blocks javascript:, data:, file:, about:)
- **Timeout:** 5 seconds to load, shows error if timeout
- **Test ID:** `data-testid="item-embed-iframe"`

### Any tabs or sections?
- **No tabs** - Single scrollable modal with all information
- **Sections:** Organized by field groups (basic info, conditional fields, metadata)

---

## Flow 5: Item Edit

### Same form as create or different?
- **Same form component** - Reuses `ItemCreationForm` logic but pre-populated with existing data
- **Component:** `ItemEditForm.jsx` (extends creation form)
- **Route:** `/items/:id/edit`

### Which fields can be edited?
- **All fields can be edited** (same as create form)
- **Exception:** Item Type might be restricted (need to verify)
- **File upload:** Can upload new file (replaces existing)

### Are there dropdowns? What options?
- **Item Type dropdown:** PHYSICAL, DIGITAL, SERVICE
- **Status:** Not editable via form (handled via Activate/Deactivate actions)
- **Category:** Text input (not dropdown)

### Radio buttons for what?
- **No radio buttons** - All inputs are text/number/select dropdowns

### Checkboxes for what?
- **No checkboxes in edit form** - Tags are comma-separated text input

### Can EDITOR edit all fields or limited?
- **EDITOR can edit all fields** - But only for items they created (ownership check)
- **ADMIN can edit all fields** - For any item (bypasses ownership)
- **VIEWER cannot edit** - No edit access

---

## Flow 6: Item Delete

### Soft delete or hard delete?
- **Soft delete** - Sets `is_active: false` and `deleted_at: timestamp`
- **Item remains in database** - Just marked as inactive
- **No hard delete** - Physical deletion not implemented

### Confirmation popup message?
- **Yes** - Delete confirmation modal
- **Message:** "Are you sure you want to delete [Item Name]?"
- **Test ID:** `data-testid="delete-confirmation-modal"`
- **Buttons:**
  - Confirm: `data-testid="delete-confirm-button"`
  - Cancel: `data-testid="delete-cancel-button"`

### Can deleted items be restored?
- **Yes** - Via "Activate" action (restores soft-deleted items)
- **Sets:** `is_active: true` and clears `deleted_at`
- **Who can restore:** Same permissions as delete (ADMIN all, EDITOR own only)

### Where do deleted items go?
- **Remain in database** - Just filtered out from active lists
- **Filter:** Items with `is_active: false` don't appear in default item list
- **View deleted:** Need to filter by status "Inactive" to see deleted items

---

## Role Permissions (Critical)

| Action | ADMIN | EDITOR | VIEWER |
|--------|-------|--------|--------|
| **Login** | ✅ | ✅ | ✅ |
| **View Items** | ✅ (All) | ✅ (All) | ✅ (All) |
| **View Item Details** | ✅ (All) | ✅ (All) | ✅ (All) |
| **Create Item** | ✅ | ✅ | ❌ |
| **Edit Item** | ✅ (All) | ✅ (Own Only) | ❌ |
| **Delete Item** | ✅ (All) | ✅ (Own Only) | ❌ |
| **Activate/Deactivate** | ✅ (All) | ✅ (Own Only) | ❌ |
| **Search/Filter** | ✅ | ✅ | ✅ |
| **Bulk Operations** | ✅ (All) | ✅ (Own Only) | ❌ |
| **View Activity Logs** | ✅ (All) | ✅ (Own Only) | ✅ (Own Only) |
| **User Management** | ✅ | ❌ | ❌ |

**Ownership Definition:**
- Item `created_by` field must match current user ID
- ADMIN bypasses ownership checks

---

## General Questions

### Are there any notifications/toasts on success/error?
- **Yes** - Toast notification system
- **Types:** Success, Error, Info, Warning
- **Position:** Top-right corner
- **Durations:**
  - Success: 3 seconds
  - Error: 5 seconds
  - Info: 3 seconds
  - Warning: 4 seconds
- **Max visible:** 3 toasts at once
- **Test IDs:**
  - Container: `data-testid="toast-container"`
  - Toast: `data-testid="toast-{type}"`
  - Dismiss: `data-testid="toast-dismiss-button"`

### Loading spinners/states?
- **Yes** - Multiple loading states:
  - **Form submission:** Button shows loading spinner (`loading={isSubmitting}`)
  - **Page load:** Skeleton loaders for dashboard/items list
  - **Modal loading:** Loading state in item details modal
  - **API calls:** Disabled buttons during requests

### Error messages - where do they appear?
- **Form fields:** Below input fields (red text, `data-testid="field-error"`)
- **Form submission:** Below submit button (`ErrorMessage` component)
- **API errors:** Toast notifications (top-right)
- **Modal errors:** Inside modal with retry button (for recoverable errors)
- **Page errors:** Error message with retry button

### Can I access the application now to explore?
- **Yes** - Application should be running on:
  - **Frontend:** `http://localhost:5173` (Vite dev server)
  - **Backend:** `http://localhost:3000` (Express server)
  - **API Base:** `http://localhost:3000/api/v1`
- **Test accounts created:**
  - Admin: `admin1@test.com` / `Admin@123`
  - Editor: `editor1@test.com` / `Admin@123`
  - Viewer: `viewer1@test.com` / `Admin@123`
  - (4 of each role available)

---

## Test Data IDs Reference

### Login Form
- Email: `data-testid="login-email"`
- Password: `data-testid="login-password"`
- Remember Me: `data-testid="login-remember-me"`
- Submit: `data-testid="login-submit"`

### Item Creation Form
- Name: `data-testid="item-name"`
- Description: `data-testid="item-description"`
- Item Type: `data-testid="item-type"`
- Price: `data-testid="item-price"`
- Category: `data-testid="item-category"`
- Tags: `data-testid="item-tags"`
- File Upload: `data-testid="item-file-upload"`
- Embed URL: `data-testid="item-embed-url"`
- Submit: `data-testid="item-submit"`

### Item List
- Search: `data-testid="item-search"`
- Status Filter: `data-testid="filter-status"`
- Category Filter: `data-testid="filter-category"`
- Table: `data-testid="items-table"`
- Item Row: `data-testid="item-row-{id}"`
- View Button: `data-testid="item-view-{id}"`
- Edit Button: `data-testid="item-edit-{id}"`
- Delete Button: `data-testid="item-delete-{id}"`

### Item Details Modal
- Modal: `data-testid="item-details-modal"`
- Close Button: `data-testid="modal-close-button"`
- Iframe: `data-testid="item-embed-iframe"`

### Delete Confirmation Modal
- Modal: `data-testid="delete-confirmation-modal"`
- Confirm: `data-testid="delete-confirm-button"`
- Cancel: `data-testid="delete-cancel-button"`

---

## Notes for Automation

1. **Wait for modals:** Use explicit waits for modal state transitions
2. **Iframe handling:** Wait for iframe load timeout (5 seconds)
3. **Toast notifications:** Wait for toast appearance/disappearance
4. **Role-based testing:** Test with all 3 roles (ADMIN, EDITOR, VIEWER)
5. **Ownership testing:** Create items as EDITOR, test edit/delete permissions
6. **Soft delete:** Verify items still in DB but filtered from list
7. **Conditional fields:** Test all 3 item types (PHYSICAL, DIGITAL, SERVICE)
8. **File upload:** Test file size limits (1 KB min, 5 MB max)
9. **Search normalization:** Test name search with various whitespace/case combinations
10. **Pagination:** Test page navigation and limit changes

---

**End of Document**
