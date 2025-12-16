# **FlowHub — Functional Specification: Flow 6 - Item Delete**

**Version:** 1.0  
**Date:** December 17, 2024  
**Author:** Business Analyst  
**Status:** ✅ LOCKED  
**Based on:** PRD Version 1.0 (Final)

---

## **1. Overview**

This document defines the detailed functional requirements for FlowHub Item Delete flow, including confirmation modal, soft delete mechanism, error handling, and list refresh.

**Flow Name:** Item Delete  
**Flow ID:** FLOW-006  
**PRD Reference:** prd.md (Version 1.0)

---

## **2. User Stories**

### **2.1 Delete Item**

**As a** authenticated user  
**I want to** delete items with confirmation  
**So that** I can remove items I no longer need while preventing accidental deletions

### **2.2 Handle Delete Errors**

**As a** authenticated user  
**I want to** see clear error messages when delete fails  
**So that** I understand what went wrong and can take appropriate action

---

## **3. Functional Requirements**

### **3.1 Delete Button Display**

#### **FR-1.1: Delete Button on Item List**

**Requirement:** System shall display delete button for each item:

- **Button Location:**
  - In item row (next to Edit button)
  - Or in item actions dropdown menu

- **Button Properties:**
  - Label: "Delete" or icon (trash icon)
  - Type: Button
  - Styling: Destructive/red color
  - Semantic: `role="button"`, `aria-label="Delete item"`, `data-testid="delete-item-button-{id}"`

- **Button State:**
  - Enabled: For active/inactive/pending items
  - Disabled: While deletion in progress (optional)
  - Hidden: For already deleted items (if shown in list)

---

### **3.2 Confirmation Modal**

#### **FR-2.1: Modal Opening**

**Requirement:** System shall open confirmation modal when user clicks delete button:

- **Trigger:**
  - Click "Delete" button on item row
  - Button: `data-testid="delete-item-button-{id}"`

- **Modal Animation:**
  - Overlay fades in (0.3s transition)
  - Modal container slides in from center (0.3s transition)
  - Smooth, professional animation

- **Modal Structure:**
  - Overlay: Dark background (rgba(0,0,0,0.5)), covers entire screen
  - Modal Container: Centered, max-width 400px, responsive
  - Semantic: `role="dialog"`, `aria-modal="true"`, `data-testid="delete-confirm-modal"`

- **Focus Management:**
  - Move focus to modal when opened
  - Focus first focusable element (Cancel button)
  - Trap focus within modal (Tab key stays in modal)

---

#### **FR-2.2: Modal Content**

**Requirement:** System shall display confirmation message in modal:

- **Title:**
  - Text: "Confirm Delete" or "Delete Item"
  - Semantic: `role="heading"`, `aria-level="2"`, `data-testid="modal-title"`

- **Message:**
  - Text: "Are you sure you want to delete '{item name}'? This action cannot be undone."
  - Dynamic: Include item name in message
  - Semantic: `data-testid="delete-confirm-message"`

- **Buttons:**
  - Cancel Button:
    - Label: "Cancel"
    - Action: Close modal, no deletion
    - Semantic: `role="button"`, `aria-label="Cancel"`, `data-testid="cancel-button"`
  - Delete Button:
    - Label: "Delete" or "Confirm Delete"
    - Action: Confirm deletion, proceed with API call
    - Styling: Destructive/red color
    - Semantic: `role="button"`, `aria-label="Confirm delete"`, `data-testid="confirm-delete-button"`

---

#### **FR-2.3: Modal Interactions**

**Requirement:** System shall support multiple ways to close modal:

- **Cancel Button:**
  - Click "Cancel" button
  - Close modal immediately
  - No API call
  - Semantic: `data-testid="cancel-button"`

- **Overlay Click (Optional):**
  - Click outside modal (on overlay)
  - Close modal immediately
  - No API call
  - Semantic: `data-testid="modal-overlay"`

- **Escape Key:**
  - Press Escape key
  - Close modal immediately
  - No API call
  - Only works when modal is open and focused

---

### **3.3 Delete Operation**

#### **FR-3.1: API Call**

**Requirement:** System shall call API when user confirms deletion:

- **Endpoint:** `DELETE /api/items/{id}`
- **Method:** DELETE
- **Headers:** Authorization: Bearer {jwt-token}
- **Timing:** Called when user clicks "Delete" button in confirmation modal

---

#### **FR-3.2: Loading State**

**Requirement:** System shall display loading state during deletion:

- **Loading Indicator:**
  - Show spinner or loading text
  - Message: "Deleting..."
  - Disable buttons during deletion
  - Semantic: `aria-busy="true"`, `aria-live="polite"`, `data-testid="deleting-item"`

- **Button State:**
  - Disable "Cancel" button (optional)
  - Disable "Delete" button
  - Show loading text: "Deleting..." on Delete button

---

#### **FR-3.3: Success Response**

**Requirement:** System shall handle success response:

- **Response (200 OK):**
  - Success message: "Item deleted successfully"
  - Close confirmation modal
  - Refresh item list (fetch updated list)
  - Show success toast/notification
  - Semantic: `data-testid="delete-success"`

- **List Refresh:**
  - Call `GET /api/items` to fetch updated list
  - Deleted item no longer appears (filtered by status)
  - Update list display

---

#### **FR-3.4: Error Response Handling**

**Requirement:** System shall handle error responses:

- **400 Bad Request:**
  - Error message: "Invalid item ID"
  - Close modal, show error toast
  - Semantic: `data-testid="invalid-id-error"`

- **401 Unauthorized:**
  - Error message: "Authentication required. Please log in."
  - Redirect to login page
  - Semantic: `data-testid="auth-error"`

- **404 Not Found:**
  - Error message: "Item not found"
  - Close modal, show error toast
  - Refresh list (item may have been deleted by another user)
  - Semantic: `data-testid="not-found-error"`

- **409 Conflict (Already Deleted):**
  - Error message: "Item is already deleted"
  - Close modal, show error toast
  - Refresh list (item already removed)
  - Semantic: `data-testid="already-deleted-error"`

- **500 Server Error:**
  - Error message: "Something went wrong. Please try again."
  - Keep modal open, show error message
  - Show retry button
  - Semantic: `data-testid="server-error"`

---

### **3.4 Soft Delete Mechanism**

#### **FR-4.1: Status Change**

**Requirement:** System shall change item status to "deleted":

- **Before Delete:**
  - Item status: "active" (or "inactive", "pending")

- **After Delete:**
  - Item status: "deleted"
  - `deleted_at`: Current timestamp
  - `updated_at`: Current timestamp

- **Database Update:**
  - Update item document by _id
  - Set status field to "deleted"
  - Set deleted_at timestamp
  - Update updated_at timestamp

---

#### **FR-4.2: Prevent Duplicate Delete**

**Requirement:** System shall prevent deleting already deleted items:

- **Validation:**
  - Check item status before deletion
  - If status is "deleted":
    - Return 409 Conflict error
    - Error message: "Item is already deleted"
    - Error code detail: "ITEM_ALREADY_DELETED"

---

## **4. API Endpoint Specification**

### **4.1 Delete Item Endpoint**

**Endpoint:** `DELETE /api/items/{id}`  
**Authentication:** Required (JWT token)

**Path Parameter:**
- `id` (required): Item ID (MongoDB ObjectId string, 24 hex characters)

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

## **5. Validation Rules**

### **5.1 Item ID Validation**

- **Format:** MongoDB ObjectId (24 hex characters)
- **Validation:** Check if ID is valid format before querying database
- **Error:** 400 if invalid format

### **5.2 Item Existence Validation**

- **Check:** Item must exist in database
- **Validation:** Query database by _id
- **Error:** 404 if item doesn't exist

### **5.3 Item Status Validation**

- **Check:** Item status must not be "deleted"
- **Validation:** Check status before allowing deletion
- **Error:** 409 if item is already deleted

---

## **6. Database Requirements**

### **6.1 MongoDB Update Operation**

**Collection:** `items` (same as Flow 2)

**Update Pattern:**
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

**Validation Queries:**
```javascript
// Check if item exists
const item = await db.items.findOne({ 
  _id: ObjectId("507f1f77bcf86cd799439011") 
});

// Check if already deleted
if (item && item.status === "deleted") {
  // Return 409 Conflict
}
```

---

## **7. Security Requirements**

### **7.1 Authentication**

- All requests require valid JWT token
- Invalid/expired token → 401 Unauthorized

### **7.2 Authorization**

- Users can only delete items they created (or have permission)
- Check `created_by` or user permissions

---

## **8. Performance Requirements**

- **Modal Open Time:** < 100ms (animation)
- **Delete Response Time:** < 500ms
- **List Refresh Time:** < 500ms

---

## **9. Non-Functional Requirements**

### **9.1 Usability**

- Modal is accessible (keyboard navigation, screen readers)
- Clear confirmation message
- Smooth animations
- Responsive design

### **9.2 Reliability**

- Graceful error handling
- No data loss
- Soft delete preserves data
- List refresh works correctly

---

## **10. Dependencies**

### **10.1 External Dependencies**

- MongoDB database (items collection)
- FastAPI (or Express.js) for API endpoints
- Authentication system (Flow 1)

### **10.2 Internal Dependencies**

- Flow 1 (Authentication) - required for access
- Flow 3 (Item List) - provides delete button and list refresh

---

**Document Version:** 1.0  
**Status:** ✅ LOCKED - Ready for Architecture Design  
**Next:** Architecture Design

