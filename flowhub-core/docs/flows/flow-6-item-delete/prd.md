# **FlowHub — PRD: Flow 6 - Item Delete**

**Version:** 1.1 (Updated - Ambiguities Resolved)  
**Date:** December 17, 2024  
**Last Updated:** December 17, 2024  
**Author:** Product Manager  
**Status:** ✅ LOCKED - Ready for Functional Specification

---

## **1. Overview**

FlowHub allows authenticated users to delete items they created using a soft delete mechanism (sets `is_active: false` and `deleted_at` timestamp). The system provides confirmation dialogs, prevents deleting already deleted items, enforces ownership validation, and refreshes the list after successful deletion.

**Flow Name:** Item Delete  
**Flow ID:** FLOW-006  
**Priority:** P0 (Critical - Core functionality)

---

## **2. Problem Statement**

Users need to delete items from FlowHub. The system must:
- Provide confirmation before deletion
- Use soft delete (status change, not physical deletion)
- Prevent deleting already deleted items
- Refresh list after successful deletion
- Handle errors gracefully
- Provide clear feedback

---

## **3. Business Value**

- **Data Safety:** Soft delete preserves data for audit/recovery
- **User Experience:** Confirmation prevents accidental deletions
- **Data Integrity:** Prevents duplicate delete operations
- **Automation Testing:** Comprehensive error scenarios for test coverage

---

## **4. User Story**

**As a** authenticated user  
**I want to** delete items I created with confirmation  
**So that** I can remove items I no longer need while preventing accidental deletions

**Note:** Users can only delete items they created (`created_by` matches current user ID). Attempting to delete another user's item returns 404 Not Found (security: don't reveal item exists).

---

## **5. User Journey**

### **Item Delete Flow:**

1. User is on Item List page
2. User clicks "Delete" button on an item row
3. **Confirmation Modal Opens:**
   - Modal overlay appears (darkens background, 50% opacity)
   - Modal container displays confirmation message
   - **Message:** "Are you sure you want to delete '{item name}'? This action cannot be undone."
   - **Item Name Display:** Use `item.name` field. If `item.name` is null/empty, use "this item" as fallback.
   - Buttons: "Cancel" and "Delete"
   - Semantic: `role="dialog"`, `aria-modal="true"`, `data-testid="delete-confirm-modal"`
4. **User Confirms:**
   - User clicks "Delete" button
   - **Loading State:** Replace "Delete" button text with "Deleting..." and show spinner
   - Disable both "Cancel" and "Delete" buttons during deletion
   - Disable overlay click and Escape key during deletion
5. **API Call:**
   - Endpoint: `DELETE /api/items/{id}`
   - Method: DELETE
   - Headers: Authorization: Bearer {jwt-token}
6. **Success Response (200 OK):**
   - Success message: "Item deleted successfully"
   - Close confirmation modal immediately
   - **List Refresh:** Re-fetch item list from API (full refresh, not local removal)
   - Show loading state during list refresh
   - Show success toast notification (top-right, auto-dismiss after 3 seconds)
   - Deleted item no longer appears (filtered by `is_active: true` on server)
7. **Error Responses:**
   - **400 Bad Request:** Invalid item ID format
   - **401 Unauthorized:** Authentication required
   - **404 Not Found:** Item doesn't exist OR item not owned by user (security: don't reveal ownership)
   - **409 Conflict:** Item already deleted (`is_active: false` or `deleted_at` is set)
   - **500 Server Error:** Server error
   - **Network Error:** Connection failed, timeout, or network unavailable
   - **Request Timeout:** API request exceeds 10 seconds
8. **Error Handling:**
   - **Error Display Decision Matrix:**
     - **404, 409, 400, 401:** Close modal, show error toast (non-recoverable)
     - **500, Network Error, Timeout:** Keep modal open, show error message in modal, show retry button (recoverable)
   - **Retry Button:** Only shown for recoverable errors (500, Network, Timeout)
   - **Retry Limit:** Maximum 3 retry attempts
   - **After 3 Failed Retries:** Show permanent error, close modal, show error toast

---

## **6. Soft Delete Mechanism**

### **6.1 Soft Delete vs Hard Delete**

**Soft Delete:**
- Set `is_active` to `false`
- Set `deleted_at` timestamp (current UTC time)
- Item remains in database
- Item no longer appears in active lists (filtered by `is_active: true`)
- Can be recovered (if needed in future)
- **Note:** Item model uses `is_active` boolean and `deleted_at` timestamp, not a `status` field

**Hard Delete:**
- Not implemented (out of scope)
- Physical deletion from database

---

### **6.2 Soft Delete State Change**

**Before Delete:**
- `is_active`: `true`
- `deleted_at`: `null`
- Item can be in any state (active, inactive, pending) - all can be deleted

**After Delete:**
- `is_active`: `false`
- `deleted_at`: Current UTC timestamp (ISO 8601 format)
- `updated_at`: Current UTC timestamp (auto-updated by Mongoose)

**Status Transition Rules:**
- Items with `is_active: true` can be deleted (regardless of other fields)
- Items with `is_active: false` OR `deleted_at` set cannot be deleted again (409 Conflict)
- Users can only delete items they created (`created_by` matches current user ID)

---

### **6.3 Ownership Validation**

**Rule:** Users can only delete items they created.

**Behavior:**
- Check if item exists and `created_by` matches current user ID
- If item exists but `created_by` doesn't match: Return 404 Not Found (security: don't reveal item exists)
- If item doesn't exist: Return 404 Not Found
- **Error Code:** 404 Not Found
- **Error Type:** "Not Found - Resource not found"
- **Message:** "Item with ID {id} not found"

---

## **7. Confirmation Modal**

### **7.1 Modal Structure**

**Overlay:**
- Dark background (semi-transparent)
- Covers entire screen
- Clickable to close (optional)

**Modal Container:**
- Centered on screen
- Responsive width (max-width: 400px)
- Semantic: `role="dialog"`, `aria-modal="true"`, `data-testid="delete-confirm-modal"`

**Modal Content:**
- **Title:** "Delete Item" (consistent across all instances)
- **Message:** "Are you sure you want to delete '{item name}'? This action cannot be undone."
  - **Item Name:** Use `item.name` field from item data
  - **Fallback:** If `item.name` is null, empty, or undefined, use "this item" instead
  - Example: "Are you sure you want to delete 'Laptop Computer'? This action cannot be undone."
  - Example (fallback): "Are you sure you want to delete 'this item'? This action cannot be undone."
- **Buttons:**
  - **Cancel:** Close modal, no action, return focus to Delete button that opened modal
  - **Delete:** Confirm deletion, proceed with API call, show loading state
- **Semantic:** `data-testid="delete-confirm-message"`, `data-testid="cancel-button"`, `data-testid="confirm-delete-button"`

---

### **7.2 Modal Interactions**

**Cancel Button:**
- Close modal
- No API call
- Return to list page

**Delete Button:**
- Trigger API call
- Show loading state
- Disable buttons during deletion
- Close modal on success
- Keep modal open on error

**Overlay Click:**
- **Enabled:** Yes (overlay is clickable)
- **Behavior:** Close modal (same as Cancel)
- **No API call:** Overlay click does not trigger deletion
- **Disabled During Deletion:** Overlay click disabled when loading state is active

**Escape Key:**
- Close modal (same as Cancel)
- No API call

---

## **8. API Endpoint Specification**

**Endpoint:** `DELETE /api/items/{id}`

**Authentication:** Required (JWT token)

**Path Parameter:**
- `id` (required): Item ID (MongoDB ObjectId)

**Request Example:**
```
DELETE /api/items/507f1f77bcf86cd799439011
Authorization: Bearer {jwt-token}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Item deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Laptop Computer",
    "is_active": false,
    "deleted_at": "2024-12-17T03:39:00Z",
    "updatedAt": "2024-12-17T03:39:00Z"
  }
}
```

**Response Format:**
- Uses `status: "success"` (consistent with other Flow responses)
- Includes full item data in `data` field
- `deleted_at` is ISO 8601 UTC timestamp
- `is_active` is `false` after deletion

**Error Responses:**

**400 Bad Request (Invalid ID Format):**
```json
{
  "status": "error",
  "error_code": 400,
  "error_type": "Bad Request - Invalid ID format",
  "message": "Invalid item ID format. Expected 24-character hexadecimal string.",
  "timestamp": "2024-12-17T03:39:00Z",
  "path": "/api/v1/items/invalid-id"
}
```

**Validation:**
- Item ID must be valid MongoDB ObjectId (24-character hexadecimal string)
- Validation occurs before database query
- Client-side validation recommended before API call

**404 Not Found:**
```json
{
  "status": "error",
  "error_code": 404,
  "error_type": "Not Found - Resource not found",
  "message": "Item with ID 507f1f77bcf86cd799439011 not found",
  "timestamp": "2024-12-17T03:39:00Z",
  "path": "/api/v1/items/507f1f77bcf86cd799439011"
}
```

**404 Scenarios:**
1. Item ID doesn't exist in database
2. Item exists but `created_by` doesn't match current user (security: don't reveal ownership)
3. Item was hard deleted (should not occur with soft delete)

**Security Note:** Always return 404 for items not owned by user to prevent information disclosure.

**409 Conflict (Already Deleted):**
```json
{
  "status": "error",
  "error_code": 409,
  "error_type": "Conflict - Item already deleted",
  "message": "Item with ID 507f1f77bcf86cd799439011 is already deleted",
  "error_code_detail": "ITEM_ALREADY_DELETED",
  "timestamp": "2024-12-17T03:39:00Z",
  "path": "/api/v1/items/507f1f77bcf86cd799439011"
}
```

**409 Conditions:**
- Item has `is_active: false` OR `deleted_at` is set (not null)
- Check occurs after ownership validation
- Prevents duplicate delete operations

**401 Unauthorized:**
```json
{
  "status": "error",
  "error_code": 401,
  "error_type": "Unauthorized - Authentication required",
  "message": "Authentication required. Please log in.",
  "timestamp": "2024-12-17T03:39:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "error_code": 500,
  "error_type": "Internal Server Error",
  "message": "Something went wrong. Please try again.",
  "timestamp": "2024-12-17T03:39:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

---

## **9. Database Requirements**

**Database:** MongoDB  
**Collection:** `items` (same as Flow 2)

**Update Operation:**
- Update item document by `_id` and `created_by` (ownership check)
- Set `is_active` to `false`
- Set `deleted_at` timestamp (UTC, ISO 8601 format)
- `updated_at` automatically updated by Mongoose timestamps

**Query:**
```javascript
// Step 1: Check ownership and existence
const existingItem = await Item.findOne({ 
  _id: ObjectId("507f1f77bcf86cd799439011"),
  created_by: ObjectId("507f1f77bcf86cd799439012") // Current user ID
});

if (!existingItem) {
  // Return 404 (item doesn't exist or not owned)
  return 404;
}

// Step 2: Check if already deleted
if (!existingItem.is_active || existingItem.deleted_at) {
  // Return 409 (already deleted)
  return 409;
}

// Step 3: Soft delete
db.items.updateOne(
  { 
    _id: ObjectId("507f1f77bcf86cd799439011"),
    created_by: ObjectId("507f1f77bcf86cd799439012")
  },
  { 
    $set: { 
      is_active: false,
      deleted_at: new Date() // UTC timestamp
    }
    // updated_at automatically updated by Mongoose timestamps
  }
);
```

**Validation Sequence:**
1. Validate item ID format (400 if invalid)
2. Check if item exists AND owned by user (404 if not)
3. Check if item is already deleted (409 if `is_active: false` OR `deleted_at` is set)
4. Perform soft delete operation

**Database Schema Requirements:**
- `is_active`: Boolean field (default: true, indexed)
- `deleted_at`: Date field (default: null)
- `created_by`: ObjectId field (required, indexed)
- `updated_at`: Auto-managed by Mongoose timestamps

---

## **10. List Refresh After Delete**

### **10.1 Refresh Behavior**

**After Successful Delete:**
- Close confirmation modal immediately (no delay)
- **List Refresh Method:** Re-fetch item list from API (`GET /api/v1/items`)
- **Loading State:** Show loading spinner/state during list refresh
- **Filtering:** Deleted item no longer appears (server filters by `is_active: true`)
- **Optimistic Updates:** Not used - always fetch fresh data from server
- Show success toast notification (top-right corner, 3-second auto-dismiss)
- **Focus Management:** Return focus to item list or first item after refresh

**After Error:**
- **Non-Recoverable Errors (404, 409, 400, 401):**
  - Close modal immediately
  - Show error toast notification (top-right, 5-second auto-dismiss)
  - List remains unchanged (no refresh)
- **Recoverable Errors (500, Network, Timeout):**
  - Keep modal open
  - Show error message in modal (below buttons)
  - Show retry button (enabled)
  - List remains unchanged (no refresh)
  - Allow retry up to 3 times

### **10.2 Refresh Failure Handling**

**If List Refresh Fails:**
- Show error toast: "Item deleted but failed to refresh list. Please refresh the page."
- Keep deleted item visible in list (with visual indicator if possible)
- Provide manual refresh button or page reload option

---

## **11. Error Handling**

### **11.1 Error Scenarios**

**404 Not Found:**
- **Causes:**
  1. Item ID doesn't exist in database
  2. Item exists but not owned by current user (security: don't reveal)
- **Error message:** "Item not found"
- **Action:** Close modal, show error toast (top-right, 5-second auto-dismiss)
- **Recoverable:** No (item doesn't exist or not accessible)

**409 Conflict (Already Deleted):**
- **Cause:** Item has `is_active: false` OR `deleted_at` is set
- **Error message:** "Item is already deleted"
- **Action:** Close modal, show error toast (top-right, 5-second auto-dismiss)
- **Recoverable:** No (item already deleted)

**400 Bad Request:**
- **Cause:** Invalid item ID format (not valid MongoDB ObjectId)
- **Error message:** "Invalid item ID format"
- **Action:** Close modal, show error toast (top-right, 5-second auto-dismiss)
- **Recoverable:** No (invalid ID won't become valid)

**401 Unauthorized:**
- **Cause:** Missing or invalid JWT token
- **Error message:** "Authentication required. Please log in."
- **Action:** Close modal, redirect to login page
- **Recoverable:** No (requires re-authentication)

**500 Internal Server Error:**
- **Cause:** Database connection failure or server error
- **Error message:** "Something went wrong. Please try again."
- **Action:** Keep modal open, show error message in modal, show retry button
- **Recoverable:** Yes (server may recover)
- **Retry Limit:** Maximum 3 retry attempts

**Network Error:**
- **Cause:** Connection failed, timeout, or network unavailable
- **Error message:** "Connection failed. Please check your internet and try again."
- **Action:** Keep modal open, show error message in modal, show retry button
- **Recoverable:** Yes (network may recover)
- **Retry Limit:** Maximum 3 retry attempts

**Request Timeout:**
- **Cause:** API request exceeds 10 seconds
- **Error message:** "Request timed out. Please try again."
- **Action:** Keep modal open, show error message in modal, show retry button
- **Recoverable:** Yes
- **Retry Limit:** Maximum 3 retry attempts

### **11.2 Error Display Decision Matrix**

| Error Code | Display Location | Modal State | Retry Button | Toast Notification |
|------------|------------------|-------------|--------------|-------------------|
| 400 | Toast | Closed | No | Yes (5s) |
| 401 | Redirect | Closed | No | No (redirects) |
| 404 | Toast | Closed | No | Yes (5s) |
| 409 | Toast | Closed | No | Yes (5s) |
| 500 | Modal | Open | Yes (max 3) | No |
| Network | Modal | Open | Yes (max 3) | No |
| Timeout | Modal | Open | Yes (max 3) | No |

### **11.3 Retry Logic**

**Recoverable Errors (500, Network, Timeout):**
- Show retry button in modal (below error message)
- Retry button text: "Retry" (or "Retry (1/3)", "Retry (2/3)", "Retry (3/3)")
- Disable retry button during retry attempt (show "Retrying...")
- After 3 failed retries: Show permanent error, close modal, show error toast
- Permanent error message: "Unable to delete item. Please try again later."

### **11.4 Concurrent Delete Handling**

**Race Condition Scenario:**
- Two users attempt to delete the same item simultaneously
- **Solution:** Database-level atomic update with ownership check
- **Behavior:** First request succeeds, second request returns 404 (item not found or already deleted)
- **No Optimistic Locking:** Delete operation doesn't use version field (unlike edit)

---

## **12. Toast Notification Specifications**

### **12.1 Toast Position and Styling**

**Position:** Top-right corner of viewport
- **Desktop:** 20px from top, 20px from right
- **Mobile:** 10px from top, 10px from right

**Styling:**
- **Success Toast:** Green background, white text, checkmark icon
- **Error Toast:** Red background, white text, error icon
- **Auto-dismiss:** Success (3 seconds), Error (5 seconds)
- **Manual Dismiss:** X button in top-right of toast
- **Animation:** Slide in from right, fade out on dismiss

**Toast Content:**
- **Success:** "Item deleted successfully" (with checkmark icon)
- **Error:** Error message from API response (with error icon)

### **12.2 Toast Queue Management**

- **Multiple Toasts:** Stack vertically (newest on top)
- **Maximum Visible:** 3 toasts at once
- **Queue Overflow:** Dismiss oldest toast when 4th appears

---

## **13. Loading State Specifications**

### **13.1 Delete Button Loading State**

**During API Call:**
- Replace "Delete" button text with "Deleting..."
- Show spinner icon (left of text)
- Disable both "Cancel" and "Delete" buttons
- Disable overlay click
- Disable Escape key

**Visual:**
- Button background: Gray (disabled state)
- Spinner: Rotating circle, blue color
- Text: "Deleting..." in gray

### **13.2 List Refresh Loading State**

**During List Refresh:**
- Show loading spinner overlay on item list
- Display "Refreshing list..." message
- Disable list interactions during refresh
- **Duration:** Typically < 1 second (depends on API response time)

---

## **14. Accessibility Requirements**

### **14.1 Modal Accessibility**

**ARIA Attributes:**
- `role="dialog"` on modal container
- `aria-modal="true"` on modal container
- `aria-labelledby="delete-modal-title"` (reference to title)
- `aria-describedby="delete-modal-message"` (reference to message)
- `aria-live="polite"` for loading states
- `aria-live="assertive"` for error messages

**Keyboard Navigation:**
- **Tab:** Navigate between Cancel and Delete buttons
- **Enter:** Activate focused button
- **Escape:** Close modal (disabled during deletion)
- **Focus Trap:** Focus stays within modal when open

**Focus Management:**
- **On Open:** Focus moves to Cancel button (first focusable element)
- **On Close:** Focus returns to Delete button that opened modal
- **During Deletion:** Focus remains on Delete button (disabled)

**Screen Reader Announcements:**
- **Modal Open:** "Delete confirmation dialog opened"
- **Loading:** "Deleting item, please wait"
- **Success:** "Item deleted successfully"
- **Error:** Announce error message

---

## **15. Out of Scope**

- Hard delete (physical deletion from database)
- Bulk delete (delete multiple items at once)
- Delete recovery/undo
- Delete history/audit trail
- Permanent delete (admin only)
- Delete with dependencies check
- Delete confirmation via email/SMS
- Scheduled deletion

---

## **16. Testing Requirements**

### **16.1 Test Data Setup**

**Required Test Items:**
- Item owned by test user (can be deleted)
- Item owned by different user (should return 404)
- Item with `is_active: false` (should return 409)
- Item with `deleted_at` set (should return 409)
- Item with invalid ID format (should return 400)
- Item that doesn't exist (should return 404)

**Test User Setup:**
- Authenticated user with valid JWT token
- User with items created (`created_by` matches user ID)
- User without items (for ownership validation)

### **16.2 Test Scenarios**

**Positive Cases:**
- Delete item successfully (200 OK)
- Verify `is_active` set to `false`
- Verify `deleted_at` timestamp set
- Verify item removed from list after refresh
- Verify success toast appears

**Negative Cases:**
- Delete non-existent item (404)
- Delete item owned by another user (404)
- Delete already deleted item (409)
- Delete with invalid ID format (400)
- Delete without authentication (401)
- Delete with invalid token (401)

**Boundary Cases:**
- Concurrent delete attempts (race condition)
- Network timeout during delete
- Server error during delete (500)
- List refresh failure after successful delete

**Accessibility Tests:**
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader announcements
- Focus management
- ARIA attribute validation

---

## **17. Performance Requirements**

### **17.1 Response Times**

- **Delete API Call:** < 500ms (95th percentile)
- **Modal Open Time:** < 100ms (from click to modal visible)
- **List Refresh Time:** < 1 second (95th percentile)
- **Toast Display:** Immediate (no delay)

### **17.2 Timeout Handling**

- **API Request Timeout:** 10 seconds
- **After Timeout:** Show timeout error, allow retry
- **Retry Delay:** No delay (immediate retry on button click)

---

## **18. Security Requirements**

### **18.1 Authentication**

- **Required:** Valid JWT token in Authorization header
- **Format:** `Bearer {jwt-token}`
- **Expiration:** Token must be valid (not expired)
- **Invalid Token:** Return 401 Unauthorized

### **18.2 Authorization**

- **Ownership Check:** Users can only delete items they created
- **Security:** Return 404 (not 403) for items not owned (prevent information disclosure)
- **Validation Order:** Ownership check before delete operation

### **18.3 Input Validation**

- **Item ID:** Must be valid MongoDB ObjectId (24-character hex string)
- **Validation:** Server-side validation (client-side recommended)
- **Invalid Format:** Return 400 Bad Request

---

## **19. Approval & Sign-off**

**PRD Status:** ✅ **FINAL / LOCKED**  
**Version:** 1.1 (Updated - Ambiguities Resolved)  
**Date Approved:** December 17, 2024  
**Last Updated:** December 17, 2024

**Approved By:**
- Product Manager: ✅ Approved
- Tester/SDET: ✅ Ambiguity Analysis Complete & Resolved
- Stakeholders: ✅ Approved

**Ambiguities Resolved:**
- ✅ Ownership validation clarified
- ✅ Confirmation message standardized
- ✅ Error handling decision matrix defined
- ✅ Loading state specifications added
- ✅ Toast notification specifications added
- ✅ List refresh behavior clarified
- ✅ Concurrent delete handling specified
- ✅ Accessibility requirements added
- ✅ Testing requirements defined

**Next Steps:**
- Create Functional Specification (FS) for Flow 6
- Create Architecture Document for Flow 6

---

**Document Version:** 1.1 (Updated - Ambiguities Resolved)  
**Status:** ✅ LOCKED - Ready for Functional Specification

