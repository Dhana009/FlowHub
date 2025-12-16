# **FlowHub — PRD: Flow 5 - Item Edit**

**Version:** 1.0 (Final)  
**Date:** December 17, 2024  
**Author:** Product Manager  
**Status:** ✅ LOCKED - Ready for Functional Specification

---

## **1. Overview**

FlowHub allows authenticated users to edit existing items. The system provides pre-populated forms, validation (same as creation), state-based rules (cannot edit deleted items), version conflict detection, and comprehensive error handling for automation testing.

**Flow Name:** Item Edit  
**Flow ID:** FLOW-005  
**Priority:** P0 (Critical - Core functionality)

---

## **2. Problem Statement**

Users need to update existing items in FlowHub. The system must:
- Pre-populate forms with existing item data
- Validate data comprehensively (same as creation)
- Handle conditional fields based on item type
- Prevent editing deleted items
- Detect version conflicts (concurrent edits)
- Support file uploads (replace existing files)
- Provide clear error feedback
- Ensure data integrity

---

## **3. Business Value**

- **Data Quality:** Rich validation ensures only valid updates are saved
- **User Experience:** Pre-populated forms save time
- **Data Integrity:** Version conflict detection prevents data loss
- **Business Rules:** State-based validation enforces business logic
- **Automation Testing:** Comprehensive error scenarios for test coverage

---

## **4. User Story**

**As a** authenticated user  
**I want to** edit existing items  
**So that** I can update item information when details change

---

## **5. User Journey**

### **Item Edit Flow:**

1. User is on Item List page or Item Details modal
2. User clicks "Edit" button on an item
3. **Form Opens:**
   - Edit form page opens (or modal)
   - Form fields pre-populated with existing item data
   - Loading state while fetching item data
4. **Form Pre-population:**
   - All fields filled with current values:
     - Name: Current name
     - Description: Current description
     - Item Type: Current type (radio buttons)
     - Category: Current category (dropdown)
     - Subcategory: Current subcategory (cascading dropdown)
     - Status: Current status (dropdown)
     - Tags: Current tags (checkboxes)
     - Price: Current price
     - Conditional fields: Pre-filled based on item type
     - File: Show current file (if exists) with option to replace
5. **User Makes Changes:**
   - User modifies any fields
   - Validation runs on blur/change
   - Conditional fields show/hide based on selections
   - Error messages display for invalid fields
6. **User Submits Form:**
   - Click "Update" button
   - Validation runs (client-side + server-side)
   - Loading state: "Updating item..."
7. **Success Response (200 OK):**
   - Success message: "Item updated successfully"
   - Redirect to Item List or Item Details
   - Updated item appears in list
8. **Error Responses:**
   - **400 Bad Request:** Validation errors (display field-level errors)
   - **401 Unauthorized:** Authentication required
   - **404 Not Found:** Item doesn't exist
   - **409 Conflict:** Version mismatch or item deleted
   - **422 Unprocessable Entity:** Invalid data format
   - **500 Server Error:** Server error

---

## **6. State-Based Rules**

### **6.1 Cannot Edit Deleted Items**

**Rule:** Items with status "deleted" cannot be edited.

**Behavior:**
- If item status is "deleted":
  - Show error message: "Cannot edit deleted item"
  - Disable form fields
  - Hide "Update" button
  - Show "Item is deleted" message
- **Error Code:** 409 Conflict
- **Error Type:** "ITEM_DELETED"

---

### **6.2 Version Conflict Detection**

**Rule:** Prevent concurrent edit conflicts using optimistic locking.

**Behavior:**
- Each item has a `version` field (integer, increments on each update)
- When editing, include current `version` in request
- If version mismatch (item was updated by another user):
  - Show error: "Item was modified by another user. Please refresh and try again."
  - Option to refresh and reload latest data
- **Error Code:** 409 Conflict
- **Error Type:** "VERSION_CONFLICT"

---

## **7. Form Fields (Same as Creation)**

### **7.1 Required Fields**

- **Name:** Text input (1-100 characters)
- **Item Type:** Radio buttons (Physical, Digital, Service)
- **Category:** Dropdown (required)
- **Status:** Dropdown (Active, Inactive, Pending)

### **7.2 Optional Fields**

- **Description:** Textarea (max 1000 characters)
- **Subcategory:** Cascading dropdown (depends on category)
- **Tags:** Checkboxes (multiple selection)
- **Price:** Number input (currency format)
- **File:** File upload (optional, can replace existing)

### **7.3 Conditional Fields**

**Physical Items:**
- Weight (kg)
- Dimensions (Length, Width, Height in cm)

**Digital Items:**
- Download URL
- File Size (MB)

**Service Items:**
- Duration (hours)

---

## **8. Validation Rules (Same as Creation)**

### **8.1 Name Validation**

- Required
- Length: 1-100 characters
- No special characters (alphanumeric + spaces + hyphens)
- Error: "Name must be 1-100 characters"

### **8.2 Item Type Validation**

- Required
- Must be one of: Physical, Digital, Service
- Error: "Please select an item type"

### **8.3 Category Validation**

- Required
- Must exist in categories list
- Error: "Please select a category"

### **8.4 Subcategory Validation**

- Required if category has subcategories
- Must be valid subcategory for selected category
- Error: "Please select a subcategory"

### **8.5 Price Validation**

- Optional
- If provided: Must be positive number
- Format: Currency (2 decimal places)
- Error: "Price must be a positive number"

### **8.6 File Validation**

- Optional
- If provided: Type and size validation (same as creation)
- Max size: 10MB
- Allowed types: PDF, DOC, DOCX, JPG, PNG
- Error: "File must be PDF, DOC, DOCX, JPG, or PNG and under 10MB"

---

## **9. API Endpoint Specification**

**Endpoint:** `PUT /api/items/{id}`

**Authentication:** Required (JWT token)

**Path Parameter:**
- `id` (required): Item ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "name": "Updated Laptop Computer",
  "description": "Updated description",
  "item_type": "PHYSICAL",
  "category_id": "cat_123",
  "subcategory_id": "subcat_456",
  "status": "active",
  "tags": ["laptop", "updated"],
  "price": 1399.99,
  "weight": 2.8,
  "dimensions": {
    "length": 36.0,
    "width": 25.0,
    "height": 2.1
  },
  "version": 1
}
```

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Updated Laptop Computer",
  "description": "Updated description",
  "item_type": "PHYSICAL",
  "category_id": "cat_123",
  "subcategory_id": "subcat_456",
  "status": "active",
  "tags": ["laptop", "updated"],
  "price": 1399.99,
  "weight": 2.8,
  "dimensions": {
    "length": 36.0,
    "width": 25.0,
    "height": 2.1
  },
  "version": 2,
  "updated_at": "2024-12-17T03:25:00Z",
  "updated_by": "507f1f77bcf86cd799439012"
}
```

**Error Responses:**

**400 Bad Request (Validation Errors):**
```json
{
  "status": "error",
  "error_code": 400,
  "error_type": "Bad Request - Validation failed",
  "message": "Validation failed",
  "errors": {
    "name": "Name must be 1-100 characters",
    "price": "Price must be a positive number"
  },
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "error_code": 404,
  "error_type": "Not Found - Resource not found",
  "message": "Item with ID 507f1f77bcf86cd799439011 not found",
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**409 Conflict (Item Deleted):**
```json
{
  "status": "error",
  "error_code": 409,
  "error_type": "Conflict - Item deleted",
  "message": "Cannot edit deleted item",
  "error_code_detail": "ITEM_DELETED",
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**409 Conflict (Version Mismatch):**
```json
{
  "status": "error",
  "error_code": 409,
  "error_type": "Conflict - Version mismatch",
  "message": "Item was modified by another user. Expected version: 2, Provided: 1",
  "error_code_detail": "VERSION_CONFLICT",
  "current_version": 2,
  "provided_version": 1,
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**422 Unprocessable Entity:**
```json
{
  "status": "error",
  "error_code": 422,
  "error_type": "Unprocessable Entity - Invalid data format",
  "message": "Invalid data format",
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

---

## **10. File Upload (Replace Existing)**

### **10.1 File Replacement**

- If item has existing file:
  - Show current file name
  - Option to "Replace" file
  - Upload new file (same validation as creation)
  - Old file deleted when new file uploaded
- If item has no file:
  - Optional file upload (same as creation)

---

## **11. Database Requirements**

**Database:** MongoDB  
**Collection:** `items` (same as Flow 2)

**Update Operation:**
- Update item document by _id
- Increment `version` field
- Update `updated_at` timestamp
- Update `updated_by` user ID

**Query:**
```javascript
db.items.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011"), version: 1 },
  { 
    $set: { 
      name: "Updated Name",
      version: 2,
      updated_at: new Date(),
      updated_by: ObjectId("507f1f77bcf86cd799439012")
    }
  }
);
```

---

## **12. Out of Scope**

- Bulk edit (edit multiple items at once)
- Edit history/audit trail
- Undo/redo functionality
- Field-level permissions
- Edit templates
- Scheduled updates

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
- Create Functional Specification (FS) for Flow 5
- Create Architecture Document for Flow 5

---

**Document Version:** 1.0 (Final)  
**Status:** ✅ LOCKED - Ready for Functional Specification

