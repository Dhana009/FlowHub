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
   - Success toast message: "Item updated successfully!"
   - Redirect to Item List page (`/items`)
   - Success message passed in navigation state
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

**Rule:** Items with `deleted_at` set cannot be edited.

**Behavior:**
- If item has `deleted_at` set:
  - Show error message: "Cannot edit deleted item"
  - Disable form fields
  - Hide "Update" button
  - Show "Item is deleted" message
- **Error Code:** 409 Conflict
- **Error Type:** "Conflict - Item deleted"
- **Error Code Detail:** "ITEM_DELETED"

---

### **6.2 Cannot Edit Inactive Items**

**Rule:** Items with `is_active: false` cannot be edited.

**Behavior:**
- If item has `is_active: false`:
  - Show error message: "Cannot edit inactive item"
  - **Error Code:** 409 Conflict
  - **Error Type:** "Conflict - Item inactive"
  - **Error Code Detail:** "ITEM_INACTIVE"

---

### **6.3 Ownership Check**

**Rule:** Users can only edit items they created.

**Behavior:**
- If item exists but `created_by` doesn't match current user:
  - Return 404 Not Found (for security, don't reveal item exists)
  - Error message: "Item with ID {id} not found"
- **Error Code:** 404 Not Found
- **Error Type:** "Not Found - Resource not found"

---

### **6.4 Version Conflict Detection**

**Rule:** Prevent concurrent edit conflicts using optimistic locking.

**Behavior:**
- Each item has a `version` field (integer, starts at 1, increments on each update)
- **Version field is REQUIRED in request body**
- Version must be a positive integer
- If version is missing, invalid type, or negative:
  - **Error Code:** 400 Bad Request
  - **Error Type:** "Bad Request"
  - **Message:** "Version field is required and must be a positive integer"
- When editing, include current `version` in request
- Version is checked BEFORE other validations
- If version mismatch (item was updated by another user):
  - Show error: "Item was modified by another user. Expected version: {current}, Provided: {provided}"
  - Option to refresh and reload latest data
- **Error Code:** 409 Conflict
- **Error Type:** "Conflict - Version mismatch"
- **Error Code Detail:** "VERSION_CONFLICT"
- **Response includes:** `current_version`, `provided_version`

---

## **7. Form Fields (Same as Creation)**

### **7.1 Required Fields**

- **Name:** Text input (3-100 characters, same as Flow 2)
- **Description:** Textarea (10-500 characters, same as Flow 2)
- **Item Type:** Dropdown (Physical, Digital, Service)
- **Category:** Text input (required, same as Flow 2)
- **Price:** Number input (required, 0.01-999999.99, same as Flow 2)

### **7.2 Optional Fields**

- **Tags:** Comma-separated text input (same as Flow 2)
- **File:** File upload (optional, can replace existing, max 5MB)
- **Embed URL:** URL input (optional, for iframe content)

**Note:** Status is NOT editable - items use `is_active` boolean field (managed via delete/activate operations). Subcategory field is not implemented.

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

### **8.4 Tags Validation**

- Optional
- Comma-separated text input (same as Flow 2)
- Max 10 tags, each 1-30 characters
- Tags must be unique (case-insensitive)
- Error: "Tags validation failed" (same validation rules as Flow 2)

### **8.5 Price Validation**

- Optional
- If provided: Must be positive number
- Format: Currency (2 decimal places)
- Error: "Price must be a positive number"

### **8.6 File Validation**

- Optional
- If provided: Type and size validation (same as creation - Flow 2)
- Max size: 5MB (same as Flow 2)
- Allowed types: .jpg, .jpeg, .png, .pdf, .doc, .docx (same as Flow 2)
- Error: "File type not supported" (415) or "File too large" (413)

---

## **9. API Endpoint Specification**

**Endpoint:** `PUT /api/v1/items/{id}`

**Authentication:** Required (JWT token)

**Path Parameter:**
- `id` (required): Item ID (MongoDB ObjectId, 24-character hexadecimal string)

**Request Body:**
- **Partial updates supported:** Only send fields that need to be updated
- **Version field is REQUIRED:** Must be included in every update request
- **Validation:** System merges provided fields with existing item data, then validates merged result

```json
{
  "name": "Updated Laptop Computer",
  "description": "Updated description",
  "item_type": "PHYSICAL",
  "category": "Electronics",
  "tags": ["laptop", "updated"],
  "price": 1399.99,
  "weight": 2.8,
  "length": 36.0,
  "width": 25.0,
  "height": 2.1,
  "version": 1
}
```

**Request Body Fields:**
- `version` (required, integer): Current version of the item (must match database version)
- All other fields: Same as Flow 2 (Item Creation)
- **Partial updates:** Only include fields that need to be changed
- **Item type changes:** Allowed - system will clear old conditional fields and require new ones

**Note:** 
- If `item_type` is changed, old conditional fields are cleared
- Example: Changing from PHYSICAL to DIGITAL clears `weight` and `dimensions`, requires `download_url` and `file_size`

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Item updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Laptop Computer",
    "description": "Updated description",
    "item_type": "PHYSICAL",
    "category": "Electronics",
    "tags": ["laptop", "updated"],
    "price": 1399.99,
    "weight": 2.8,
    "dimensions": {
      "length": 36.0,
      "width": 25.0,
      "height": 2.1
    },
    "embed_url": "https://example.com/embed/content",
    "version": 2,
    "updated_at": "2024-12-17T03:25:00Z",
    "is_active": true
  },
  "item_id": "507f1f77bcf86cd799439011"
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

**400 Bad Request (Missing/Invalid Version):**
```json
{
  "status": "error",
  "error_code": 400,
  "error_type": "Bad Request",
  "message": "Version field is required and must be a positive integer",
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/v1/items/507f1f77bcf86cd799439011"
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
  "path": "/api/v1/items/507f1f77bcf86cd799439011"
}
```

**409 Conflict (Item Inactive):**
```json
{
  "status": "error",
  "error_code": 409,
  "error_type": "Conflict - Item inactive",
  "message": "Cannot edit inactive item",
  "error_code_detail": "ITEM_INACTIVE",
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/v1/items/507f1f77bcf86cd799439011"
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

**Required Fields:**
- `version` (integer, default: 1, required): Optimistic locking version number
- `updated_at` (timestamp, auto-updated): Last update timestamp
- `updated_by` (ObjectId, optional): User who last updated the item

**Update Operation:**
- Update item document by _id
- **Version check:** Must match provided version in query filter
- Increment `version` field (atomic operation)
- Update `updated_at` timestamp (Mongoose timestamps)
- Update `updated_by` user ID (if tracking enabled)

**Update Query (Optimistic Locking):**
```javascript
// Atomic update with version check
db.items.updateOne(
  { 
    _id: ObjectId("507f1f77bcf86cd799439011"), 
    version: 1,  // Must match provided version
    created_by: ObjectId("507f1f77bcf86cd799439012"),  // Ownership check
    is_active: true,  // Must be active
    deleted_at: null  // Must not be deleted
  },
  { 
    $set: { 
      name: "Updated Name",
      version: 2,  // Increment version
      updated_at: new Date(),
      updated_by: ObjectId("507f1f77bcf86cd799439012")
    }
  }
);
```

**Validation Strategy:**
- Merge existing item data with update data
- Validate merged result (same validation as creation)
- Clear conditional fields when `item_type` changes
- Check version BEFORE validation (early failure)
- Check ownership BEFORE version check (security first)

---

## **12. Out of Scope**

- Bulk edit (edit multiple items at once)
- Edit history/audit trail
- Undo/redo functionality
- Field-level permissions
- Edit templates
- Scheduled updates

---

## **13. Implementation Clarifications (Post-Ambiguity Analysis)**

### **13.1 Version Field**
- **Required:** Version field is REQUIRED in request body
- **Validation:** Must be positive integer (type check + range check)
- **Error:** 400 Bad Request if missing, invalid type, or negative
- **Check Order:** Version validation happens BEFORE other validations

### **13.2 Partial Updates**
- **Supported:** PUT endpoint supports partial updates
- **Strategy:** Merge provided fields with existing item data
- **Validation:** Validate merged result (not just provided fields)
- **Rationale:** Ensures final state is always valid

### **13.3 Ownership Model**
- **Rule:** Users can only edit items they created (`created_by` matches current user)
- **Security:** Return 404 (not 403) if item exists but not owned (don't reveal existence)
- **Check Order:** Ownership check happens BEFORE version check

### **13.4 Inactive Items**
- **Rule:** Items with `is_active: false` cannot be edited
- **Error:** 409 Conflict with `ITEM_INACTIVE` error code detail
- **Rationale:** Consistent state-based rules (similar to deleted items)

### **13.5 Item Type Changes**
- **Allowed:** Users can change `item_type` during update
- **Behavior:** Old conditional fields are cleared, new ones are required
- **Example:** PHYSICAL → DIGITAL clears `weight`/`dimensions`, requires `download_url`/`file_size`
- **Validation:** New conditional fields must be provided and valid

### **13.6 Validation Scope**
- **Strategy:** Validate merged data (existing + updates)
- **Rationale:** Ensures final state is valid, not just provided fields
- **Same Rules:** Uses same 5-layer validation as creation

---

## **14. Approval & Sign-off**

**PRD Status:** ✅ **UPDATED - Synchronized with Implementation**  
**Version:** 1.2 (Updated to match implementation)  
**Date Updated:** December 2024

**Approved By:**
- Product Manager: ✅ Approved
- Tester/SDET: ✅ Ambiguity Analysis Complete + Clarifications Applied
- Stakeholders: ✅ Approved

**Changes in Version 1.2 (Implementation Synchronization):**
- Removed Status dropdown (uses `is_active` boolean, not editable via form)
- Removed Subcategory field (not implemented)
- Updated Tags input format (comma-separated text, not checkboxes - same as Flow 2)
- Updated file max size (5MB, not 10MB - same as Flow 2)
- Added `embed_url` field support (optional, same as Flow 2)
- Updated success response format to match implementation
- Updated success redirect behavior (always redirects to Item List)
- Verified version conflict detection implementation
- Verified state-based rules (cannot edit deleted/inactive items)
- All validation rules match Flow 2 (Item Creation)

**Next Steps:**
- Implementation complete and synchronized
- Test against updated requirements
- Proceed to Flow 6 (Item Delete) review

---

**Document Version:** 1.2 (Updated to match implementation)  
**Status:** ✅ UPDATED - Synchronized with implementation

