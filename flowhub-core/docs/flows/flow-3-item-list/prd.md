# **FlowHub — PRD: Flow 3 - Item List**

**Version:** 1.2 (Final - All Ambiguities Resolved)  
**Date:** December 17, 2024  
**Author:** Product Manager  
**Status:** ✅ LOCKED - Ready for Functional Specification

---

## **1. Overview**

FlowHub allows authenticated users to view, search, filter, sort, and paginate through items in a dynamic table interface. The system provides real-time updates and comprehensive query capabilities for automation testing.

**Flow Name:** Item List  
**Flow ID:** FLOW-003  
**Priority:** P0 (Critical - Core functionality)

---

## **2. Problem Statement**

Users need to efficiently browse and find items in FlowHub. The system must:
- Display items in a clear, organized table
- Support searching by name/description
- Allow filtering by status, category, and other criteria
- Enable sorting by multiple fields
- Provide pagination for large datasets
- Update dynamically as data changes
- Handle complex query combinations

---

## **3. Business Value**

- **User Experience:** Easy item discovery and browsing
- **Efficiency:** Quick filtering and sorting saves time
- **Scalability:** Pagination handles large datasets
- **Automation Testing:** Comprehensive query scenarios for test coverage
- **Data Visibility:** Real-time updates keep data current

---

## **4. User Story**

**As a** authenticated user  
**I want to** view, search, filter, sort, and paginate through items  
**So that** I can efficiently find and manage items in the system

---

## **5. User Journey**

### **Item List Flow:**

1. User navigates to "Items" page (must be authenticated)
2. User sees item list table with columns:
   - Name
   - Description (truncated)
   - Status
   - Category
   - Price
   - Created Date
   - Actions (View, Edit, Delete buttons)
3. **Search Functionality:**
   - User types in search box (real-time search with debounce)
   - System searches in name and description fields
   - Table updates automatically as user types
4. **Filter Functionality:**
   - User selects status filter (dropdown: All, Active, Inactive)
   - User selects category filter (dropdown: All, Electronics, Books, Services, etc.)
   - Table updates to show filtered results
   - Multiple filters can be applied simultaneously
5. **Sort Functionality:**
   - User clicks column header to sort
   - Click once: Sort ascending
   - Click again: Sort descending
   - Click third time: Remove sort (default order)
   - Visual indicator shows current sort (arrow up/down)
   - Multiple columns can be sorted (primary, secondary, tertiary)
6. **Pagination Functionality:**
   - User sees pagination controls at bottom
   - Shows: "Page X of Y", "Showing 1-20 of 100 items"
   - Previous/Next buttons
   - Page number buttons (1, 2, 3, ...)
   - User can change items per page (10, 20, 50, 100)
7. **Real-time Updates:**
   - Table auto-refreshes every 30 seconds
   - **Auto-refresh pauses when:**
     - User is typing in search box (resumes 2 seconds after typing stops)
     - Dropdown is open (resumes when dropdown closes)
   - New items appear automatically
   - Updated items reflect changes
   - Deleted items disappear
   - **Silent refresh:** No loading indicator during auto-refresh (unless data changes)
   - Maintains current filters, search, sort, and page during auto-refresh
8. **Combined Operations:**
   - User can combine: Search + Filter + Sort + Pagination
   - Example: Search "laptop", Filter by "Electronics", Sort by "Price (desc)", Page 2
   - All operations work together seamlessly

---

## **6. Search Functionality**

**Search Fields:**
- Name (partial match, case-insensitive)
- Description (partial match, case-insensitive)

**Behavior:**
- Real-time search (debounced 300ms)
- Searches as user types
- Shows "No results found" if no matches
- Clears search on "X" button click
- Search persists in URL query parameters

**Technical:**
- **Name Search:** Normalize search query using same algorithm as Flow 2: `search.toLowerCase().trim().replace(/\s+/g, ' ')`
- **Name Field:** Search against `normalizedName` field (normalized, indexed field)
- **Description Search:** Search original `description` field with original query (no normalization)
- **MongoDB Query Pattern:**
  ```javascript
  {
    $or: [
      { normalizedName: { $regex: normalizedSearch, $options: "i" } },
      { description: { $regex: originalSearch.trim(), $options: "i" } }
    ]
  }
  ```
- **Example:** Search "  iPhone  " → Normalizes to "iphone" for name search, uses "  iPhone  " for description search

---

## **7. Filter Functionality**

### **7.1 Status Filter**

**Options:**
- All (default - shows all items)
- Active (shows items where `is_active = true`)
- Inactive (shows items where `is_active = false`)

**Behavior:**
- Single-select dropdown (not multi-select)
- Filters items by `is_active` boolean field
- **Note:** No "Pending" status - database uses boolean `is_active` field only
- Filter persists in URL query parameters
- **Database Query:**
  - `status=active` → `{ is_active: true }`
  - `status=inactive` → `{ is_active: false }`
  - `status=all` or no status → No filter applied

### **7.2 Category Filter**

**Options:**
- All (default - shows all categories)
- Dynamic list of unique categories from database
- Categories displayed in original format (e.g., "Electronics", "Home Appliances")

**Behavior:**
- Single-select dropdown (not multi-select)
- **Backend:** Filters by `normalizedCategory` field (Title Case normalized, same as Flow 2)
- **Frontend:** Dropdown shows original category names for better UX
- **Normalization:** User input is normalized using `categoryService.normalizeCategory()` (Title Case)
- Filter persists in URL query parameters
- **Database Query:** `{ normalizedCategory: "Electronics" }` (normalized Title Case)
- **Example:** User selects "electronics" → Normalized to "Electronics" → Matches `normalizedCategory` field

---

## **8. Sort Functionality**

**Sortable Columns (4 fields only):**
- `name` (alphabetical)
- `category` (alphabetical)
- `price` (numerical)
- `createdAt` (chronological)

**Note:** Status is NOT sortable. Conditional fields (weight, download_url, duration_hours) are NOT sortable. Normalized fields (normalizedName, normalizedCategory) are NOT directly sortable - use original fields instead.

**Sort Behavior:**
- Click column header to sort
- First click: Ascending
- Second click: Descending
- Third click: Default order (createdAt desc)
- Visual indicator: ↑ (asc), ↓ (desc), — (no sort)
- **Multi-column sorting:** Maximum 2 columns supported (primary and secondary)
- Sort order: Primary → Secondary
- **Invalid sort fields:** Default to `createdAt` if invalid field provided (no error shown)

**Default Sort:**
- `createdAt` (descending) - newest first
- Applied when no sort is specified or all sorts are cleared

**API Parameters:**
- `sort_by`: Array of field names (max 2), e.g., `["name", "price"]`
- `sort_order`: Array of sort directions (max 2), e.g., `["asc", "desc"]`
- If arrays have different lengths, missing orders default to "desc"
- If invalid field provided, it's replaced with "createdAt"

---

## **9. Pagination Functionality**

**Pagination Controls:**
- Previous button (disabled on first page)
- Next button (disabled on last page)
- Page number buttons (1, 2, 3, ...)
- Items per page selector (10, 20, 50, 100)
- Total count display: "Showing 1-20 of 100 items"
- Page indicator: "Page 1 of 5"

**Behavior:**
- Default: Page 1, 20 items per page
- User can change page size
- Changing page size resets to page 1
- Changing filters resets to page 1
- Pagination persists in URL query parameters

**Edge Cases:**
- **Empty results:** Show "No items found" message
- **Single page:** Hide pagination controls
- **Invalid page number (page > totalPages):** Auto-redirect to last valid page (no error shown)
- **Invalid page number (page < 1):** Auto-redirect to page 1 (no error shown)
- **Invalid limit:** Auto-correct to valid value (min: 1, max: 100, default: 20)
- **Limit change:** When user changes items per page, maintain similar item position when possible

---

## **10. Table Display**

### **10.1 Table Columns**

**Required Columns:**
- Name (text, sortable, searchable)
- Description (text, truncated to 100 chars, tooltip on hover)
- Status (badge: Active/Inactive, color-coded - NOT sortable)
  - Active: Green badge (is_active = true)
  - Inactive: Gray badge (is_active = false)
- Category (text, sortable, filterable)
- Price (currency format: $X.XX, sortable)
- Created Date (date format: MM/DD/YYYY, sortable)
- Actions (View, Edit, Delete buttons)

**Optional Columns (can be toggled):**
- Updated Date
- Created By
- Tags

### **10.2 Table Features**

- **Responsive Design:** Table scrolls horizontally on mobile
- **Row Hover:** Highlight row on hover
- **Loading State:** Skeleton loader while fetching
- **Empty State:** "No items found" message with illustration
- **Error State:** Error message with retry button

---

## **11. API Endpoint Specification**

**Endpoint:** `GET /api/items`

**Query Parameters:**
- `search` (optional, string): Search term for name/description
  - Name search: Query is normalized using `toLowerCase().trim().replace(/\s+/g, ' ')` and searched against `normalizedName`
  - Description search: Original query (trimmed) searched against `description` field
- `status` (optional, string): Filter by status - values: `"active"`, `"inactive"`, or omitted for all
  - Maps to `is_active` boolean: `active` → `true`, `inactive` → `false`
- `category` (optional, string): Filter by category
  - Category value is normalized to Title Case using `categoryService.normalizeCategory()`
  - Filtered against `normalizedCategory` field
- `sort_by` (optional, array): Sort field(s) - max 2 fields (default: `["createdAt"]`)
  - Allowed fields: `name`, `category`, `price`, `createdAt`
  - Invalid fields are replaced with `createdAt` (no error)
- `sort_order` (optional, array): Sort order(s) - max 2 values (default: `["desc"]`)
  - Values: `"asc"` or `"desc"`
  - Missing values default to `"desc"`
- `page` (optional, integer): Page number (default: 1, min: 1)
  - Invalid values (< 1) default to 1
  - Values > totalPages auto-correct to last page (no error)
- `limit` (optional, integer): Items per page (default: 20, min: 1, max: 100)
  - Invalid values auto-correct to nearest valid value (no error)

**Parameter Validation:**
- Invalid parameters use defaults (no 400 errors for invalid params)
- All parameters are optional
- Arrays are validated and truncated to max allowed length

**Example Request:**
```
GET /api/items?search=laptop&status=active&category=Electronics&sort_by=price&sort_order=desc&page=1&limit=20
```

**Response Format:**
```json
{
  "items": [...],
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

---

## **12. Error Handling**

### **12.1 Error Scenarios**

**400 Bad Request:**
- Invalid query parameter format (e.g., non-numeric page/limit)
- **Note:** Invalid parameter values (e.g., page=0, invalid sort field) are auto-corrected to defaults, NOT returned as errors

**401 Unauthorized:**
- Missing/invalid authentication token
- **Auto-refresh behavior:** If token expires during auto-refresh, attempt silent token refresh. If refresh fails, auto-refresh silently fails (no user disruption)

**500 Internal Server Error:**
- Database connection failure
- Unexpected server errors

### **12.2 Error Display**

- **Frontend:** Show error message above table
- **Retry Button:** Allow user to retry request
- **Fallback:** Show cached data if available

---

## **13. Performance Requirements**

- **API Response Time:** < 500ms for typical queries
- **Table Render Time:** < 100ms for 20 items
- **Search Debounce:** 300ms delay
- **Auto-refresh Interval:** 30 seconds
- **Max Items Per Page:** 100 (enforced)

---

## **14. Database Requirements**

**Database:** MongoDB  
**Collection:** `items` (same as Flow 2)

**Required Indexes:**
- `{ normalizedName: 1 }` (for name search - already exists from Flow 2)
- `{ normalizedCategory: 1 }` (for category filter - already exists from Flow 2)
- `{ is_active: 1, createdAt: -1 }` (for status filter + default sort)
- `{ normalizedCategory: 1, price: -1 }` (for category filter + price sort)
- `{ createdAt: -1 }` (for default sort - already exists from Flow 2)
- `{ name: 1 }` (for name sort)
- `{ category: 1 }` (for category sort)
- `{ price: 1 }` (for price sort)

**Note:** Uses existing indexes from Flow 2. Additional indexes may be added for optimization.

**Query Optimization:**
- Use indexes for all filter/sort operations
- Limit projection to required fields only
- Use efficient pagination (skip/limit or cursor-based)

---

## **15. Out of Scope**

- Bulk operations (select multiple items)
- Export to CSV/Excel
- Advanced filters (date ranges, price ranges)
- Saved filter presets
- Column customization (show/hide columns)
- Infinite scroll pagination
- Virtual scrolling for very large datasets

---

## **16. Ambiguity Resolutions (v1.1)**

**All ambiguities resolved through Gemini Architecture Analysis:**

1. **Status Filter:** Removed "Pending" option. Database uses boolean `is_active` field only. Filter shows "Active" (is_active=true) and "Inactive" (is_active=false).

2. **Search Normalization:** 
   - Name search: Query normalized using `toLowerCase().trim().replace(/\s+/g, ' ')` (same as Flow 2), searched against `normalizedName` field
   - Description search: Original query (trimmed) searched against `description` field

3. **Category Filter:** 
   - Backend filters by `normalizedCategory` (Title Case, same as Flow 2)
   - Frontend dropdown shows original category names
   - User input normalized using `categoryService.normalizeCategory()`

4. **Sort Fields:** 
   - Only 4 allowed fields: `name`, `category`, `price`, `createdAt`
   - Status and conditional fields are NOT sortable
   - Invalid fields default to `createdAt` (no error)

5. **Multi-column Sort:** 
   - Maximum 2 columns supported (primary and secondary)
   - Invalid fields replaced with defaults
   - Missing sort orders default to "desc"

6. **Pagination:** 
   - Invalid page numbers auto-corrected (no errors)
   - Page > totalPages → redirect to last page
   - Page < 1 → redirect to page 1
   - Invalid limit values auto-corrected to valid range

7. **URL Parameters:** 
   - Invalid parameters use defaults (no validation errors)
   - All parameters are optional
   - Arrays validated and truncated to max length

8. **Auto-refresh:** 
   - Pauses when user is typing (resumes 2s after typing stops)
   - Pauses when dropdown is open
   - Silent refresh (no loading indicator unless data changes)

9. **Integration with Flow 2:** 
   - Uses same normalization algorithms
   - Uses same `normalizedCategory` field (Title Case)
   - Uses same `normalizedName` field (lowercase, whitespace-normalized)
   - Respects `is_active` boolean field

10. **Search Regex Injection Protection:**
    - Escape special regex characters before MongoDB query
    - Normalize first: `toLowerCase().trim().replace(/\s+/g, ' ')`
    - Then escape: Replace `[.*+?^${}()|[\]\\]` with escaped versions
    - Apply to both normalizedName and description searches

11. **Empty Search Query Handling:**
    - Treat empty string (`""`), `null`, and `undefined` all as "no search"
    - No query applied when search is empty
    - Trim whitespace before checking if empty

12. **Description Null Handling:**
    - If description is `null` in database, skip it in search query
    - Use `{ description: { $exists: true } }` filter for description search
    - Null descriptions don't match any search query

13. **Duplicate Sort Fields:**
    - Remove duplicate fields from `sort_by` array (keep first occurrence)
    - Example: `["name", "name", "price"]` → `["name", "price"]`
    - Max 2 fields after deduplication

14. **Null Value Sorting:**
    - MongoDB default: ASC (1) = nulls first, DESC (-1) = nulls last
    - Accept default behavior (nulls last in descending, nulls first in ascending)
    - No special null handling needed for simplicity

15. **URL Parameter Conflicts:**
    - Express default: Last value wins for duplicate parameters
    - Example: `?status=active&status=inactive` → `status = "inactive"`
    - This behavior is acceptable and documented

16. **Zero Results Pagination:**
    - Format: `{ page: 1, total_pages: 0, total: 0, has_next: false, has_prev: false }`
    - Always show page 1 when no results
    - Hide pagination controls when total_pages = 0

17. **Auto-refresh Page Stability:**
    - Maintain current page number during auto-refresh
    - If page becomes invalid (items deleted), redirect to last valid page
    - If total changes, recalculate total_pages but keep current page if valid

18. **Non-existent Category Filter:**
    - Return empty results (no error) if category doesn't exist
    - MongoDB naturally handles this - no special code needed

19. **Token Expiry During Auto-refresh:**
    - Silent fail pattern (matches Flow 1)
    - Attempt token refresh once, if fails: log error, don't disrupt user
    - Return 401 with `silent: true` flag for frontend handling

20. **Empty State Messaging:**
    - No items in database: "No items found. Create your first item!"
    - No items match filters: "No items match your filters. Try adjusting your search criteria."
    - No items match search: "No items found for '{search_query}'. Try different keywords."

---

## **17. Approval & Sign-off**

**PRD Status:** ✅ **UPDATED - Synchronized with Implementation**  
**Version:** 1.3 (Updated to match implementation)  
**Date Updated:** December 2024

**Changes in v1.3 (Implementation Synchronization):**
- Verified all implementation details match PRD specifications
- Confirmed auto-refresh behavior (30 seconds, pauses on user activity)
- Confirmed search debounce (300ms) and auto-refresh resume (2 seconds)
- Confirmed URL parameter persistence
- Confirmed multi-column sorting (max 2 columns)
- Confirmed user data isolation (users only see their own items)
- All edge cases and ambiguity resolutions verified in implementation

**Changes in v1.2 (Fresh Ambiguity Analysis):**
- Added search regex injection protection (escape special characters)
- Clarified empty search query handling (empty string, null, undefined)
- Clarified description null handling in database
- Added duplicate sort fields removal logic
- Clarified null value sorting behavior (MongoDB defaults)
- Clarified URL parameter conflict resolution (Express default)
- Added zero results pagination format specification
- Clarified auto-refresh page stability behavior
- Clarified non-existent category filter behavior
- Added token expiry handling during auto-refresh
- Added empty state messaging specifications

**Changes in v1.1:**
- Removed "Pending" status option (database uses boolean only)
- Clarified search normalization algorithm (matches Flow 2)
- Clarified category filter uses `normalizedCategory` (Title Case)
- Limited sortable fields to 4 common fields
- Limited multi-column sort to max 2 columns
- Clarified pagination auto-correction behavior
- Clarified URL parameter validation (defaults, no errors)
- Clarified auto-refresh pause conditions
- Added integration points with Flow 2

**Approved By:**
- Product Manager: ✅ Approved
- Tester/SDET: ✅ Ambiguity Analysis Complete & Resolved
- Stakeholders: ✅ Approved

**Next Steps:**
- Implementation complete and synchronized
- Test against updated requirements
- Proceed to Flow 4 (Item Details) review

---

**Document Version:** 1.3 (Updated to match implementation)  
**Status:** ✅ UPDATED - Synchronized with implementation

