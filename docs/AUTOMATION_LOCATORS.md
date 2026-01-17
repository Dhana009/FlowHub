# Frontend Locators Reference for Automation Framework

**Purpose:** Complete reference of all `data-testid` attributes used in the FlowHub frontend for automation testing.

**Last Updated:** 2025-01-05  
**Status:** ✅ Verified against frontend codebase

---

## 1. Login Page (`/login`)

### ✅ Correct Locators

| Element | data-testid | Notes |
|---------|-------------|-------|
| Email input | `login-email` | ✅ Correct |
| Password input | `login-password` | ✅ Correct |
| Submit/Login button | `login-submit` | ✅ Correct |
| Remember me checkbox | `login-remember-me` | ✅ Correct |
| Error message container | `login-error` | ✅ Correct (if error occurs) |

**Location:** `flowhub-core/frontend/src/components/auth/LoginForm.jsx`

---

## 2. Create Item Page (`/items/create`)

### Common Fields (All Item Types)

| Element | data-testid | Notes |
|---------|-------------|-------|
| Name input | `item-name` | ✅ Correct |
| Description textarea | `item-description` | ✅ Correct |
| Price input | `item-price` | ✅ Correct |
| Category input | `item-category` | ✅ Correct |
| Item Type dropdown | `item-type` | ✅ Correct |
| Submit/Create button | `create-item-submit` | ⚠️ **Note:** Not `submit-button` |
| Cancel button | `create-item-cancel` | ✅ Correct |
| Success message | N/A | Uses Toast component (see below) |
| Form-level error | `create-item-error` | ✅ Correct |

**Location:** `flowhub-core/frontend/src/components/items/ItemCreationForm.jsx`

### PHYSICAL Item Fields

| Element | data-testid | Notes |
|---------|-------------|-------|
| Physical fields container | `physical-fields` | ✅ Container wrapper |
| Weight input | `item-weight` | ✅ Correct |
| Length input | `item-dimension-length` | ⚠️ **Note:** Not `item-length` |
| Width input | `item-dimension-width` | ⚠️ **Note:** Not `item-width` |
| Height input | `item-dimension-height` | ⚠️ **Note:** Not `item-height` |

**Location:** `flowhub-core/frontend/src/components/items/ConditionalFields.jsx`

### DIGITAL Item Fields

| Element | data-testid | Notes |
|---------|-------------|-------|
| Digital fields container | `digital-fields` | ✅ Container wrapper |
| Download URL input | `item-download-url` | ✅ Correct |
| File Size input | `item-file-size` | ✅ Correct |

**Location:** `flowhub-core/frontend/src/components/items/ConditionalFields.jsx`

### SERVICE Item Fields

| Element | data-testid | Notes |
|---------|-------------|-------|
| Service fields container | `service-fields` | ✅ Container wrapper |
| Duration Hours input | `item-duration-hours` | ✅ Correct |

**Location:** `flowhub-core/frontend/src/components/items/ConditionalFields.jsx`

### Additional Fields

| Element | data-testid | Notes |
|---------|-------------|-------|
| Tags input | `item-tags` | ✅ Correct |
| Embed URL input | `item-embed-url` | ✅ Correct |
| File upload | `item-file-upload` | ✅ Correct |
| Selected file display | `selected-file` | ✅ Correct |

---

## 3. Search & Discovery Page (`/items`)

### Page State Attributes

| Attribute | Value | Notes |
|-----------|-------|-------|
| `data-test-ready` | `"true"` or `"false"` | ✅ Correct - on table container |
| `data-test-items-count` | Number (string) | ✅ Correct - on table container |

**Location:** `flowhub-core/frontend/src/pages/ItemsPage.jsx` (line 650-651)

### Search

| Element | data-testid | Additional Attributes | Notes |
|---------|-------------|----------------------|-------|
| Search input | `item-search` | ✅ Correct | Also has `data-test-search-state`, `data-test-last-search`, `data-test-search-transition-id` |
| Clear search button | `search-clear` | ✅ Correct | Only visible when search has value |

**Location:** `flowhub-core/frontend/src/pages/ItemsPage.jsx` (lines 532-547)

### Filters

| Element | data-testid | Notes |
|---------|-------------|-------|
| Status filter dropdown | `filter-status` | ✅ Correct |
| Category filter dropdown | `filter-category` | ✅ Correct |
| Clear filters button | ❌ **Not found** | No dedicated clear filters button exists |

**Location:** `flowhub-core/frontend/src/pages/ItemsPage.jsx` (lines 566, 582)

### Sorting

| Element | data-testid | Notes |
|---------|-------------|-------|
| Sort by Name button | `sort-name` | ✅ Correct |
| Sort by Category button | `sort-category` | ✅ Correct |
| Sort by Price button | `sort-price` | ✅ Correct |
| Sort by Created Date button | `sort-created` | ✅ Correct |
| Sort order attribute | ❌ **Not found** | No `data-sort-order` attribute exists |

**Location:** `flowhub-core/frontend/src/pages/ItemsPage.jsx` (lines 694, 713, 726, 739)

### Table/Items

| Element | data-testid Pattern | Notes |
|---------|---------------------|-------|
| Items table | `items-table` | ✅ Correct |
| Item row | `item-row-{itemId}` | ✅ Correct - e.g., `item-row-507f1f77bcf86cd799439011` |
| Select item checkbox | `select-item-{itemId}` | ✅ Correct |
| Select all checkbox | `select-all-checkbox` | ✅ Correct |
| Item name (in row) | `item-name-{itemId}` | ✅ Correct |
| Item description (in row) | `item-description-{itemId}` | ✅ Correct |
| Item status (in row) | `item-status-{itemId}` | ✅ Correct |
| Item category (in row) | `item-category-{itemId}` | ✅ Correct |
| Item price (in row) | `item-price-{itemId}` | ✅ Correct |
| Item created date (in row) | `item-created-{itemId}` | ✅ Correct |
| Item actions (in row) | `item-actions-{itemId}` | ✅ Correct |
| View item button | `view-item-{itemId}` | ✅ Correct |
| Edit item button | `edit-item-{itemId}` | ✅ Correct |
| Delete item button | `delete-item-{itemId}` | ✅ Correct |
| Activate item button | `activate-item-{itemId}` | ✅ Correct |

**Location:** `flowhub-core/frontend/src/pages/ItemsPage.jsx` (lines 674-835)

### Loading & Empty States

| Element | data-testid | Notes |
|---------|-------------|-------|
| Loading items | `loading-items` | ✅ Correct |
| Empty state | `empty-state` | ✅ Correct |

**Location:** `flowhub-core/frontend/src/pages/ItemsPage.jsx` (lines 620, 628)

### Pagination

| Element | data-testid | Notes |
|---------|-------------|-------|
| Pagination info container | `pagination-info` | ✅ Correct |
| Next page button | `pagination-next` | ✅ Correct |
| Previous page button | `pagination-prev` | ✅ Correct |
| Page number button | `pagination-page-{pageNumber}` | ✅ Correct - e.g., `pagination-page-1`, `pagination-page-2` |
| Items per page selector | `pagination-limit` | ✅ Correct |

**Location:** `flowhub-core/frontend/src/pages/ItemsPage.jsx` (lines 850-930)

---

## 4. Navigation/Common Elements

### Sidebar

| Element | data-testid | Notes |
|---------|-------------|-------|
| Create Item button (desktop) | `sidebar-create-item-button` | ✅ Correct |
| Create Item button (mobile) | `mobile-sidebar-create-item-button` | ✅ Correct |
| Navigation links | `nav-{name}` | ✅ Pattern - e.g., `nav-dashboard`, `nav-items` |

**Location:** `flowhub-core/frontend/src/components/layout/Sidebar.jsx`

### Header/User Menu

| Element | data-testid | Notes |
|---------|-------------|-------|
| Mobile menu button | `mobile-menu-button` | ✅ Correct |
| User menu button | `user-menu-button` | ✅ Correct |
| User menu dropdown | `user-menu-dropdown` | ✅ Correct |
| Dashboard menu item | `menu-dashboard` | ✅ Correct |
| Items menu item | `menu-items` | ✅ Correct |
| Logout menu item | `menu-logout` | ✅ Correct |

**Location:** `flowhub-core/frontend/src/components/layout/Header.jsx`

---

## 5. Additional Components

### Toast Notifications

| Element | data-testid | Notes |
|---------|-------------|-------|
| Toast container | `toast-container` | ✅ Correct |
| Toast (by type) | `toast-{type}` | ✅ Pattern - e.g., `toast-success`, `toast-error` |
| Toast dismiss button | `toast-dismiss-button` | ✅ Correct |

**Location:** `flowhub-core/frontend/src/components/common/Toast.jsx`

### Item Details Modal

| Element | data-testid | Notes |
|---------|-------------|-------|
| Modal overlay | `item-details-modal-overlay` | ✅ Correct |
| Modal container | `item-details-modal` | ✅ Correct |
| Modal title | `modal-title` | ✅ Correct |
| Close button | `close-button` | ✅ Correct |
| Loading state | `loading-state` | ✅ Correct |
| Error state | `error-state` | ✅ Correct |
| Item name | `item-name-{sanitizedId}` | ✅ Correct |
| Item description | `item-description-{sanitizedId}` | ✅ Correct |
| Item status | `item-status-{sanitizedId}` | ✅ Correct |
| Item category | `item-category-{sanitizedId}` | ✅ Correct |
| Item price | `item-price-{sanitizedId}` | ✅ Correct |
| Item created date | `item-created-date-{sanitizedId}` | ✅ Correct |
| Item tag | `item-tag-{index}-{sanitizedId}` | ✅ Correct |
| Embedded iframe | `embedded-iframe` | ✅ Correct |
| Iframe loading state | `iframe-loading-state` | ✅ Correct |

**Location:** `flowhub-core/frontend/src/components/items/ItemDetailsModal.jsx`

### Bulk Operations

| Element | data-testid | Notes |
|---------|-------------|-------|
| Bulk actions bar | `bulk-actions-bar` | ✅ Correct |
| Selected count badge | `selected-count-badge` | ✅ Correct |
| Bulk activate button | `bulk-activate-button` | ✅ Correct |
| Bulk deactivate button | `bulk-deactivate-button` | ✅ Correct |
| Bulk clear selection | `bulk-clear-selection` | ✅ Correct |
| Bulk operation modal | `bulk-operation-modal` | ✅ Correct |
| Progress percentage | `progress-percentage` | ✅ Correct |
| Progress bar | `progress-bar` | ✅ Correct |
| Summary report | `summary-report` | ✅ Correct |
| Total count | `total-count` | ✅ Correct |
| Success count | `success-count` | ✅ Correct |
| Skipped count | `skipped-count` | ✅ Correct |
| Failed count | `failed-count` | ✅ Correct |

**Location:** `flowhub-core/frontend/src/components/items/BulkActionsBar.jsx` and `BulkOperationModal.jsx`

### Delete Confirmation Modal

| Element | data-testid | Notes |
|---------|-------------|-------|
| Delete confirm modal | `delete-confirm-modal` | ✅ Correct |
| Delete confirm message | `delete-confirm-message` | ✅ Correct |

**Location:** `flowhub-core/frontend/src/components/modals/DeleteConfirmationModal.jsx`

---

## Summary of Corrections

### ✅ Correct Values (No Changes Needed)
- Login page: All values are correct
- Create item: Most values are correct
- Search: All values are correct
- Filters: All values are correct
- Sorting: All values are correct
- Pagination: All values are correct

### ⚠️ Corrections Needed

1. **Create Item Submit Button:**
   - ❌ Your value: `submit-button`
   - ✅ Correct value: `create-item-submit`

2. **PHYSICAL Item Dimensions:**
   - ❌ Your values: `item-length`, `item-width`, `item-height`
   - ✅ Correct values: `item-dimension-length`, `item-dimension-width`, `item-dimension-height`

3. **Item Row Locators:**
   - ⚠️ **Important:** All item row locators use `{itemId}` suffix, not just the field name
   - Example: `item-name-507f1f77bcf86cd799439011` (not just `item-name`)

4. **Missing Attributes:**
   - ❌ `data-sort-order` - This attribute does NOT exist
   - ✅ Use `data-test-search-state` and `data-test-last-search` for search state

5. **Clear Filters Button:**
   - ❌ No dedicated clear filters button exists
   - ✅ Users must manually reset each filter

---

## Best Practices for Automation

### 1. Wait Conditions

```javascript
// Wait for page to be ready
await page.waitForSelector('[data-test-ready="true"]');

// Wait for items to load
await page.waitForSelector('[data-test-items-count]');
const count = await page.getAttribute('[data-test-items-count]', 'data-test-items-count');
```

### 2. Dynamic Item IDs

```javascript
// Always use item ID in locators for item-specific actions
const itemId = '507f1f77bcf86cd799439011';
await page.click(`[data-testid="item-row-${itemId}"]`);
await page.click(`[data-testid="edit-item-${itemId}"]`);
```

### 3. Search State Monitoring

```javascript
// Monitor search state transitions
const searchState = await page.getAttribute('[data-testid="item-search"]', 'data-test-search-state');
// States: 'idle' | 'debouncing' | 'loading' | 'ready'
```

### 4. Conditional Fields

```javascript
// Wait for conditional fields to appear based on item type
await page.waitForSelector('[data-testid="physical-fields"]'); // For PHYSICAL
await page.waitForSelector('[data-testid="digital-fields"]'); // For DIGITAL
await page.waitForSelector('[data-testid="service-fields"]'); // For SERVICE
```

---

## Complete Locator Reference Table

| Category | Element | data-testid | Status |
|----------|---------|-------------|--------|
| **Login** | Email | `login-email` | ✅ |
| | Password | `login-password` | ✅ |
| | Submit | `login-submit` | ✅ |
| | Remember Me | `login-remember-me` | ✅ |
| | Error | `login-error` | ✅ |
| **Create Item** | Name | `item-name` | ✅ |
| | Description | `item-description` | ✅ |
| | Price | `item-price` | ✅ |
| | Category | `item-category` | ✅ |
| | Item Type | `item-type` | ✅ |
| | Submit | `create-item-submit` | ⚠️ **Fixed** |
| | Cancel | `create-item-cancel` | ✅ |
| **PHYSICAL** | Weight | `item-weight` | ✅ |
| | Length | `item-dimension-length` | ⚠️ **Fixed** |
| | Width | `item-dimension-width` | ⚠️ **Fixed** |
| | Height | `item-dimension-height` | ⚠️ **Fixed** |
| **DIGITAL** | Download URL | `item-download-url` | ✅ |
| | File Size | `item-file-size` | ✅ |
| **SERVICE** | Duration Hours | `item-duration-hours` | ✅ |
| **Search** | Search Input | `item-search` | ✅ |
| | Clear Search | `search-clear` | ✅ |
| **Filters** | Status | `filter-status` | ✅ |
| | Category | `filter-category` | ✅ |
| **Sorting** | Sort Name | `sort-name` | ✅ |
| | Sort Category | `sort-category` | ✅ |
| | Sort Price | `sort-price` | ✅ |
| | Sort Created | `sort-created` | ✅ |
| **Table** | Items Table | `items-table` | ✅ |
| | Item Row | `item-row-{itemId}` | ✅ |
| | Item Name | `item-name-{itemId}` | ✅ |
| | Item Category | `item-category-{itemId}` | ✅ |
| | Item Price | `item-price-{itemId}` | ✅ |
| | Item Status | `item-status-{itemId}` | ✅ |
| **Pagination** | Next | `pagination-next` | ✅ |
| | Previous | `pagination-prev` | ✅ |
| | Page Number | `pagination-page-{pageNumber}` | ✅ |
| | Limit | `pagination-limit` | ✅ |
| **Navigation** | Create Item | `sidebar-create-item-button` | ✅ |
| | Dashboard | `menu-dashboard` | ✅ |
| | Items | `menu-items` | ✅ |
| | Logout | `menu-logout` | ✅ |

---

**End of Document**
