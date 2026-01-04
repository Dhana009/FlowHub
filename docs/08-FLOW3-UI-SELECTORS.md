# Flow 3: Search & Discovery - UI Selectors Reference
## Complete Locator Guide for Web Automation

**Version:** 1.0  
**Last Updated:** 2024-12-17  
**Source:** Extracted directly from frontend codebase (`flowhub-core/frontend/`) and backend APIs

This document provides all CSS selectors, `data-testid` attributes, and backend API details for Flow 3 (Search & Discovery), extracted directly from the implementation.

---

## Page Route

**URL:** `/items`  
**Component:** `ItemsPage.jsx`  
**Backend API:** `GET /api/v1/items`

---

## Page Container

**Selector:**
```css
div.flex.flex-col
```

**Deterministic Wait Attributes:**
- `data-test-ready` - Set to `"true"` when not loading
- `data-test-items-count` - Number of items currently displayed

**Playwright:**
```python
# Wait for page to be ready
page.wait_for_selector('[data-test-ready="true"]')

# Get item count
count = page.get_attribute('[data-test-items-count]', 'data-test-items-count')
```

---

## Search Input

**Data-testid:** `item-search`  
**CSS Selector:** `[data-testid="item-search"]`  
**Type:** `<input type="text">`  
**Placeholder:** "Search by name or description..."  
**Debounce:** 500ms (waits 500ms after typing stops before API call)

**Deterministic Wait Attributes:**
- `data-test-search-state` - States: `'idle'` | `'debouncing'` | `'loading'` | `'ready'`
- `data-test-last-search` - Last completed search term
- `data-test-search-transition-id` - Increments on each search change

**Playwright:**
```python
# Fill search
page.get_by_test_id("item-search").fill("test item")

# Wait for search to complete (state becomes 'ready')
page.wait_for_selector('[data-testid="item-search"][data-test-search-state="ready"]')

# Verify last search term
last_search = page.get_attribute('[data-testid="item-search"]', 'data-test-last-search')
assert last_search == "test item"
```

---

## Clear Search Button

**Data-testid:** `search-clear`  
**CSS Selector:** `[data-testid="search-clear"]`  
**Type:** `<button>`  
**Shown when:** Search input has value  
**Action:** Clears search input and resets to page 1

**Playwright:**
```python
# Clear search
page.get_by_test_id("search-clear").click()

# Verify search is cleared
page.get_by_test_id("item-search").input_value() == ""
```

---

## Status Filter

**Data-testid:** `filter-status`  
**CSS Selector:** `[data-testid="filter-status"]`  
**Type:** Standard `<select>` tag  
**Default:** `"all"`

**Options:**
- `<option value="all">All</option>`
- `<option value="active">Active</option>`
- `<option value="inactive">Inactive</option>`

**Playwright:**
```python
# Select status filter
page.get_by_test_id("filter-status").select_option("active")

# Verify selected value
page.get_by_test_id("filter-status").input_value() == "active"
```

**Behavior:**
- Resets to page 1 when changed
- Updates URL query param: `?status=active`

---

## Category Filter

**Data-testid:** `filter-category`  
**CSS Selector:** `[data-testid="filter-category"]`  
**Type:** Standard `<select>` tag  
**Default:** `"all"`

**Options:**
- `<option value="all">All</option>`
- Dynamic options from items (extracted from API response)

**Playwright:**
```python
# Select category filter
page.get_by_test_id("filter-category").select_option("Electronics")

# Verify selected value
page.get_by_test_id("filter-category").input_value() == "Electronics"
```

**Behavior:**
- Resets to page 1 when changed
- Updates URL query param: `?category=Electronics`
- Categories are extracted from API response and sorted alphabetically

---

## Clear Filters Button

**Data-testid:** `clear-filters`  
**CSS Selector:** `[data-testid="clear-filters"]`  
**Type:** `<button>`  
**Shown when:** Any filter/search is active (status !== 'all' OR category !== 'all' OR search !== '')  
**Action:** Clears all filters and search, resets to page 1

**Playwright:**
```python
# Clear all filters
page.get_by_test_id("clear-filters").click()

# Verify all cleared
assert page.get_by_test_id("filter-status").input_value() == "all"
assert page.get_by_test_id("filter-category").input_value() == "all"
assert page.get_by_test_id("item-search").input_value() == ""
```

---

## Sorting

### Sortable Column Headers

All sortable columns are clickable `<th>` elements with `data-testid` attributes.

**Sortable Columns:**
1. **Name** - `data-testid="sort-name"`
2. **Category** - `data-testid="sort-category"`
3. **Price** - `data-testid="sort-price"`
4. **Created** - `data-testid="sort-created"`

**Sort Behavior:**
- **First click:** Ascending (`asc`)
- **Second click:** Descending (`desc`)
- **Third click:** Remove sort (defaults to `createdAt desc`)

**Sort Indicators:**
- **No sort:** Gray double-arrow icon
- **Ascending:** Blue up arrow
- **Descending:** Blue down arrow

**Playwright:**
```python
# Click to sort by name (ascending)
page.get_by_test_id("sort-name").click()

# Click again (descending)
page.get_by_test_id("sort-name").click()

# Click again (remove sort, defaults to createdAt desc)
page.get_by_test_id("sort-name").click()

# Verify sort state via URL
page.url  # Should contain ?sort_by=name&sort_order=desc
```

**Aria Attributes:**
- `aria-sort="ascending"` | `"descending"` | `"none"`

---

## Items Table

### Table Container

**Data-testid:** `items-table`  
**CSS Selector:** `[data-testid="items-table"]`  
**Type:** `<table>`  
**Role:** `grid`  
**Aria Label:** "Items inventory grid"

**Playwright:**
```python
# Wait for table to be visible
page.get_by_test_id("items-table").wait_for(state="visible")
```

---

### Table Rows

**Data-testid Pattern:** `item-row-${item._id}`  
**Example:** `item-row-507f1f77bcf86cd799439011`

**Additional Attributes:**
- `data-test-item-status` - `"active"` or `"inactive"`

**Playwright:**
```python
# Get all item rows
rows = page.locator('[data-testid^="item-row-"]').all()

# Get specific item row
item_id = "507f1f77bcf86cd799439011"
row = page.get_by_test_id(f"item-row-{item_id}")

# Verify item status
status = row.get_attribute('data-test-item-status')
assert status == "active"
```

---

### Row Cells

**Name Cell:**
- **Data-testid:** `item-name-${item._id}`
- **Contains:** Item name

**Description Cell:**
- **Data-testid:** `item-description-${item._id}`
- **Contains:** Truncated description (max 100 chars)

**Status Cell:**
- **Data-testid:** `item-status-${item._id}`
- **Contains:** "Active" or "Inactive" badge

**Category Cell:**
- **Data-testid:** `item-category-${item._id}`
- **Contains:** Category name

**Price Cell:**
- **Data-testid:** `item-price-${item._id}`
- **Contains:** Formatted price (e.g., "$99.99")

**Created Date Cell:**
- **Data-testid:** `item-created-${item._id}`
- **Contains:** Formatted date (MM/DD/YYYY)

**Actions Cell:**
- **Data-testid:** `item-actions-${item._id}`
- **Contains:** View, Edit, Delete/Activate buttons

**Playwright:**
```python
item_id = "507f1f77bcf86cd799439011"

# Get item name
name = page.get_by_test_id(f"item-name-{item_id}").text_content()

# Get item price
price_text = page.get_by_test_id(f"item-price-{item_id}").text_content()
# Returns: "$99.99"

# Get item status
status_text = page.get_by_test_id(f"item-status-{item_id}").text_content()
# Returns: "Active" or "Inactive"
```

---

### Row Actions

**View Button:**
- **Data-testid:** `view-item-${item._id}`
- **Text:** "View"
- **Action:** Opens ItemDetailsModal (Flow 4)

**Edit Button:**
- **Data-testid:** `edit-item-${item._id}`
- **Text:** "Edit"
- **Shown when:** Item is active AND user has edit permission
- **Action:** Navigates to `/items/${item_id}/edit`

**Delete/Deactivate Button:**
- **Data-testid:** `delete-item-${item._id}`
- **Text:** "Deactivate"
- **Shown when:** Item is active AND user has delete permission
- **Action:** Opens DeleteConfirmationModal (Flow 6)

**Activate Button:**
- **Data-testid:** `activate-item-${item._id}`
- **Text:** "Activate"
- **Shown when:** Item is inactive AND user has activate permission
- **Action:** Activates item via API

**Playwright:**
```python
item_id = "507f1f77bcf86cd799439011"

# Click view button
page.get_by_test_id(f"view-item-{item_id}").click()

# Click edit button (if visible)
if page.get_by_test_id(f"edit-item-{item_id}").is_visible():
    page.get_by_test_id(f"edit-item-{item_id}").click()
```

---

## Pagination

### Pagination Container

**Data-testid:** `pagination-info`  
**Shown when:** `pagination.total_pages > 0`

**Playwright:**
```python
# Wait for pagination to appear
page.get_by_test_id("pagination-info").wait_for(state="visible")
```

---

### Pagination Controls

**Previous Button:**
- **Data-testid:** `pagination-prev`
- **Disabled when:** `!pagination.has_prev`

**Next Button:**
- **Data-testid:** `pagination-next`
- **Disabled when:** `!pagination.has_next`

**Page Number Buttons:**
- **Data-testid Pattern:** `pagination-page-${pageNum}`
- **Example:** `pagination-page-1`, `pagination-page-2`
- **Shown:** Up to 5 page buttons (smart pagination)
- **Active:** Current page has `variant="primary"`

**Items Per Page Dropdown:**
- **Data-testid:** `pagination-limit`
- **Type:** `<select>`
- **Options:** 10, 20, 50, 100
- **Default:** 20

**Playwright:**
```python
# Click next page
page.get_by_test_id("pagination-next").click()

# Click previous page
page.get_by_test_id("pagination-prev").click()

# Click specific page
page.get_by_test_id("pagination-page-2").click()

# Change items per page
page.get_by_test_id("pagination-limit").select_option("50")

# Verify pagination info text
info = page.get_by_test_id("pagination-info").text_content()
# Example: "Showing 1 to 20 of 100 items"
```

---

## Loading States

### Initial Loading

**Data-testid:** `loading-items`  
**Shown when:** `loading === true && items.length === 0`  
**Contains:** Spinner + "Loading items..." text

**Playwright:**
```python
# Wait for loading to disappear
page.get_by_test_id("loading-items").wait_for(state="hidden")
```

---

### Refresh Loading Overlay

**Shown when:** `loading === true && items.length > 0`  
**No test ID** - Use container selector

**Selector:**
```css
div.absolute.inset-0.bg-white\/60
```

**Contains:** Spinner + "Updating list..." text

**Playwright:**
```python
# Wait for overlay to disappear
page.wait_for_selector('div.absolute.inset-0.bg-white\\/60', state="hidden")
```

---

## Empty State

**Data-testid:** `empty-state`  
**Shown when:** `!loading && items.length === 0 && !error`

**Message:**
- **With filters:** "No items match your filters" + "Try adjusting your search criteria or filters."
- **Without filters:** "No items found" + "Create your first item to get started."

**Playwright:**
```python
# Check for empty state
if page.get_by_test_id("empty-state").is_visible():
    message = page.get_by_test_id("empty-state").text_content()
    assert "No items" in message
```

---

## Backend API Details

### GET /api/v1/items

**Endpoint:** `GET /api/v1/items`  
**Auth:** Required  
**Roles:** ADMIN, EDITOR, VIEWER

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | String | No | - | Searches name and description (case-insensitive, partial match) |
| `status` | Enum | No | - | `active` or `inactive` (filters by `is_active`) |
| `category` | String | No | - | Filters by normalized category |
| `sort_by` | String/Array | No | `['createdAt']` | Fields: `name`, `category`, `price`, `createdAt` |
| `sort_order` | String/Array | No | `['desc']` | `asc` or `desc` |
| `page` | Number | No | `1` | Page number (min: 1) |
| `limit` | Number | No | `20` | Items per page (min: 1, max: 100) |

#### Request Example

```http
GET /api/v1/items?search=test&status=active&category=Electronics&sort_by=name&sort_order=asc&page=1&limit=20
Authorization: Bearer <token>
```

#### Response (200)

```json
{
  "status": "success",
  "items": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Item Name",
      "description": "Item description",
      "item_type": "DIGITAL",
      "price": 99.99,
      "category": "Electronics",
      "is_active": true,
      "created_by": "user_id",
      "createdAt": "2024-12-17T10:30:00Z",
      "updatedAt": "2024-12-17T10:30:00Z",
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

#### Error Responses

- **401:** Not authenticated
- **403:** Insufficient role
- **422:** Invalid query parameters

---

## Deterministic Waits for Automation

### Search State Wait

**Attribute:** `data-test-search-state`  
**Values:** `'idle'` | `'debouncing'` | `'loading'` | `'ready'`

**Playwright:**
```python
# Wait for search to complete
page.wait_for_selector(
    '[data-testid="item-search"][data-test-search-state="ready"]',
    timeout=10000
)
```

---

### Items Count Wait

**Attribute:** `data-test-items-count`  
**Value:** Number of items displayed

**Playwright:**
```python
# Wait for items to load
page.wait_for_selector('[data-test-items-count]', timeout=10000)

# Get count
count = int(page.get_attribute('[data-test-items-count]', 'data-test-items-count'))
assert count > 0
```

---

### Page Ready Wait

**Attribute:** `data-test-ready`  
**Value:** `"true"` when not loading

**Playwright:**
```python
# Wait for page to be ready
page.wait_for_selector('[data-test-ready="true"]', timeout=10000)
```

---

## URL Query Parameters

The page syncs all filters/search/sort/pagination with URL query parameters.

**Example URLs:**
- `/items` - Default (no params)
- `/items?search=test` - Search only
- `/items?status=active&category=Electronics` - Filters
- `/items?sort_by=name&sort_order=asc` - Sorting
- `/items?page=2&limit=50` - Pagination
- `/items?search=test&status=active&sort_by=price&page=2` - Combined

**Playwright:**
```python
# Verify URL contains search param
assert "search=test" in page.url

# Verify URL contains filter
assert "status=active" in page.url

# Navigate with query params
page.goto("/items?search=test&status=active&page=2")
```

---

## Auto-Refresh Behavior

**Interval:** 30 seconds  
**Condition:** Only refreshes if `!isUserActive && !loading`

**User Activity Detection:**
- User typing in search → `isUserActive = true` (for 500ms)
- User changing filter → `isUserActive = true` (for 2 seconds)
- User changing sort → `isUserActive = true` (for 2 seconds)
- User changing page → `isUserActive = true` (for 1 second)
- User changing limit → `isUserActive = true` (for 2 seconds)

**Impact on Tests:**
- Auto-refresh pauses during user interactions
- Tests should account for 30-second refresh cycle
- Silent refresh doesn't show loading overlay

---

## Complete Test Flow Example

```python
# Navigate to items page
page.goto("/items")

# Wait for page to be ready
page.wait_for_selector('[data-test-ready="true"]')

# Verify table is visible
page.get_by_test_id("items-table").wait_for(state="visible")

# Get initial item count
initial_count = int(page.get_attribute('[data-test-items-count]', 'data-test-items-count'))
assert initial_count > 0

# Test search
page.get_by_test_id("item-search").fill("test")
page.wait_for_selector('[data-testid="item-search"][data-test-search-state="ready"]')

# Verify search results
search_count = int(page.get_attribute('[data-test-items-count]', 'data-test-items-count'))
assert search_count <= initial_count

# Test filter
page.get_by_test_id("filter-status").select_option("active")
page.wait_for_selector('[data-test-ready="true"]')

# Test sort
page.get_by_test_id("sort-name").click()
page.wait_for_selector('[data-test-ready="true"]')

# Test pagination
if page.get_by_test_id("pagination-next").is_enabled():
    page.get_by_test_id("pagination-next").click()
    page.wait_for_selector('[data-test-ready="true"]')

# Clear all filters
page.get_by_test_id("clear-filters").click()
page.wait_for_selector('[data-test-ready="true"]')
```

---

## Summary Table

| Element | Data-testid | Type | Notes |
|---------|-------------|------|-------|
| Search Input | `item-search` | input | Debounce 500ms, has state attributes |
| Clear Search | `search-clear` | button | Shown when search has value |
| Status Filter | `filter-status` | select | Options: all, active, inactive |
| Category Filter | `filter-category` | select | Dynamic options from API |
| Clear Filters | `clear-filters` | button | Shown when any filter active |
| Sort Name | `sort-name` | th | Clickable, cycles: asc → desc → remove |
| Sort Category | `sort-category` | th | Clickable |
| Sort Price | `sort-price` | th | Clickable |
| Sort Created | `sort-created` | th | Clickable |
| Table | `items-table` | table | Main items table |
| Item Row | `item-row-${id}` | tr | Has status attribute |
| Item Name | `item-name-${id}` | td | Cell content |
| Item Status | `item-status-${id}` | td | "Active" or "Inactive" badge |
| View Button | `view-item-${id}` | button | Opens modal |
| Edit Button | `edit-item-${id}` | button | Role-dependent |
| Delete Button | `delete-item-${id}` | button | Role-dependent |
| Activate Button | `activate-item-${id}` | button | Role-dependent |
| Pagination Info | `pagination-info` | div | Container |
| Pagination Prev | `pagination-prev` | button | Disabled on first page |
| Pagination Next | `pagination-next` | button | Disabled on last page |
| Pagination Page | `pagination-page-${num}` | button | Up to 5 buttons |
| Pagination Limit | `pagination-limit` | select | 10, 20, 50, 100 |
| Loading | `loading-items` | div | Initial load only |
| Empty State | `empty-state` | div | No items found |

---

## Backend API Summary

**Endpoint:** `GET /api/v1/items`  
**Query Params:** `search`, `status`, `category`, `sort_by`, `sort_order`, `page`, `limit`  
**Response:** `{ status: 'success', items: [...], pagination: {...} }`  
**Pagination Object:** `{ page, limit, total, total_pages, has_next, has_prev }`

---

**End of Flow 3 UI Selectors**
