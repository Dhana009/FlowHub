# **FlowHub — PRD: Flow 4 - Item Details**

**Version:** 1.1 (Updated - Ambiguities Resolved)  
**Date:** December 17, 2024  
**Last Updated:** December 17, 2024  
**Author:** Product Manager  
**Status:** ✅ LOCKED - Ready for Functional Specification

---

## **1. Overview**

FlowHub allows authenticated users to view detailed information about a specific item in a modal popup. The system provides async content loading, embedded iframe content, and comprehensive error handling for automation testing.

**Flow Name:** Item Details  
**Flow ID:** FLOW-004  
**Priority:** P0 (Critical - Core functionality)

---

## **2. Problem Statement**

Users need to view detailed information about items without navigating away from the list page. The system must:
- Display item details in a modal popup
- Load content asynchronously
- Support embedded content via iframe
- Handle loading and error states gracefully
- Provide semantic HTML for automation testing

---

## **3. Business Value**

- **User Experience:** Quick item details without page navigation
- **Efficiency:** Modal keeps context (user stays on list page)
- **Rich Content:** iframe support for embedded details
- **Automation Testing:** Comprehensive states for test coverage
- **Accessibility:** Semantic HTML for screen readers

---

## **4. User Story**

**As a** authenticated user  
**I want to** view detailed information about an item in a modal  
**So that** I can see item details without leaving the list page

---

## **5. User Journey**

### **Item Details Flow:**

1. User is on Item List page
2. User clicks "View" button on an item row
3. **Modal Opens:**
   - Modal overlay appears (darkens background)
   - Modal container slides in from center
   - Loading spinner displays immediately
   - Semantic: `role="dialog"`, `aria-modal="true"`
4. **Async Content Loading:**
   - API call: `GET /api/items/{id}`
   - Loading state: Spinner with "Loading item details..." message
   - Semantic: `aria-busy="true"`, `aria-live="polite"`
5. **Content Display:**
   - **If Success (200 OK):**
     - Loading spinner disappears
     - Item details display:
       - Item name (heading)
       - Description (full text)
       - Status badge
       - Category
       - Price (formatted)
       - Created date
       - Tags
       - Embedded content (iframe, if available)
     - Semantic: `role="article"`, semantic HTML roles
   - **If Error (404 Not Found):**
     - Loading spinner disappears
     - Error message displays: "Item not found"
     - Retry button available
     - Semantic: `role="alert"`, `aria-live="assertive"`
   - **If Error (500 Server Error):**
     - Error message displays: "Something went wrong. Please try again."
     - Retry button available
6. **Modal Interactions:**
   - User can close modal by:
     - Clicking "X" button (top right)
     - Clicking outside modal (overlay)
     - Pressing Escape key
   - Modal closes and returns to list page
7. **Embedded Content (if available):**
   - iframe loads embedded content
   - Loading state for iframe
   - Error state if iframe fails to load
   - Semantic: `title` attribute, `sandbox` for security

---

## **6. Modal Display**

### **6.1 Modal Structure**

**Overlay:**
- Dark background (semi-transparent)
- Covers entire screen
- Clickable to close modal
- Semantic: `role="dialog"`, `aria-modal="true"`

**Modal Container:**
- Centered on screen
- Responsive width (max-width: 800px)
- Scrollable content if needed
- Semantic: `data-testid="item-details-modal"`

**Modal Header:**
- Title: "Item Details" or item name
- Close button (X) in top right
- Semantic: `role="banner"`, `data-testid="modal-title"`, `data-testid="close-button"`

**Modal Content:**
- Item information
- Embedded content (iframe)
- Semantic: `role="main"`, `role="article"`

---

### **6.2 Item Information Display**

**Required Fields:**
- Name (heading, large text)
- Description (full text, scrollable if long)
- Status (badge: Active/Inactive/Pending, color-coded)
- Category (text label)
- Price (currency format: $X.XX)
- Created Date (formatted: MM/DD/YYYY)
- Tags (comma-separated or badges)

**Optional Fields:**
- Updated Date
- Created By
- File attachment link (if file uploaded)

**Field Validation & Display Rules:**
- **Status Display:** Use `status` field value (active/inactive/pending). If `is_active` is false and status is "active", display status as "inactive" (is_active takes precedence)
- **Price:** If `null` or `undefined`, display "N/A". If `0`, display "$0.00"
- **Tags:** If empty array `[]`, display "No tags" text. If `null` or `undefined`, hide tags section
- **Description:** If `null` or empty string, display "No description available"
- **Category:** If `null` or empty, display "Uncategorized"
- **Dimensions:** If `null` or `undefined`, display "N/A" for each dimension field
- **File Path:** If `null` or empty, hide file attachment link
- **Embed URL:** If `null`, empty, or invalid URL format, hide iframe section entirely

**Semantic Attributes:**
- Each field has `data-testid="item-{field}-{id}"` where `{field}` is lowercase field name and `{id}` is sanitized item ID (special characters replaced with hyphens)
- Nested objects (e.g., dimensions): `data-testid="item-dimensions-length-{id}"`, `data-testid="item-dimensions-width-{id}"`
- Tags array: Each tag has `data-testid="item-tag-{index}-{id}"` where `{index}` is 0-based array index
- Proper heading hierarchy (h2 for item name, h3 for section headings)
- Semantic roles for accessibility

---

### **6.3 Embedded Content (iframe)**

**Purpose:** Display additional item details in embedded iframe.

**Behavior:**
- iframe loads content from `embed_url` field (if available and valid URL format)
- Loading state while iframe loads
- Error state if iframe fails to load
- Timeout: 5 seconds maximum load time, then show error state

**Security Framework:**
- **Sandbox Attributes:** `sandbox="allow-scripts allow-same-origin allow-forms"`
- **URL Validation:** 
  - Validate `embed_url` before iframe creation
  - Block `javascript:` and `data:` URLs
  - Only allow `http://` and `https://` protocols
  - Sanitize URL to prevent XSS attacks
- **Content Security Policy:** Apply strict CSP headers to prevent XSS
- **Error Handling:** If URL is invalid or malicious, hide iframe section (no error message to user)

**Semantic:**
- `title` attribute: "Embedded content for {item name}"
- `aria-label`: "Embedded content for {item name}"
- `data-testid="embedded-iframe"`
- `loading="lazy"` for performance

**iframe Error Handling:**
- **Timeout:** If iframe doesn't load within 5 seconds, show error: "Embedded content failed to load"
- **onerror Handler:** If iframe fails to load, show error message
- **Fallback:** Display error message in place of iframe: "Embedded content unavailable"
- **Retry:** No retry for iframe errors (user can close and reopen modal)

---

## **7. Loading States**

### **7.1 Initial Load**

- Loading spinner in center of modal
- Message: "Loading item details..."
- **Close Button Behavior:** Close button remains enabled during load (user can cancel request)
- **Focus Management:** If close button is enabled, focus moves to close button. If disabled, focus moves to modal container
- **API Request Cancellation:** If user closes modal during API call, cancel the pending request
- Semantic: `aria-busy="true"`, `aria-live="polite"`, `data-testid="loading-state"`

### **7.2 iframe Load**

- Loading indicator for iframe (separate from main loading state)
- Message: "Loading embedded content..."
- Loading state appears below main content (not blocking modal)
- Semantic: `aria-busy="true"` on iframe container, `data-testid="iframe-loading-state"`

---

## **8. Error Handling**

### **8.1 Error Scenarios**

**404 Not Found:**
- Item ID doesn't exist in database
- Error message: "Item not found"
- **Recoverable:** Yes (item may have been deleted, but user can retry)
- **Retry Limit:** Maximum 3 retry attempts
- **After 3 Failed Retries:** Show permanent error message: "Item not found. Please close and try again."
- Retry button (reloads item)
- Semantic: `role="alert"`, `data-testid="error-not-found"`

**422 Unprocessable Entity:**
- Invalid item ID format
- Error message: "Invalid item ID"
- **Recoverable:** No (invalid ID won't become valid)
- **Action:** Show error message with close modal button only (no retry)
- Close modal button

**500 Internal Server Error:**
- Database connection failure or server error
- Error message: "Something went wrong. Please try again."
- **Recoverable:** Yes (server may recover)
- **Retry Limit:** Maximum 3 retry attempts
- **After 3 Failed Retries:** Show permanent error: "Service temporarily unavailable. Please try again later."
- Retry button

**Network Error:**
- Connection failed, timeout, or network unavailable
- Error message: "Connection failed. Please check your internet and try again."
- **Recoverable:** Yes (network may recover)
- **Retry Limit:** Maximum 3 retry attempts
- **After 3 Failed Retries:** Show permanent error: "Unable to connect. Please check your internet connection."
- Retry button

**401 Unauthorized:**
- Missing or invalid JWT token
- Error message: "Authentication required. Please log in."
- **Recoverable:** No (requires re-authentication)
- **Action:** Close modal and redirect to login page
- No retry button

**Request Timeout:**
- API request exceeds 10 seconds
- Error message: "Request timed out. Please try again."
- **Recoverable:** Yes
- **Retry Limit:** Maximum 3 retry attempts
- Retry button

### **8.2 Error Display**

- Error message displayed in modal content area
- Clear, user-friendly messages (no technical details exposed to user)
- **Retry Button Behavior:**
  - Show retry button for recoverable errors (404, 500, Network, Timeout)
  - Hide retry button after 3 failed attempts
  - Show retry attempt counter: "Retry (1/3)", "Retry (2/3)", "Retry (3/3)"
  - Disable retry button during retry attempt (show "Retrying...")
- **Error State Persistence:** Error state resets when modal is closed and reopened
- Close modal button always available
- Semantic: `role="alert"`, `aria-live="assertive"`, `data-testid="error-state"`

### **8.3 Error Recovery Flow**

**State Machine:**
1. **LOADING** → API call in progress
2. **ERROR** → Error occurred, retry available
3. **RETRYING** → Retry attempt in progress (disable retry button)
4. **ERROR_PERMANENT** → 3 retries failed, no more retries
5. **CLOSED** → Modal closed, state reset

**Recovery Rules:**
- User can retry up to 3 times for recoverable errors
- Each retry resets the error state and shows loading spinner
- After 3 failed retries, show permanent error message
- User can close modal at any time (even during retry)
- Closing modal resets all error state and retry counters

---

## **9. API Endpoint Specification**

**Endpoint:** `GET /api/items/{id}`

**Authentication:** Required (JWT token)

**Path Parameter:**
- `id` (required): Item ID (MongoDB ObjectId or string)

**Request Example:**
```
GET /api/items/507f1f77bcf86cd799439011
Authorization: Bearer {jwt-token}
```

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Laptop Computer",
  "description": "High-performance laptop for software development with 16GB RAM and 512GB SSD",
  "item_type": "PHYSICAL",
  "status": "active",
  "category": "Electronics",
  "price": 1299.99,
  "tags": ["laptop", "computer", "electronics"],
  "weight": 2.5,
  "dimensions": {
    "length": 35.5,
    "width": 24.0,
    "height": 2.0
  },
  "file_path": "uploads/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
  "embed_url": "https://example.com/embed/item/507f1f77bcf86cd799439011",
  "created_by": "507f1f77bcf86cd799439012",
  "created_at": "2024-12-17T02:17:00Z",
  "updated_at": "2024-12-17T02:17:00Z",
  "is_active": true
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "status": "error",
  "error_code": 404,
  "error_type": "Not Found - Resource not found",
  "message": "Item with ID 507f1f77bcf86cd799439011 not found",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**422 Unprocessable Entity:**
```json
{
  "status": "error",
  "error_code": 422,
  "error_type": "Unprocessable Entity - Invalid ID format",
  "message": "Invalid item ID format",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items/invalid-id"
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "error_code": 401,
  "error_type": "Unauthorized - Authentication required",
  "message": "Authentication required. Please log in.",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

---

## **10. Modal Interactions**

### **10.1 Opening Modal**

- Trigger: Click "View" button on item row
- **Multiple Rapid Opens:** If user clicks "View" on different items quickly:
  - Cancel any pending API request for previous item
  - Close previous modal immediately (if open)
  - Open new modal for new item
  - Only one modal can be open at a time
- **Animation:** Fade in overlay (300ms ease-in-out), slide in modal (300ms ease-out)
- **Animation Performance:** If animation exceeds 100ms, skip animation for users with `prefers-reduced-motion` preference
- **Focus:** Move focus to close button (first focusable element). If close button is disabled, focus moves to modal container
- **URL Hash Management:**
  - **Always update URL hash:** `#item/{id}` when modal opens
  - **Purpose:** Enable browser back button to close modal, enable deep linking
  - **Hash Format:** `#item/{id}` where `{id}` is the item ID
  - **Conflict Resolution:** If hash already exists, replace it with new item ID

### **10.2 Closing Modal**

**Methods:**
1. Click "X" button (top right)
2. Click outside modal (on overlay)
3. Press Escape key
4. Click "Close" button (if provided)

**Behavior:**
- **Animation:** Fade out overlay (300ms ease-in), slide out modal (300ms ease-in)
- **API Request Cancellation:** Cancel any pending API request when modal closes
- **Resource Cleanup:**
  - Remove iframe from DOM (prevent memory leaks)
  - Clear any cached data for this modal instance
  - Remove event listeners
  - Reset all state variables
- **Focus Management:** Return focus to trigger element (View button that opened modal)
- **URL Hash:** Clear URL hash when modal closes (remove `#item/{id}`)
- **State Reset:** Reset all modal state (loading, error, retry counters)
- **Browser Navigation:** Handle browser back button to close modal (popstate event)

### **10.3 Keyboard Navigation**

- **Escape:** Close modal
- **Tab:** Navigate through modal elements
- **Shift+Tab:** Navigate backwards
- **Enter/Space:** Activate buttons
- **Focus Trap:** Focus stays within modal when open

---

## **11. iframe Handling**

### **11.1 iframe Requirements**

**Security:**
- **Sandbox Attributes:** `sandbox="allow-scripts allow-same-origin allow-forms"`
  - `allow-scripts`: Allow JavaScript execution
  - `allow-same-origin`: Allow same-origin access (required for some embedded content)
  - `allow-forms`: Allow form submission
  - **No other permissions:** Do not allow popups, downloads, or other risky features
- **Content Security Policy:** Apply strict CSP headers to prevent XSS
- **URL Validation:** 
  - Validate `embed_url` before iframe creation
  - Block `javascript:`, `data:`, `file:`, and `about:` URLs
  - Only allow `http://` and `https://` protocols
  - Sanitize URL to prevent XSS attacks
- `loading="lazy"` for performance

**Accessibility:**
- `title` attribute: "Embedded content for {item name}"
- `aria-label`: "Embedded content for {item name}"
- `aria-describedby`: Reference to description of embedded content
- Semantic: `data-testid="embedded-iframe"`

**Error Handling:**
- **Timeout:** 5 seconds maximum load time
- **onerror Handler:** If iframe fails to load, show error message
- **Fallback Message:** "Embedded content failed to load"
- **No Retry:** iframe errors do not have retry functionality (user can close and reopen modal)
- **Error Display:** Show error message in place of iframe

**iframe Integration:**
- **Dynamic Resizing:** iframe does not resize automatically (fixed dimensions)
- **Loading Progress:** Show loading indicator while iframe loads
- **Cross-Origin:** Handle cross-origin errors gracefully (show error message)
- **Content Validation:** No validation of iframe content (security handled by sandbox)

---

## **12. Performance Requirements**

### **12.1 Performance Targets**

- **Modal Open Time:** < 100ms (measured from click to modal visible, animation start)
- **API Response Time:** < 500ms (measured from request sent to response received)
- **Content Render Time:** < 200ms (measured from API response to DOM updated)
- **iframe Load Time:** < 2 seconds (measured from iframe creation to load complete)
- **Total Time to Interactive:** < 1 second (from click to user can interact with content)

### **12.2 Performance Measurement**

**Measurement Criteria:**
- **Modal Open Time:** Measure from `click` event to `animationstart` event
- **API Response Time:** Measure from `fetch()` call to `response` received
- **Content Render Time:** Measure from API response to last DOM update
- **iframe Load Time:** Measure from iframe `load` event

**Measurement Tools:**
- Use browser Performance API (`performance.now()`)
- Use browser DevTools Performance tab
- Log performance metrics for monitoring

**Performance Thresholds:**
- **Excellent:** All metrics within target
- **Good:** 1 metric slightly over target (< 20% over)
- **Degraded:** 2+ metrics over target → Show loading indicators longer, consider skipping animations

**Performance Fallbacks:**
- If API > 1 second: Show "Loading..." with progress indicator
- If iframe > 3 seconds: Show timeout error
- If modal open > 200ms: Skip animations for users with `prefers-reduced-motion`
- If total time > 2 seconds: Show "This is taking longer than expected..." message

---

## **13. Database Requirements**

**Database:** MongoDB  
**Collection:** `items` (same as Flow 2)

**Query:**
```javascript
db.items.findOne({ _id: ObjectId("507f1f77bcf86cd799439011") });
```

**Index:**
- `_id` index (automatic, unique)
- Fast lookup by ID

**Query Optimization:**
- Use projection to return only required fields (if needed for performance)
- Handle deleted items: Query should exclude items with `is_active: false` or `status: "deleted"` (if soft delete is implemented)

---

## **14. Modal State Lifecycle**

### **14.1 State Machine**

**States:**
- `CLOSED`: Modal is not visible
- `OPENING`: Modal animation in progress
- `LOADING`: API request in progress
- `LOADED`: Content successfully loaded and displayed
- `ERROR`: Error occurred, retry available
- `RETRYING`: Retry attempt in progress
- `ERROR_PERMANENT`: 3 retries failed, no more retries
- `CLOSING`: Modal animation out in progress

**Valid State Transitions:**
- `CLOSED` → `OPENING` (user clicks View button)
- `OPENING` → `LOADING` (animation completes, API call starts)
- `LOADING` → `LOADED` (API success)
- `LOADING` → `ERROR` (API failure)
- `ERROR` → `RETRYING` (user clicks retry)
- `RETRYING` → `LOADING` (retry API call starts)
- `RETRYING` → `ERROR` (retry fails)
- `RETRYING` → `ERROR_PERMANENT` (3 retries failed)
- `ERROR` → `ERROR_PERMANENT` (3 retries failed)
- `LOADED` → `CLOSING` (user closes modal)
- `ERROR` → `CLOSING` (user closes modal)
- `ERROR_PERMANENT` → `CLOSING` (user closes modal)
- `CLOSING` → `CLOSED` (animation completes, state reset)

**State Persistence:**
- Modal state does NOT persist on page refresh
- Closing modal resets all state to `CLOSED`
- Opening new item resets previous state

### **14.2 Resource Management**

**Memory Cleanup:**
- Remove iframe from DOM when modal closes
- Cancel pending API requests when modal closes
- Remove event listeners when modal closes
- Clear cached data when modal closes
- Reset all state variables to initial values

**API Request Cancellation:**
- Cancel pending API request if user closes modal during load
- Cancel pending API request if user opens different item
- Use `AbortController` to cancel fetch requests

**Maximum Modal Instances:**
- Only one modal can be open at a time
- Opening new modal closes previous modal immediately

---

## **15. Responsive Design**

### **15.1 Breakpoints**

**Desktop (> 768px):**
- Modal width: max-width 800px, centered
- Modal height: auto, max-height 90vh, scrollable
- iframe: Full width within modal, max-height 400px

**Tablet (481px - 768px):**
- Modal width: 90% of viewport width
- Modal height: auto, max-height 85vh, scrollable
- iframe: Full width, max-height 300px

**Mobile (≤ 480px):**
- Modal width: 100% of viewport width (full screen)
- Modal height: 100vh (full screen)
- Modal position: Fixed to top of screen
- iframe: Full width, max-height 250px
- Touch gestures: Swipe down to close modal (optional enhancement)

### **15.2 Touch Gestures**

**Mobile Support:**
- Swipe down on modal header to close (optional, not required for v1)
- Tap outside modal (overlay) to close
- Standard touch interactions for buttons and links

### **15.3 Keyboard Behavior**

**Mobile Devices:**
- Virtual keyboard may appear when focusing input fields (if any)
- Escape key may not be available on mobile (rely on close button)
- Tab navigation works with virtual keyboard

---

## **16. URL State Management**

### **16.1 URL Hash Strategy**

**Always Update Hash:**
- Update URL hash to `#item/{id}` when modal opens
- Purpose: Enable browser back button, enable deep linking, bookmark support

**Hash Format:**
- Pattern: `#item/{id}` where `{id}` is the item ID
- Example: `#item/507f1f77bcf86cd799439011`

**Hash Management:**
- **On Modal Open:** Update hash to `#item/{id}`
- **On Modal Close:** Remove hash (return to base URL)
- **On Browser Back:** Close modal (listen to `popstate` event)
- **On Page Load:** If hash exists (`#item/{id}`), open modal for that item
- **Conflict Resolution:** If hash already exists, replace it with new item ID

**Deep Linking:**
- User can share URL with hash: `https://app.com/items#item/123`
- Opening shared URL opens modal for item 123
- User can bookmark modal state (hash preserved)

---

## **17. Caching Strategy**

### **17.1 Data Caching**

**Cache Location:**
- Cache item data in memory (component state)
- Do NOT use localStorage or sessionStorage (data may be stale)

**Cache Invalidation:**
- Cache is cleared when modal closes
- Cache is cleared when user opens different item
- No persistent caching across page refreshes

**Cache Scope:**
- Cache only the currently viewed item
- Do not cache multiple items
- Cache is single-item, single-session only

**Stale Data Handling:**
- Always fetch fresh data when modal opens
- Do not use cached data (always make API call)
- Cache is for current session only (not persisted)

---

## **18. Animation Specifications**

### **18.1 Animation Details**

**Overlay Fade In:**
- Duration: 300ms
- Easing: `ease-in-out`
- Property: `opacity` from `0` to `0.5` (semi-transparent black)

**Modal Slide In:**
- Duration: 300ms
- Easing: `ease-out`
- Property: `transform` from `translateY(-20px) scale(0.95)` to `translateY(0) scale(1)`
- Property: `opacity` from `0` to `1`

**Overlay Fade Out:**
- Duration: 300ms
- Easing: `ease-in`
- Property: `opacity` from `0.5` to `0`

**Modal Slide Out:**
- Duration: 300ms
- Easing: `ease-in`
- Property: `transform` from `translateY(0) scale(1)` to `translateY(-20px) scale(0.95)`
- Property: `opacity` from `1` to `0`

### **18.2 Reduced Motion Support**

**prefers-reduced-motion:**
- If user has `prefers-reduced-motion: reduce` preference:
  - Skip all animations (instant show/hide)
  - Modal appears immediately without animation
  - Overlay appears immediately without fade
  - Respect user accessibility preferences

---

## **19. Accessibility Compliance**

### **19.1 WCAG 2.1 Compliance Target**

**Target Level:** WCAG 2.1 Level AA (minimum requirement)

### **19.2 Required ARIA Attributes**

**Modal Container:**
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby="modal-title"` (reference to title element)
- `aria-describedby="modal-description"` (reference to description, if provided)

**Modal Title:**
- `id="modal-title"` (for aria-labelledby reference)
- Proper heading level (h2)

**Loading State:**
- `aria-busy="true"` on modal container
- `aria-live="polite"` for loading updates
- `aria-label="Loading item details"`

**Error State:**
- `role="alert"` on error message container
- `aria-live="assertive"` for error announcements
- `aria-describedby` reference to error message

**Buttons:**
- `aria-label` for icon-only buttons (close button)
- Proper button semantics (`<button>` element)

### **19.3 Keyboard Navigation**

**Required Keyboard Support:**
- **Escape:** Close modal (required)
- **Tab:** Navigate forward through focusable elements
- **Shift+Tab:** Navigate backward
- **Enter/Space:** Activate buttons
- **Focus Trap:** Focus must stay within modal when open
- **Focus Return:** Return focus to trigger element when modal closes

**Focus Management:**
- First focusable element receives focus when modal opens
- Focus trap prevents Tab from leaving modal
- Focus returns to trigger button when modal closes

### **19.4 Screen Reader Support**

**Announcements:**
- Announce modal open: "Item details dialog opened"
- Announce loading: "Loading item details"
- Announce loaded: "Item details loaded"
- Announce errors: "Error: [error message]"
- Announce modal close: "Item details dialog closed"

**High Contrast Mode:**
- Support Windows High Contrast mode
- Ensure sufficient color contrast (4.5:1 for text, 3:1 for UI components)
- Do not rely solely on color to convey information

---

## **20. Localization Support**

### **20.1 Date Format Localization**

**Date Display:**
- Format: `MM/DD/YYYY` for US locale (default)
- Support localization: Use browser locale or app locale setting
- Timezone: Display dates in user's local timezone
- Format examples:
  - US: `12/17/2024`
  - UK: `17/12/2024`
  - ISO: `2024-12-17` (if locale prefers)

### **20.2 Currency Format Localization**

**Price Display:**
- Format: `$X.XX` for US locale (default)
- Support localization: Use browser locale or app locale setting
- Currency symbol: Use locale-appropriate symbol
- Format examples:
  - US: `$1,299.99`
  - UK: `£1,299.99`
  - EU: `€1.299,99`

### **20.3 Text Content Internationalization**

**Translatable Strings:**
- "Item Details"
- "Loading item details..."
- "Item not found"
- "Something went wrong. Please try again."
- "Connection failed. Please check your internet and try again."
- "Retry"
- "Close"
- All error messages
- All button labels

**Implementation:**
- Use i18n library (e.g., react-i18next, vue-i18n)
- Store translations in JSON files
- Support multiple languages (English default)

---

## **21. Analytics Tracking**

### **21.1 User Interaction Metrics**

**Events to Track:**
- `modal_opened` - Modal opened (with item ID)
- `modal_closed` - Modal closed (with close method: button/overlay/escape)
- `api_success` - API call successful (with response time)
- `api_error` - API call failed (with error type: 404/500/network/timeout)
- `retry_clicked` - Retry button clicked (with retry attempt number)
- `iframe_loaded` - iframe loaded successfully (with load time)
- `iframe_error` - iframe failed to load (with error type)
- `item_viewed` - Item details viewed (with item ID, view duration)

**Event Payload:**
```javascript
{
  event: "modal_opened",
  item_id: "507f1f77bcf86cd799439011",
  timestamp: "2024-12-17T02:17:00Z",
  metadata: {
    source: "item_list",
    method: "button_click"
  }
}
```

**Performance Metrics:**
- Track modal open time
- Track API response time
- Track content render time
- Track iframe load time
- Track total time to interactive

---

## **22. Out of Scope**

- Edit item from modal
- Delete item from modal
- Multiple item comparison
- Item history/versioning
- Comments/discussions
- Related items suggestions
- Print item details
- Share item details
- Multiple modals open simultaneously
- Modal state persistence across page refreshes
- Advanced iframe communication (postMessage)
- iframe content validation
- Modal state in URL query parameters (only hash supported)

---

## **23. Approval & Sign-off**

**PRD Status:** ✅ **FINAL / LOCKED**  
**Version:** 1.1 (Updated - Ambiguities Resolved)  
**Date Approved:** December 17, 2024  
**Last Updated:** December 17, 2024

**Approved By:**
- Product Manager: ✅ Approved
- Tester/SDET: ✅ Ambiguity Analysis Complete & Resolved
- Stakeholders: ✅ Approved

**Changes in Version 1.1:**
- Added Modal State Lifecycle specification (Section 14)
- Added Responsive Design requirements (Section 15)
- Added URL State Management rules (Section 16)
- Added Caching Strategy (Section 17)
- Added Animation Specifications (Section 18)
- Added Accessibility Compliance details (Section 19)
- Added Localization Support (Section 20)
- Added Analytics Tracking (Section 21)
- Clarified iframe Security Framework (Section 6.3, 11.1)
- Clarified Error Recovery Flows (Section 8)
- Clarified Field Validation Rules (Section 6.2)
- Clarified Performance Measurement (Section 12)
- Clarified Focus Management (Section 7.1, 10.1)
- Clarified Resource Cleanup (Section 10.2, 14.2)

**Next Steps:**
- Create Functional Specification (FS) for Flow 4
- Create Architecture Document for Flow 4

---

**Document Version:** 1.1 (Updated - Ambiguities Resolved)  
**Status:** ✅ LOCKED - Ready for Functional Specification

