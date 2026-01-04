# Flow 2: Create Item - UI Selectors Reference
## Complete Locator Guide for Automation

**Version:** 1.0  
**Last Updated:** 2024-12-17  
**Source:** Extracted directly from frontend codebase (`flowhub-core/frontend/`)

This document provides all CSS selectors and `data-testid` attributes for the Create Item page, extracted directly from the frontend implementation.

---

## Page Route

**URL:** `/items/create`  
**Component:** `CreateItemPage.jsx`  
**Form Component:** `ItemCreationForm.jsx`

---

## Form Container

**Selector:**
```css
form[aria-label="Create item form"]
```

**Alternative:**
```css
form[role="form"]
```

**Data-testid:** None (use form selector above)

---

## Input Fields

### 1. Name Field

**Data-testid:** `item-name`  
**CSS Selector:** `[data-testid="item-name"]`  
**Type:** `<input type="text">`  
**Required:** Yes  
**Placeholder:** "Enter item name"

**Playwright:**
```python
page.get_by_test_id("item-name")
# or
page.locator('[data-testid="item-name"]')
```

---

### 2. Description Field

**Data-testid:** `item-description`  
**CSS Selector:** `[data-testid="item-description"]`  
**Type:** `<textarea>`  
**Required:** Yes  
**Placeholder:** "Enter item description"

**Playwright:**
```python
page.get_by_test_id("item-description")
# or
page.locator('[data-testid="item-description"]')
```

**Error Message Selector:**
- **Data-testid:** `description-error`  
**CSS Selector:** `[data-testid="description-error"]`

---

### 3. Item Type Selector

**Data-testid:** `item-type`  
**CSS Selector:** `[data-testid="item-type"]`  
**Type:** Standard `<select>` tag (NOT custom div)  
**Required:** Yes

**Options:**
- `<option value="">Select item type</option>` (default)
- `<option value="PHYSICAL">Physical</option>`
- `<option value="DIGITAL">Digital</option>`
- `<option value="SERVICE">Service</option>`

**Playwright:**
```python
# Select by value
page.get_by_test_id("item-type").select_option("DIGITAL")

# Select by label
page.get_by_test_id("item-type").select_option(label="Digital")

# Verify selected value
page.get_by_test_id("item-type").input_value()  # Returns "DIGITAL"
```

**Error Message Selector:**
- **Data-testid:** `item-type-error`  
**CSS Selector:** `[data-testid="item-type-error"]`

---

### 4. Price Field

**Data-testid:** `item-price`  
**CSS Selector:** `[data-testid="item-price"]`  
**Type:** `<input type="number">`  
**Required:** Yes  
**Placeholder:** "0.00"  
**Attributes:** `step="0.01"`, `min="0.01"`

**Playwright:**
```python
page.get_by_test_id("item-price")
```

---

### 5. Category Field

**Data-testid:** `item-category`  
**CSS Selector:** `[data-testid="item-category"]`  
**Type:** `<input type="text">`  
**Required:** Yes  
**Placeholder:** "Enter category"

**Playwright:**
```python
page.get_by_test_id("item-category")
```

---

### 6. Tags Field

**Data-testid:** `item-tags`  
**CSS Selector:** `[data-testid="item-tags"]`  
**Type:** `<input type="text">`  
**Required:** No (optional)  
**Placeholder:** "tag1, tag2, tag3"

**Playwright:**
```python
page.get_by_test_id("item-tags")
```

**Note:** Tags are comma-separated. Frontend splits by comma and trims each tag.

---

### 7. Embed URL Field (Optional)

**Data-testid:** `item-embed-url`  
**CSS Selector:** `[data-testid="item-embed-url"]`  
**Type:** `<input type="url">`  
**Required:** No (optional)  
**Placeholder:** "https://example.com/embed/content"

**Playwright:**
```python
page.get_by_test_id("item-embed-url")
```

---

## Conditional Fields (Based on Item Type)

### PHYSICAL Item Fields

**Container Data-testid:** `physical-fields`  
**Shown when:** `item_type === "PHYSICAL"`

#### Weight Field

**Data-testid:** `item-weight`  
**Type:** `<input type="number">`  
**Required:** Yes (for PHYSICAL items)  
**Placeholder:** "0.00"  
**Attributes:** `step="0.01"`, `min="0.01"`

#### Dimensions Fields

**Container:** `<div role="group" aria-labelledby="dimensions-label">`

**Length:**
- **Data-testid:** `item-dimension-length`
- **Type:** `<input type="number">`
- **Required:** Yes
- **Placeholder:** "0.00"

**Width:**
- **Data-testid:** `item-dimension-width`
- **Type:** `<input type="number">`
- **Required:** Yes
- **Placeholder:** "0.00"

**Height:**
- **Data-testid:** `item-dimension-height`
- **Type:** `<input type="number">`
- **Required:** Yes
- **Placeholder:** "0.00"

**Playwright Example:**
```python
# Verify physical fields are visible
page.get_by_test_id("physical-fields").is_visible()

# Fill dimensions
page.get_by_test_id("item-weight").fill("10.5")
page.get_by_test_id("item-dimension-length").fill("20.0")
page.get_by_test_id("item-dimension-width").fill("15.0")
page.get_by_test_id("item-dimension-height").fill("5.0")
```

---

### DIGITAL Item Fields

**Container Data-testid:** `digital-fields`  
**Shown when:** `item_type === "DIGITAL"`

#### Download URL Field

**Data-testid:** `item-download-url`  
**Type:** `<input type="url">`  
**Required:** Yes (for DIGITAL items)  
**Placeholder:** "https://example.com/download/file.zip"

#### File Size Field

**Data-testid:** `item-file-size`  
**Type:** `<input type="number">`  
**Required:** Yes (for DIGITAL items)  
**Placeholder:** "0"  
**Attributes:** `min="1"`

**Playwright Example:**
```python
# Verify digital fields are visible
page.get_by_test_id("digital-fields").is_visible()

# Fill digital fields
page.get_by_test_id("item-download-url").fill("https://example.com/file.zip")
page.get_by_test_id("item-file-size").fill("1024000")
```

---

### SERVICE Item Fields

**Container Data-testid:** `service-fields`  
**Shown when:** `item_type === "SERVICE"`

#### Duration Hours Field

**Data-testid:** `item-duration-hours`  
**Type:** `<input type="number">`  
**Required:** Yes (for SERVICE items)  
**Placeholder:** "0"  
**Attributes:** `min="1"`, `step="1"`

**Playwright Example:**
```python
# Verify service fields are visible
page.get_by_test_id("service-fields").is_visible()

# Fill duration
page.get_by_test_id("item-duration-hours").fill("8")
```

---

## File Upload

**Component:** `FileUpload.jsx`

### File Input

**Data-testid:** `item-file-upload`  
**Type:** `<input type="file">`  
**Required:** No (optional)  
**Accept:** `.jpg, .jpeg, .png, .pdf, .doc, .docx`  
**Max Size:** 5 MB  
**Min Size:** 1 KB

**Is input hidden?** ❌ **NO** - It's a visible file input with custom styling

**Playwright:**
```python
# Upload file
page.get_by_test_id("item-file-upload").set_input_files("path/to/file.pdf")

# Verify file is selected
page.get_by_test_id("selected-file").is_visible()
```

### Selected File Display

**Data-testid:** `selected-file`  
**Shown when:** File is selected  
**Contains:** File name and size

### Remove File Button

**Data-testid:** `remove-file`  
**Shown when:** File is selected

**Playwright:**
```python
# Remove selected file
page.get_by_test_id("remove-file").click()
```

### File Error Message

**Data-testid:** `file-error`  
**Shown when:** File validation fails (wrong type, too large, etc.)

---

## Buttons

### Submit Button

**Data-testid:** `create-item-submit`  
**Type:** `<button type="submit">`  
**Text:** "Create Item"  
**Aria Label:** "Create Item Submit"

**Playwright:**
```python
page.get_by_test_id("create-item-submit").click()

# Check if disabled/loading
page.get_by_test_id("create-item-submit").is_disabled()
```

---

### Cancel Button

**Data-testid:** `create-item-cancel`  
**Type:** `<button type="button">`  
**Text:** "Cancel"  
**Aria Label:** "Cancel Item Creation"  
**Action:** Navigates to `/items` (replaces history)

**Playwright:**
```python
page.get_by_test_id("create-item-cancel").click()
```

---

## Error Messages

### Form-Level Error

**Data-testid:** `create-item-error`  
**Shown when:** Submission fails (network error, validation error, etc.)  
**Aria Live:** `assertive`

**Playwright:**
```python
# Check for form-level error
page.get_by_test_id("create-item-error").is_visible()
error_text = page.get_by_test_id("create-item-error").text_content()
```

### Field-Level Errors

All input fields have error messages with pattern: `[data-testid]-error`

**Examples:**
- `item-name-error`
- `item-description-error` (uses `description-error`)
- `item-type-error`
- `item-price-error`
- `item-category-error`
- `item-tags-error`
- `item-weight-error`
- `item-dimension-length-error`
- `item-download-url-error`
- `item-file-size-error`
- `item-duration-hours-error`

**Playwright:**
```python
# Check for field error
page.get_by_test_id("item-name-error").is_visible()
error_text = page.get_by_test_id("item-name-error").text_content()
```

---

## Success Handling

### Success Flow

1. **Form Submission:**** User clicks `create-item-submit` button
2. **API Call:** Frontend calls `POST /api/v1/items` with form data
3. **Success Response:** Backend returns `{ status: 'success', data: {...} }`
4. **Toast Message:** Frontend shows toast: `"Item created"` (success type)
5. **Redirect:** Frontend navigates to `/items` (replaces history)

### Toast Message

**Component:** `ToastContext` → `ToastContainer` → `Toast`  
**Message:** `"Item created"`  
**Type:** `success`  
**Duration:** 3000ms (3 seconds)  
**Position:** Top-right corner

**Test IDs:**
- **Container:** `toast-container`
- **Success Toast:** `toast-success`
- **Dismiss Button:** `toast-dismiss-button`

**How to Verify:**
1. Check URL redirects to `/items`
2. Check for success toast message

**Playwright:**
```python
# Wait for redirect
page.wait_for_url("**/items")

# Verify success toast appears
toast = page.get_by_test_id("toast-success")
toast.wait_for(state="visible")

# Verify toast message
toast_text = toast.text_content()
assert "Item created" in toast_text

# Toast auto-dismisses after 3 seconds
toast.wait_for(state="hidden", timeout=4000)
```

---

## Complete Form Fill Example (DIGITAL Item)

```python
# Navigate to create page
page.goto("/items/create")

# Fill base fields
page.get_by_test_id("item-name").fill("Test Digital Item")
page.get_by_test_id("item-description").fill("This is a test digital item description with enough characters")
page.get_by_test_id("item-price").fill("29.99")
page.get_by_test_id("item-category").fill("Software")
page.get_by_test_id("item-tags").fill("test, digital, software")

# Select item type (triggers conditional fields)
page.get_by_test_id("item-type").select_option("DIGITAL")

# Wait for digital fields to appear
page.get_by_test_id("digital-fields").wait_for(state="visible")

# Fill digital-specific fields
page.get_by_test_id("item-download-url").fill("https://example.com/download/test.zip")
page.get_by_test_id("item-file-size").fill("1024000")

# Optional: Upload file
page.get_by_test_id("item-file-upload").set_input_files("test-file.pdf")

# Optional: Add embed URL
page.get_by_test_id("item-embed-url").fill("https://example.com/embed")

# Submit form
page.get_by_test_id("create-item-submit").click()

# Wait for redirect to items page
page.wait_for_url("**/items")
```

---

## Complete Form Fill Example (PHYSICAL Item)

```python
# Navigate to create page
page.goto("/items/create")

# Fill base fields
page.get_by_test_id("item-name").fill("Test Physical Item")
page.get_by_test_id("item-description").fill("This is a test physical item description with enough characters")
page.get_by_test_id("item-price").fill("49.99")
page.get_by_test_id("item-category").fill("Electronics")

# Select item type
page.get_by_test_id("item-type").select_option("PHYSICAL")

# Wait for physical fields to appear
page.get_by_test_id("physical-fields").wait_for(state="visible")

# Fill physical-specific fields
page.get_by_test_id("item-weight").fill("2.5")
page.get_by_test_id("item-dimension-length").fill("30.0")
page.get_by_test_id("item-dimension-width").fill("20.0")
page.get_by_test_id("item-dimension-height").fill("10.0")

# Submit form
page.get_by_test_id("create-item-submit").click()

# Wait for redirect
page.wait_for_url("**/items")
```

---

## Complete Form Fill Example (SERVICE Item)

```python
# Navigate to create page
page.goto("/items/create")

# Fill base fields
page.get_by_test_id("item-name").fill("Test Service Item")
page.get_by_test_id("item-description").fill("This is a test service item description with enough characters")
page.get_by_test_id("item-price").fill("99.99")
page.get_by_test_id("item-category").fill("Services")

# Select item type
page.get_by_test_id("item-type").select_option("SERVICE")

# Wait for service fields to appear
page.get_by_test_id("service-fields").wait_for(state="visible")

# Fill service-specific fields
page.get_by_test_id("item-duration-hours").fill("8")

# Submit form
page.get_by_test_id("create-item-submit").click()

# Wait for redirect
page.wait_for_url("**/items")
```

---

## Validation Notes

1. **Conditional Fields:** Only appear after `item_type` is selected
2. **Field Clearing:** When `item_type` changes, conditional fields are cleared
3. **Client-Side Validation:** Runs on blur and submit
4. **Server-Side Validation:** Backend validates all fields
4. **Error Messages:** Field errors appear below each field with `[field]-error` test ID

---

## Summary Table

| Element | Data-testid | Type | Required | Notes |
|---------|-------------|------|----------|-------|
| Name | `item-name` | input | Yes | Text input |
| Description | `item-description` | textarea | Yes | Multi-line |
| Item Type | `item-type` | select | Yes | Standard `<select>`, values: PHYSICAL, DIGITAL, SERVICE |
| Price | `item-price` | input | Yes | Number, step 0.01 |
| Category | `item-category` | input | Yes | Text input |
| Tags | `item-tags` | input | No | Comma-separated |
| Embed URL | `item-embed-url` | input | No | URL input |
| Weight | `item-weight` | input | If PHYSICAL | Number |
| Length | `item-dimension-length` | input | If PHYSICAL | Number |
| Width | `item-dimension-width` | input | If PHYSICAL | Number |
| Height | `item-dimension-height` | input | If PHYSICAL | Number |
| Download URL | `item-download-url` | input | If DIGITAL | URL input |
| File Size | `item-file-size` | input | If DIGITAL | Number |
| Duration | `item-duration-hours` | input | If SERVICE | Integer |
| File Upload | `item-file-upload` | file | No | Max 5MB |
| Submit | `create-item-submit` | button | - | Submit form |
| Cancel | `create-item-cancel` | button | - | Navigate to /items |

---

**End of Flow 2 UI Selectors**
