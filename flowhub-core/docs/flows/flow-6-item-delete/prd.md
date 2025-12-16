# **FlowHub — PRD: Flow 6 - Item Delete**

**Version:** 1.0 (Final)  
**Date:** December 17, 2024  
**Author:** Product Manager  
**Status:** ✅ LOCKED - Ready for Functional Specification

---

## **1. Overview**

FlowHub allows authenticated users to delete items using a soft delete mechanism (status change to "deleted"). The system provides confirmation dialogs, prevents deleting already deleted items, and refreshes the list after successful deletion.

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
**I want to** delete items with confirmation  
**So that** I can remove items I no longer need while preventing accidental deletions

---

## **5. User Journey**

### **Item Delete Flow:**

1. User is on Item List page
2. User clicks "Delete" button on an item row
3. **Confirmation Modal Opens:**
   - Modal overlay appears (darkens background)
   - Modal container displays confirmation message
   - Message: "Are you sure you want to delete '{item name}'?"
   - Buttons: "Cancel" and "Delete"
   - Semantic: `role="dialog"`, `aria-modal="true"`, `data-testid="delete-confirm-modal"`
4. **User Confirms:**
   - User clicks "Delete" button
   - Loading state: "Deleting..."
   - Disable buttons during deletion
5. **API Call:**
   - Endpoint: `DELETE /api/items/{id}`
   - Method: DELETE
   - Headers: Authorization: Bearer {jwt-token}
6. **Success Response (200 OK):**
   - Success message: "Item deleted successfully"
   - Close confirmation modal
   - Refresh item list (removed item no longer appears)
   - Show success toast/notification
7. **Error Responses:**
   - **400 Bad Request:** Invalid item ID format
   - **401 Unauthorized:** Authentication required
   - **404 Not Found:** Item doesn't exist
   - **409 Conflict:** Item already deleted
   - **500 Server Error:** Server error
8. **Error Handling:**
   - Display error message in modal or toast
   - Keep modal open on error (allow retry)
   - Show retry button for recoverable errors

---

## **6. Soft Delete Mechanism**

### **6.1 Soft Delete vs Hard Delete**

**Soft Delete:**
- Change item `status` to "deleted"
- Set `deleted_at` timestamp
- Item remains in database
- Item no longer appears in active lists
- Can be recovered (if needed in future)

**Hard Delete:**
- Not implemented (out of scope)
- Physical deletion from database

---

### **6.2 Status Change**

**Before Delete:**
- Item status: "active" (or "inactive", "pending")

**After Delete:**
- Item status: "deleted"
- `deleted_at`: Current timestamp
- `updated_at`: Current timestamp

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
- Title: "Confirm Delete" or "Delete Item"
- Message: "Are you sure you want to delete '{item name}'? This action cannot be undone."
- Buttons:
  - Cancel: Close modal, no action
  - Delete: Confirm deletion, proceed with API call
- Semantic: `data-testid="delete-confirm-message"`, `data-testid="cancel-button"`, `data-testid="confirm-delete-button"`

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

**Overlay Click (Optional):**
- Close modal (same as Cancel)
- No API call

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
  "success": true,
  "message": "Item deleted successfully",
  "item_id": "507f1f77bcf86cd799439011",
  "deleted_at": "2024-12-17T03:39:00Z"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "status": "error",
  "error_code": 400,
  "error_type": "Bad Request - Invalid ID format",
  "message": "Invalid item ID format",
  "timestamp": "2024-12-17T03:39:00Z",
  "path": "/api/items/invalid-id"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "error_code": 404,
  "error_type": "Not Found - Resource not found",
  "message": "Item with ID 507f1f77bcf86cd799439011 not found",
  "timestamp": "2024-12-17T03:39:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**409 Conflict (Already Deleted):**
```json
{
  "status": "error",
  "error_code": 409,
  "error_type": "Conflict - Item already deleted",
  "message": "Item with ID 507f1f77bcf86cd799439011 is already deleted",
  "error_code_detail": "ITEM_ALREADY_DELETED",
  "timestamp": "2024-12-17T03:39:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

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
- Update item document by _id
- Set `status` to "deleted"
- Set `deleted_at` timestamp
- Update `updated_at` timestamp

**Query:**
```javascript
db.items.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  { 
    $set: { 
      status: "deleted",
      deleted_at: new Date(),
      updated_at: new Date()
    }
  }
);
```

**Validation:**
- Check if item exists (404 if not)
- Check if item is already deleted (409 if deleted)

---

## **10. List Refresh After Delete**

### **10.1 Refresh Behavior**

**After Successful Delete:**
- Close confirmation modal
- Refresh item list (fetch updated list from API)
- Deleted item no longer appears (filtered by status)
- Show success message/toast

**After Error:**
- Keep modal open
- Show error message
- Allow retry
- List remains unchanged

---

## **11. Error Handling**

### **11.1 Error Scenarios**

**404 Not Found:**
- Item ID doesn't exist
- Error message: "Item not found"
- Close modal, show error toast

**409 Conflict (Already Deleted):**
- Item status is already "deleted"
- Error message: "Item is already deleted"
- Close modal, show error toast

**400 Bad Request:**
- Invalid item ID format
- Error message: "Invalid item ID"
- Close modal, show error toast

**500 Server Error:**
- Server error
- Error message: "Something went wrong. Please try again."
- Keep modal open, show retry button

---

## **12. Out of Scope**

- Hard delete (physical deletion from database)
- Bulk delete (delete multiple items at once)
- Delete recovery/undo
- Delete history/audit trail
- Permanent delete (admin only)
- Delete with dependencies check

---

## **13. Approval & Sign-off**

**PRD Status:** ✅ **FINAL / LOCKED**  
**Version:** 1.0 (Final)  
**Date Approved:** December 17, 2024

**Approved By:**
- Product Manager: ✅ Approved
- Tester/SDET: ✅ Ambiguity Analysis Complete
- Stakeholders: ✅ Approved

**Next Steps:**
- Create Functional Specification (FS) for Flow 6
- Create Architecture Document for Flow 6

---

**Document Version:** 1.0 (Final)  
**Status:** ✅ LOCKED - Ready for Functional Specification

