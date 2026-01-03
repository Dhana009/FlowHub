# FlowHub Application - Complete Locator Reference Guide

**Version:** 1.0  
**Created:** For Web Automation Testing  
**Component Files Location:** `flowhub-core/frontend/src/`

---

## 1. Login Page Locators

**Page Route:** `/login`

### Email Input Field
- **Locator Value:** `login-email`
- **Locator Type:** `data-testid`
- **Component File:** `components/auth/LoginForm.jsx:82`
- **Element Type:** `<Input>` component
- **Alternative Selectors:**
  - `input[type="email"]`
  - `input[placeholder="Enter your email"]`

### Password Input Field
- **Locator Value:** `login-password`
- **Locator Type:** `data-testid`
- **Component File:** `components/auth/LoginForm.jsx:94`
- **Element Type:** `<Input>` component with password toggle
- **Alternative Selectors:**
  - `input[type="password"]`
  - `input[placeholder="Enter your password"]`

### Remember Me Checkbox
- **Locator Value:** `login-remember-me`
- **Locator Type:** `data-testid`
- **Component File:** `components/auth/LoginForm.jsx:106`
- **Element Type:** `<input type="checkbox">`
- **Role:** `checkbox`
- **Aria Attributes:** `aria-checked`, `aria-label="Remember me on this device"`

### Login Submit Button
- **Locator Value:** `login-submit`
- **Locator Type:** `data-testid`
- **Component File:** `components/auth/LoginForm.jsx:126`
- **Element Type:** `<Button>` component
- **Button Text:** "Sign In"
- **Loading State:** Button becomes disabled and shows spinner during submission

### "Forgot password?" Link
- **Element Selector:** `<Link to="/forgot-password">`
- **Locator Type:** Element text or role
- **Component File:** `components/auth/LoginForm.jsx:115`
- **Text Content:** "Forgot password?"
- **Alternative Selectors:**
  - `a[href="/forgot-password"]`
  - By text: "Forgot password?"

### Error Message Container (Invalid Credentials)
- **Locator Value:** `login-error`
- **Locator Type:** `data-testid`
- **Component File:** `components/auth/LoginForm.jsx:135`
- **Element Type:** `<ErrorMessage>` component
- **Role:** `alert`
- **Aria Attributes:** `aria-live="assertive"`
- **Visibility:** Only shown when `submitError` is not empty

### Success Redirect URL After Login
- **Route:** `/dashboard`
- **Navigation Method:** `navigate('/dashboard', { replace: true })`
- **Component File:** `components/auth/LoginForm.jsx:55`

---

## 2. Dashboard Page Locators

**Page Route:** `/dashboard`

### Dashboard URL/Route
- **Route:** `/dashboard`
- **Protected:** Yes (requires authentication)
- **Component File:** `pages/DashboardPage.jsx`
- **Layout Wrapper:** `AppLayout` with title "System Dashboard"

### Stats Cards Locators

#### Total Items Stats Card
- **Component:** `<StatsCard>`
- **Title:** "Total Items"
- **Component File:** `pages/DashboardPage.jsx:106-115`
- **Locator:** Look for text "Total Items" (no specific data-testid)
- **Contained Data:** `stats.totalItems`

#### Active Items Stats Card
- **Component:** `<StatsCard>`
- **Title:** "Active Items"
- **Component File:** `pages/DashboardPage.jsx:116-125`
- **Locator:** Look for text "Active Items"
- **Contained Data:** `stats.activeItems`

#### Inactive Items Stats Card
- **Component:** `<StatsCard>`
- **Title:** "Inactive Items"
- **Component File:** `pages/DashboardPage.jsx:126-135`
- **Locator:** Look for text "Inactive Items"
- **Contained Data:** `stats.inactiveItems`

### "Create Item" Quick Action Button
- **Locator Value:** `quick-action-create-item`
- **Locator Type:** `data-testid`
- **Component File:** `components/dashboard/QuickActions.jsx:55`
- **Element Type:** Button with icon
- **Navigation:** Navigates to `/items/create`
- **Variant:** Primary (blue background)

### "View All Items" Quick Action Button
- **Locator Value:** `quick-action-view-all-items`
- **Locator Type:** `data-testid`
- **Component File:** `components/dashboard/QuickActions.jsx:55`
- **Element Type:** Button with icon
- **Navigation:** Navigates to `/items`
- **Variant:** Secondary (gray background)

### Recent Activity Feed Container
- **Component:** `<RecentActivity>`
- **Component File:** `pages/DashboardPage.jsx:159`
- **Data Source:** Recent activities generated from recent items
- **Locator:** Look for section/container with recent activity items
- **No specific data-testid** - Use text-based selectors or React Testing Library queries

### Logout Button
- **Locator Value:** `menu-logout`
- **Locator Type:** `data-testid`
- **Component File:** `components/layout/Header.jsx:211`
- **Element Type:** Button in user dropdown menu
- **Text Content:** "Logout"
- **Location:** User menu dropdown (Header)

---

## 3. Item Creation Form Locators

**Page Route:** `/items/create`  
**Component File:** `components/items/ItemCreationForm.jsx`

### Form Container
- **Element Type:** `<form>`
- **Role:** `form` (implicit)
- **Parent Component:** `<CreateItemPage>`
- **Locator:** Form element in page

### Name Input Field
- **Locator Value:** `item-name`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemCreationForm.jsx:282`
- **Element Type:** `<Input>` component
- **Input Type:** `text`
- **Validation Error Test ID:** `item-name-error`
- **Placeholder:** "Enter item name"

### Description Input/Textarea
- **Locator Value:** `item-description`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemCreationForm.jsx:322`
- **Element Type:** `<textarea>`
- **Validation Error Test ID:** `description-error`
- **Placeholder:** "Enter detailed description"

### Item Type Dropdown
- **Locator Value:** `item-type`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemCreationForm.jsx:360`
- **Element Type:** `<select>`
- **Aria Label:** "Select Item Type"
- **Validation Error Test ID:** `item-type-error`

#### Item Type Options
- **PHYSICAL Option:** `<option value="PHYSICAL">Physical</option>`
- **DIGITAL Option:** `<option value="DIGITAL">Digital</option>`
- **SERVICE Option:** `<option value="SERVICE">Service</option>`

### Price Input Field
- **Locator Value:** `item-price`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemCreationForm.jsx:408`
- **Element Type:** `<Input>` component (type="number")
- **Min Value:** 0.01
- **Step:** 0.01
- **Placeholder:** "0.00"

### Category Input Field
- **Locator Value:** `item-category`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemCreationForm.jsx:423`
- **Element Type:** `<Input>` component (type="text")
- **Placeholder:** "Enter category"

### Tags Input Field
- **Locator Value:** `item-tags`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemCreationForm.jsx:436`
- **Element Type:** `<Input>` component (type="text")
- **Placeholder:** "tag1, tag2, tag3"
- **Format:** Comma-separated values

### Embed URL Input Field (Optional)
- **Locator Value:** `item-embed-url`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemCreationForm.jsx:457`
- **Element Type:** `<Input>` component (type="url")
- **Placeholder:** "https://example.com/embed/content"
- **Optional:** Yes

### File Upload Input
- **Locator Value:** `item-file-upload`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/FileUpload.jsx:106`
- **Element Type:** `<input type="file">`
- **Accept:** `.jpg, .jpeg, .png, .pdf, .doc, .docx`
- **Max Size:** 5 MB
- **Min Size:** 1 KB

#### Selected File Display
- **Locator Value:** `selected-file`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/FileUpload.jsx:122`
- **Shows:** File name and size

#### Remove File Button
- **Locator Value:** `remove-file`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/FileUpload.jsx:132`

### Conditional Fields

#### Physical Fields Container
- **Locator Value:** `physical-fields`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ConditionalFields.jsx:32`
- **Visibility:** Only shown when `item_type === 'PHYSICAL'`

**Weight Input Field**
- **Locator Value:** `item-weight`
- **Locator Type:** `data-testid`
- **Element Type:** `<Input>` (type="number")
- **Placeholder:** "0.00"
- **Unit:** kg

**Dimensions Length Input**
- **Locator Value:** `item-dimension-length`
- **Locator Type:** `data-testid`
- **Element Type:** `<Input>` (type="number")
- **Unit:** cm

**Dimensions Width Input**
- **Locator Value:** `item-dimension-width`
- **Locator Type:** `data-testid`
- **Element Type:** `<Input>` (type="number")
- **Unit:** cm

**Dimensions Height Input**
- **Locator Value:** `item-dimension-height`
- **Locator Type:** `data-testid`
- **Element Type:** `<Input>` (type="number")
- **Unit:** cm

#### Digital Fields Container
- **Locator Value:** `digital-fields`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ConditionalFields.jsx:114`
- **Visibility:** Only shown when `item_type === 'DIGITAL'`

**Download URL Input**
- **Locator Value:** `item-download-url`
- **Locator Type:** `data-testid`
- **Element Type:** `<Input>` (type="url")
- **Placeholder:** "https://example.com/download/file.zip"

**File Size Input**
- **Locator Value:** `item-file-size`
- **Locator Type:** `data-testid`
- **Element Type:** `<Input>` (type="number")
- **Unit:** bytes

#### Service Fields Container
- **Locator Value:** `service-fields`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ConditionalFields.jsx:146`
- **Visibility:** Only shown when `item_type === 'SERVICE'`

**Duration Input**
- **Locator Value:** `item-duration-hours`
- **Locator Type:** `data-testid`
- **Element Type:** `<Input>` (type="number")
- **Unit:** hours

### Form Submit Button
- **Locator Value:** `create-item-submit`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemCreationForm.jsx:472`
- **Element Type:** `<Button>` component
- **Text:** "Create Item"
- **Type:** submit
- **Disabled State:** During form submission

### Form Cancel Button
- **Locator Value:** `cancel-item-creation`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemCreationForm.jsx:484`
- **Element Type:** `<Button>` component
- **Text:** "Cancel"
- **Type:** button
- **Action:** Navigates back to `/items`

### Field Error Message Pattern
- **Locator Pattern:** `{fieldName}-error`
- **Example:** `item-name-error`, `item-description-error`, `item-type-error`
- **Locator Type:** `data-testid`
- **Role:** `alert`
- **Aria Attributes:** `aria-live="polite"`

### Form-Level Error Message
- **Locator Value:** `form-error` (if exists)
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemCreationForm.jsx:216`
- **Role:** `alert`
- **Visibility:** Only shown when form submission fails

---

## 4. Item List Page Locators

**Page Route:** `/items`  
**Component File:** `pages/ItemsPage.jsx`

### Items List URL/Route
- **Route:** `/items`
- **Protected:** Yes (requires authentication)
- **Query Parameters:** `search`, `status`, `category`, `sort_by`, `sort_order`, `page`, `limit`

### Search Input Field
- **Locator Value:** `item-search`
- **Locator Type:** `data-testid`
- **Component File:** `pages/ItemsPage.jsx:532`
- **Element Type:** `<Input>` component
- **Role:** `searchbox`
- **Placeholder:** "Search items by name or description..."

### Status Filter Dropdown
- **Locator Value:** `filter-status`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/` (Filter component)
- **Element Type:** `<select>` dropdown
- **Options:** All, Active, Inactive

### Category Filter Dropdown
- **Locator Value:** `filter-category`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/` (Filter component)
- **Element Type:** `<select>` dropdown
- **Options:** All + dynamic list of categories

### Clear Filters Button
- **Locator Value:** `clear-filters`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/`
- **Element Type:** Button
- **Text:** "Clear Filters"

### Items Table
- **Locator Value:** `items-table`
- **Locator Type:** `data-testid`
- **Component File:** `pages/ItemsPage.jsx`
- **Element Type:** `<table>`
- **Role:** `table`
- **Aria Label:** "Items table"

### Table Header Row
- **Element Selector:** `<thead>`
- **Locator:** Table head element in items-table
- **Contains:** Column headers with sort buttons

### Sort Buttons/Icons (Sortable Columns)

#### Sort by Name
- **Locator Pattern:** `sort-name` or similar
- **Column Header:** "Name"
- **Sortable:** Yes

#### Sort by Category
- **Column Header:** "Category"
- **Sortable:** Yes

#### Sort by Price
- **Column Header:** "Price"
- **Sortable:** Yes

#### Sort by Created Date
- **Column Header:** "Created Date"
- **Sortable:** Yes

### Item Row Locator Pattern
- **Locator Pattern:** `item-row-{id}` (dynamic)
- **Locator Type:** `data-testid`
- **Component File:** `pages/ItemsPage.jsx:757`
- **Element Type:** `<tr>`
- **Example:** `item-row-507f1f77bcf86cd799439011`
- **Dynamic Part:** Item `_id` field from database

### Checkbox for Item Selection Pattern
- **Locator Pattern:** `item-checkbox-{id}` (dynamic)
- **Locator Type:** `data-testid` (if implemented)
- **Element Type:** `<input type="checkbox">`
- **Example:** `item-checkbox-507f1f77bcf86cd799439011`
- **For Select All:** `select-all-checkbox` or similar

### Table Columns

#### Name Column
- **Locator Value:** `column-name` (header)
- **Locator Type:** `data-testid`
- **Cell Locator Pattern:** `item-name-{id}` (dynamic)
- **Component File:** `pages/ItemsPage.jsx:771`
- **Example:** `item-name-507f1f77bcf86cd799439011`
- **Content:** Full item name (no truncation)

#### Description Column
- **Locator Value:** `column-description` (header)
- **Cell Locator Pattern:** `item-description-{id}` (dynamic)
- **Truncation:** 100 characters with "..."
- **Tooltip:** Full description on hover

#### Status Badge Column
- **Locator Value:** `column-status` (header)
- **Cell Locator Pattern:** `item-status-{id}` (dynamic)
- **Element Type:** Badge
- **Colors:** Green (Active), Gray (Inactive), Yellow (Pending)
- **Sortable:** Yes (internally, but badge shows status)

#### Category Column
- **Locator Value:** `column-category` (header)
- **Cell Locator Pattern:** `item-category-{id}` (dynamic)
- **Content:** Category name
- **Sortable:** Yes

#### Price Column
- **Locator Value:** `column-price` (header)
- **Cell Locator Pattern:** `item-price-{id}` (dynamic)
- **Format:** $X.XX (currency)
- **Sortable:** Yes

#### Created Date Column
- **Locator Value:** `column-created` (header)
- **Cell Locator Pattern:** `item-created-{id}` (dynamic)
- **Format:** MM/DD/YYYY
- **Sortable:** Yes

#### Actions Column
- **Locator Value:** `column-actions` (header)
- **Cell Locator Pattern:** `item-actions-{id}` (dynamic)
- **Contains:** View, Edit, Delete buttons

### Action Buttons (Per Row)

#### View Button
- **Locator Pattern:** `item-view-{id}` (dynamic)
- **Locator Type:** `data-testid`
- **Element Type:** Button
- **Icon/Text:** "View" or eye icon
- **Action:** Opens ItemDetailsModal
- **Example:** `item-view-507f1f77bcf86cd799439011`

#### Edit Button
- **Locator Pattern:** `item-edit-{id}` (dynamic)
- **Locator Type:** `data-testid`
- **Element Type:** Button
- **Icon/Text:** "Edit" or pencil icon
- **Action:** Navigates to `/items/{id}/edit`
- **Visibility:** Hidden for VIEWER role or non-owners
- **Example:** `item-edit-507f1f77bcf86cd799439011`

#### Delete Button
- **Locator Pattern:** `item-delete-{id}` (dynamic)
- **Locator Type:** `data-testid`
- **Element Type:** Button
- **Icon/Text:** "Delete" or trash icon
- **Action:** Opens DeleteConfirmationModal
- **Visibility:** Hidden for VIEWER role or non-owners
- **Example:** `item-delete-507f1f77bcf86cd799439011`

### Pagination Controls

#### Pagination Container
- **Locator Value:** `pagination` (likely)
- **Element Type:** Navigation container
- **Role:** `navigation`
- **Aria Label:** "Pagination"

#### Previous Button
- **Locator Value:** `pagination-prev`
- **Locator Type:** `data-testid`
- **Element Type:** Button
- **Disabled:** When on first page

#### Next Button
- **Locator Value:** `pagination-next`
- **Locator Type:** `data-testid`
- **Element Type:** Button
- **Disabled:** When on last page

#### Page Number Button Pattern
- **Locator Pattern:** `pagination-page-{number}` (dynamic)
- **Locator Type:** `data-testid`
- **Element Type:** Button
- **Example:** `pagination-page-1`, `pagination-page-2`
- **Active State:** Highlighted/bold for current page

#### Page Size Dropdown
- **Locator Value:** `pagination-limit`
- **Locator Type:** `data-testid`
- **Element Type:** `<select>`
- **Options:** 10, 20, 50, 100 (likely)

#### Total Items Count
- **Locator Pattern:** "Showing X-Y of Z items"
- **Locator Type:** Text-based selector
- **Component File:** Pagination component
- **Format:** "Showing {start}-{end} of {total} items"

---

## 5. Item Details Modal Locators

**Component File:** `components/items/ItemDetailsModal.jsx`

### Modal Container
- **Locator Value:** `item-details-modal`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemDetailsModal.jsx:555`
- **Element Type:** `<div role="dialog">`
- **Role:** `dialog`
- **Aria Modal:** `true`

### Modal Overlay/Backdrop
- **Locator Value:** `item-details-modal-overlay`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemDetailsModal.jsx:538`
- **Element Type:** Parent dialog container
- **Click Behavior:** Closes modal when clicking on overlay

### Close Button (X)
- **Locator Value:** `close-button`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemDetailsModal.jsx:578`
- **Element Type:** Button
- **Icon:** X (SVG)
- **Aria Label:** "Close modal"
- **Keyboard:** Escape key also closes

### Modal Title/Header
- **Locator Value:** `modal-title`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemDetailsModal.jsx:565`
- **Element Type:** `<h2>`
- **Text:** "Item Details"

### Item Name Display
- **Locator Pattern:** `item-name-{sanitizedId}` (dynamic)
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemDetailsModal.jsx:663`
- **Element Type:** `<h3>`
- **Content:** Full item name
- **Dynamic Part:** Sanitized item ID (special characters replaced with hyphens)
- **Example:** `item-name-507f1f77bcf86cd799439011`

### Description Display
- **Locator Pattern:** `item-description-{sanitizedId}` (dynamic)
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemDetailsModal.jsx:674`
- **Element Type:** `<p>`
- **Content:** Full description (not truncated)
- **Example:** `item-description-507f1f77bcf86cd799439011`

### Item Type Display
- **Locator Pattern:** `item-type-{sanitizedId}` (dynamic, if displayed)
- **Locator Type:** `data-testid`
- **Content:** PHYSICAL, DIGITAL, or SERVICE

### Price Display
- **Locator Pattern:** `item-price-{sanitizedId}` (dynamic)
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemDetailsModal.jsx:712`
- **Content:** Formatted as $X.XX
- **Example:** `item-price-507f1f77bcf86cd799439011`

### Category Display
- **Locator Pattern:** `item-category-{sanitizedId}` (dynamic)
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemDetailsModal.jsx:700`
- **Content:** Category name
- **Example:** `item-category-507f1f77bcf86cd799439011`

### Tags Display
- **Locator Pattern:** `item-tags-{sanitizedId}` (dynamic, if displayed)
- **Locator Type:** `data-testid`
- **Content:** Comma-separated tags or badge list

### Status Badge
- **Locator Pattern:** `item-status-{sanitizedId}` (dynamic)
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemDetailsModal.jsx:690`
- **Element Type:** Badge/Span
- **Colors:** Green (Active), Gray (Inactive)
- **Example:** `item-status-507f1f77bcf86cd799439011`

### Created Date Display
- **Locator Pattern:** `item-created-{sanitizedId}` (dynamic, if displayed)
- **Locator Type:** `data-testid`
- **Format:** MM/DD/YYYY

### Updated Date Display
- **Locator Pattern:** `item-updated-{sanitizedId}` (dynamic, if displayed)
- **Locator Type:** `data-testid`
- **Format:** MM/DD/YYYY or timestamp

### Conditional Fields Display (Weight, Dimensions, Download URL, Duration)

#### Weight Display
- **Locator Pattern:** `item-weight-{sanitizedId}` (dynamic)
- **Shown For:** PHYSICAL items only
- **Unit:** kg

#### Dimensions Display
- **Length:** `item-dimension-length-{sanitizedId}`
- **Width:** `item-dimension-width-{sanitizedId}`
- **Height:** `item-dimension-height-{sanitizedId}`
- **Shown For:** PHYSICAL items only
- **Unit:** cm

#### Download URL Display
- **Locator Pattern:** `item-download-url-{sanitizedId}` (dynamic)
- **Shown For:** DIGITAL items only
- **Element Type:** Link/href

#### File Size Display
- **Locator Pattern:** `item-file-size-{sanitizedId}` (dynamic)
- **Shown For:** DIGITAL items only
- **Unit:** bytes (formatted as KB/MB)

#### Duration Display
- **Locator Pattern:** `item-duration-hours-{sanitizedId}` (dynamic)
- **Shown For:** SERVICE items only
- **Unit:** hours

### File Attachment Link
- **Locator Pattern:** `item-file-{sanitizedId}` (dynamic, if implemented)
- **Element Type:** Link or download button
- **Content:** File name or "Download" text

### Iframe Container
- **Locator Pattern:** `item-embed-iframe-{sanitizedId}` (dynamic)
- **Locator Type:** `data-testid`
- **Element Type:** `<iframe>`
- **Src:** `embed_url` from item data
- **Timeout:** 5 seconds
- **Shown For:** Items with `embed_url` provided

### Loading State
- **Locator Value:** `loading-state`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemDetailsModal.jsx:609`
- **Element Type:** Loading spinner container
- **Role:** `status`
- **Shows During:** Initial load and retry

### Error State
- **Locator Value:** `error-state`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemDetailsModal.jsx:623`
- **Element Type:** Error message container
- **Role:** `alert`
- **Shows During:** API error or iframe failure

### Retry Button
- **Locator Value:** `retry-button`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemDetailsModal.jsx:636`
- **Element Type:** Button
- **Shows For:** Recoverable errors (500, Network, Timeout)
- **Max Retries:** 3 attempts

---

## 6. Item Edit Form Locators

**Page Route:** `/items/:id/edit`  
**Component File:** `components/items/ItemEditForm.jsx`

### Edit Form URL/Route Pattern
- **Route Pattern:** `/items/{itemId}/edit`
- **Example:** `/items/507f1f77bcf86cd799439011/edit`
- **Dynamic Part:** Item `_id` in URL

### Form Locators
- **Same as Create Form** (components reuse same structure)
- **All field locators match ItemCreationForm:**
  - `item-name`
  - `item-description`
  - `item-type`
  - `item-price`
  - `item-category`
  - `item-tags`
  - `item-embed-url`
  - `item-file-upload`
  - Conditional fields (weight, dimensions, download-url, duration)

### Pre-populated Field Values
- **All input fields** pre-populate from existing item data
- **Format:** Values come from item object (e.g., `item.name`, `item.price`)
- **Tags:** Array converted to comma-separated string
- **Dimensions:** Object spread across three inputs

### Update Button
- **Locator Value:** `update-item-submit`
- **Locator Type:** `data-testid`
- **Component File:** `components/items/ItemEditForm.jsx`
- **Element Type:** `<Button>` component
- **Text:** "Update Item"
- **Type:** submit

### Cancel Button
- **Locator Value:** `cancel-item-edit`
- **Locator Type:** `data-testid`
- **Element Type:** `<Button>` component
- **Text:** "Cancel"
- **Navigation:** Back to `/items`

---

## 7. Delete Confirmation Modal Locators

**Component File:** `components/modals/DeleteConfirmationModal.jsx`

### Confirmation Modal Container
- **Locator Value:** `delete-confirmation-modal`
- **Locator Type:** `data-testid`
- **Element Type:** `<div role="dialog">`
- **Role:** `dialog`
- **Aria Modal:** `true`

### Modal Message Text
- **Element:** Heading or paragraph
- **Locator Type:** Text content
- **Pattern:** "Are you sure you want to delete {itemName}?"
- **Dynamic Part:** Item name

### Item Name in Message
- **Dynamically inserted** into confirmation message
- **Source:** `item.name` from state

### Confirm Delete Button
- **Locator Value:** `delete-confirm-button`
- **Locator Type:** `data-testid`
- **Element Type:** Button
- **Text:** "Delete" or "Confirm"
- **Color:** Red/danger
- **Action:** Calls `deleteItem` API

### Cancel Button
- **Locator Value:** `delete-cancel-button`
- **Locator Type:** `data-testid`
- **Element Type:** Button
- **Text:** "Cancel"
- **Action:** Closes modal without deleting

### Modal Close (X) Button
- **Locator Value:** `close-button` (or similar)
- **Locator Type:** `data-testid`
- **Element Type:** Button
- **Icon:** X (SVG)
- **Action:** Closes modal

---

## 8. Toast Notification Locators

**Component File:** `components/common/Toast.jsx`

### Toast Container
- **Locator Value:** `toast-container`
- **Locator Type:** `data-testid`
- **Component File:** `components/common/Toast.jsx:178`
- **Element Type:** `<div>`
- **Position:** Top-right corner
- **Max Visible:** 3 toasts

### Success Toast
- **Locator Value:** `toast-success`
- **Locator Type:** `data-testid`
- **Role:** `alert`
- **Aria Live:** `polite`
- **Duration:** 3 seconds
- **Background:** Green

### Error Toast
- **Locator Value:** `toast-error`
- **Locator Type:** `data-testid`
- **Role:** `alert`
- **Aria Live:** `assertive`
- **Duration:** 5 seconds
- **Background:** Red

### Info Toast
- **Locator Value:** `toast-info`
- **Locator Type:** `data-testid`
- **Role:** `alert`
- **Aria Live:** `polite`
- **Duration:** 3 seconds
- **Background:** Blue

### Warning Toast
- **Locator Value:** `toast-warning`
- **Locator Type:** `data-testid`
- **Role:** `alert`
- **Aria Live:** `polite`
- **Duration:** 4 seconds
- **Background:** Amber/Yellow

### Toast Message Text
- **Locator:** Inside toast element
- **Selector:** Direct text child of toast
- **Content:** Message passed to `showToast(message, type)`

### Toast Dismiss/Close Button
- **Locator Value:** `toast-dismiss-button`
- **Locator Type:** `data-testid`
- **Component File:** `components/common/Toast.jsx:138`
- **Element Type:** Button
- **Icon:** X (SVG)
- **Action:** Closes toast immediately

---

## 9. Navigation/Header Locators

**Component File:** `components/layout/Header.jsx`

### User Menu Button
- **Locator Value:** `user-menu-button`
- **Locator Type:** `data-testid`
- **Component File:** `components/layout/Header.jsx:114`
- **Element Type:** Button
- **Contains:** Avatar + user initials

### User Menu Dropdown
- **Locator Value:** `user-menu-dropdown`
- **Locator Type:** `data-testid`
- **Component File:** `components/layout/Header.jsx:159`
- **Element Type:** `<div role="menu">`
- **Visibility:** Hidden until menu button clicked

#### Dashboard Link (Menu)
- **Locator Value:** `menu-dashboard`
- **Locator Type:** `data-testid`
- **Component File:** `components/layout/Header.jsx:184`
- **Element Type:** Button (menu item)
- **Navigation:** `/dashboard`

#### Items Link (Menu)
- **Locator Value:** `menu-items`
- **Locator Type:** `data-testid`
- **Component File:** `components/layout/Header.jsx:196`
- **Element Type:** Button (menu item)
- **Navigation:** `/items`

#### Logout Button (Menu)
- **Locator Value:** `menu-logout`
- **Locator Type:** `data-testid`
- **Component File:** `components/layout/Header.jsx:211`
- **Element Type:** Button (menu item)
- **Text:** "Logout"
- **Action:** Calls logout, redirects to `/login`

### Mobile Menu Button
- **Locator Value:** `mobile-menu-button`
- **Locator Type:** `data-testid`
- **Component File:** `components/layout/Header.jsx:40`
- **Element Type:** Button
- **Visible:** Mobile only (hidden on lg+ screens)
- **Icon:** Hamburger menu

### User Role Badge Display
- **Element:** Span with role name
- **Content:** "ADMIN Access", "EDITOR Access", or "VIEWER Access"
- **Location:** Header right side (desktop) or user menu (mobile)
- **Color-coded:** Purple (ADMIN), Blue (EDITOR), Gray (VIEWER)

---

## 10. Loading States Locators

### Page Loading Spinner
- **Location:** Auth pages during session check
- **Element:** Animated spinner circle
- **Locator:** `<div className="animate-spin">`

### Button Loading State
- **Component:** `<Button>` with `loading={true}`
- **Shows:** Spinner inside button
- **Disabled:** Button becomes disabled
- **Text:** May change to "Loading..." (check implementation)

### Skeleton Loader (Dashboard/Items)
- **Component:** `<Skeleton>`
- **Used For:** Placeholder while loading
- **Example:** 5 skeleton cards while dashboard fetches data

### Modal Loading State
- **Locator Value:** `loading-state`
- **Component File:** `components/items/ItemDetailsModal.jsx:609`
- **Shows:** When modal is loading item data

---

## 11. Empty States Locators

### Empty Items List Message
- **Condition:** No items exist
- **Text:** "No items found"
- **Component:** `<EmptyState>` or custom message

### No Search Results Message
- **Condition:** Search returns 0 results
- **Text:** "No items match your search"
- **Shows in:** Items table area

### No Filtered Results Message
- **Condition:** Applied filters return 0 results
- **Text:** "No items match your filters"
- **Shows in:** Items table area

---

## 12. Role-Specific UI Elements

### Create Button Visibility
- **ADMIN:** Always visible
- **EDITOR:** Always visible
- **VIEWER:** Hidden (button not rendered)
- **Check:** Look for `canPerform('create')` check

### Edit Button Visibility
- **ADMIN:** Always visible (for all items)
- **EDITOR:** Visible only for own items
- **VIEWER:** Hidden (button not rendered)
- **Ownership Check:** `item.created_by === user._id`

### Delete Button Visibility
- **ADMIN:** Always visible (for all items)
- **EDITOR:** Visible only for own items
- **VIEWER:** Hidden (button not rendered)
- **Ownership Check:** `item.created_by === user._id`

### Role-Based Permission Error Messages
- **403 Forbidden:** "Access denied. Requires role: [ADMIN, EDITOR]"
- **Locator:** Error message in response (toast notification)
- **Shown On:** Unauthorized API request

---

## Quick Locator Summary Table

| Component | Locator Value | Type | Dynamic |
|-----------|---------------|------|---------|
| Login Email | `login-email` | data-testid | No |
| Login Password | `login-password` | data-testid | No |
| Login Remember Me | `login-remember-me` | data-testid | No |
| Login Submit | `login-submit` | data-testid | No |
| Item Search | `item-search` | data-testid | No |
| Item Row | `item-row-{id}` | data-testid | Yes |
| Item Name (List) | `item-name-{id}` | data-testid | Yes |
| Item View Button | `item-view-{id}` | data-testid | Yes |
| Item Edit Button | `item-edit-{id}` | data-testid | Yes |
| Item Delete Button | `item-delete-{id}` | data-testid | Yes |
| Details Modal | `item-details-modal` | data-testid | No |
| Item Name (Modal) | `item-name-{sanitizedId}` | data-testid | Yes |
| Delete Modal | `delete-confirmation-modal` | data-testid | No |
| Toast Container | `toast-container` | data-testid | No |
| Success Toast | `toast-success` | data-testid | No |
| Error Toast | `toast-error` | data-testid | No |

---

**End of Locator Reference Guide**
