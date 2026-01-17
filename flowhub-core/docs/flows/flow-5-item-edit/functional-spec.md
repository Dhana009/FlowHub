# **FlowHub — Functional Specification: Flow 5 - Item Edit**

**Version:** 1.0  
**Date:** December 17, 2024  
**Author:** Business Analyst  
**Status:** ✅ LOCKED  
**Based on:** PRD Version 1.0 (Final)

---

## **1. Overview**

This document defines the detailed functional requirements for FlowHub Item Edit flow, including form pre-population, validation (same as creation), state-based rules, version conflict detection, and comprehensive error handling.

**Flow Name:** Item Edit  
**Flow ID:** FLOW-005  
**PRD Reference:** prd.md (Version 1.0)

---

## **2. User Stories**

### **2.1 Edit Item**

**As a** authenticated user  
**I want to** edit existing items  
**So that** I can update item information when details change

### **2.2 Handle Version Conflicts**

**As a** authenticated user  
**I want to** be notified if an item was modified by another user  
**So that** I don't overwrite someone else's changes

---

## **3. Functional Requirements**

### **3.1 Item Edit Form Display**

#### **FR-1.1: Edit Item Page Display**

**Requirement:** System shall display an edit item page with pre-populated fields:

- **Form Structure:**
  - Same fields as creation form
  - All fields pre-populated with existing item data
  - Loading state while fetching item data
  - Semantic: `role="form"`, `data-testid="item-edit-form"`

- **Name Input Field:**
  - Type: Text input
  - Pre-populated: Current item name
  - Required: Yes
  - Semantic: `role="textbox"`, `aria-label="Item Name"`, `data-testid="item-name"`

- **Description Textarea:**
  - Type: Textarea
  - Pre-populated: Current item description
  - Required: No
  - Semantic: `role="textbox"`, `aria-label="Description"`, `data-testid="item-description"`

- **Item Type Radio Buttons:**
  - Type: Radio button group
  - Pre-populated: Current item type selected
  - Required: Yes
  - Options: "Physical", "Digital", "Service"
  - Semantic: `role="radiogroup"`, `aria-label="Item Type"`, `data-testid="item-type"`

- **Category Dropdown:**
  - Type: Select dropdown
  - Pre-populated: Current category selected
  - Required: Yes
  - Semantic: `role="combobox"`, `aria-label="Category"`, `data-testid="item-category"`

- **Subcategory Cascading Dropdown:**
  - Type: Select dropdown
  - Pre-populated: Current subcategory selected
  - Required: If category has subcategories
  - Depends on: Category selection
  - Semantic: `role="combobox"`, `aria-label="Subcategory"`, `data-testid="item-subcategory"`

- **Status Dropdown:**
  - Type: Select dropdown
  - Pre-populated: Current status selected
  - Required: Yes
  - Options: "Active", "Inactive", "Pending"
  - Semantic: `role="combobox"`, `aria-label="Status"`, `data-testid="item-status"`

- **Tags Checkboxes:**
  - Type: Checkbox group
  - Pre-populated: Current tags selected
  - Required: No
  - Multiple selection allowed
  - Semantic: `role="group"`, `aria-label="Tags"`, `data-testid="item-tags"`

- **Price Input Field:**
  - Type: Number input
  - Pre-populated: Current price
  - Required: No
  - Semantic: `role="spinbutton"`, `aria-label="Price"`, `data-testid="item-price"`

- **File Upload Input:**
  - Type: File input
  - Current file: Display current file name (if exists)
  - Option: "Replace" button
  - Required: No
  - Semantic: `role="button"`, `aria-label="Upload File"`, `data-testid="item-file-upload"`

- **Update Item Button:**
  - Type: Submit button
  - Label: "Update Item"
  - Disabled: While submitting or if form invalid
  - Semantic: `role="button"`, `aria-label="Update Item"`, `data-testid="update-item-button"`

- **Cancel Button:**
  - Type: Button
  - Label: "Cancel"
  - Action: Navigate back or close modal
  - Semantic: `role="button"`, `aria-label="Cancel"`, `data-testid="cancel-button"`

---

#### **FR-1.2: Form Pre-population**

**Requirement:** System shall pre-populate all form fields with existing item data:

- **Data Loading:**
  - Call API: `GET /api/items/{id}` on form load
  - Loading state: Show spinner while fetching
  - Error state: Show error if fetch fails
  - Semantic: `data-testid="loading-item-data"`, `data-testid="error-loading-item"`

- **Field Pre-population:**
  - Name: Set to current item name
  - Description: Set to current item description
  - Item Type: Select current item type radio button
  - Category: Select current category in dropdown
  - Subcategory: Select current subcategory (if exists)
  - Status: Select current status in dropdown
  - Tags: Check current tags checkboxes
  - Price: Set to current price
  - Conditional fields: Pre-populate based on item type
  - File: Show current file name (if exists)

- **Version Field:**
  - Hidden field: Store current item version
  - Include in update request
  - Semantic: `data-testid="item-version"` (hidden)

---

### **3.2 Conditional Fields Display**

#### **FR-2.1: Physical Item Fields**

**Requirement:** System shall display physical item fields if item type is "Physical":

- **Weight Input:**
  - Type: Number input
  - Pre-populated: Current weight
  - Label: "Weight (kg)"
  - Required: If item type is Physical
  - Semantic: `data-testid="item-weight"`

- **Dimensions Inputs:**
  - Type: Number inputs (Length, Width, Height)
  - Pre-populated: Current dimensions
  - Labels: "Length (cm)", "Width (cm)", "Height (cm)"
  - Required: If item type is Physical
  - Semantic: `data-testid="item-dimensions-length"`, `data-testid="item-dimensions-width"`, `data-testid="item-dimensions-height"`

---

#### **FR-2.2: Digital Item Fields**

**Requirement:** System shall display digital item fields if item type is "Digital":

- **Download URL Input:**
  - Type: URL input
  - Pre-populated: Current download URL
  - Label: "Download URL"
  - Required: If item type is Digital
  - Semantic: `data-testid="item-download-url"`

- **File Size Input:**
  - Type: Number input
  - Pre-populated: Current file size
  - Label: "File Size (MB)"
  - Required: If item type is Digital
  - Semantic: `data-testid="item-file-size"`

---

#### **FR-2.3: Service Item Fields**

**Requirement:** System shall display service item fields if item type is "Service":

- **Duration Input:**
  - Type: Number input
  - Pre-populated: Current duration
  - Label: "Duration (hours)"
  - Required: If item type is Service
  - Semantic: `data-testid="item-duration"`

---

### **3.3 Validation Rules (Same as Creation)**

#### **FR-3.1: Name Validation**

**Requirement:** System shall validate item name:

- **Rules:**
  - Required
  - Length: 1-100 characters
  - Pattern: Alphanumeric + spaces + hyphens
  - Error: "Name must be 1-100 characters"
  - Semantic: `data-testid="name-error"`

---

#### **FR-3.2: Item Type Validation**

**Requirement:** System shall validate item type:

- **Rules:**
  - Required
  - Must be one of: Physical, Digital, Service
  - Error: "Please select an item type"
  - Semantic: `data-testid="item-type-error"`

---

#### **FR-3.3: Category Validation**

**Requirement:** System shall validate category:

- **Rules:**
  - Required
  - Must exist in categories list
  - Error: "Please select a category"
  - Semantic: `data-testid="category-error"`

---

#### **FR-3.4: Subcategory Validation**

**Requirement:** System shall validate subcategory:

- **Rules:**
  - Required if category has subcategories
  - Must be valid subcategory for selected category
  - Error: "Please select a subcategory"
  - Semantic: `data-testid="subcategory-error"`

---

#### **FR-3.5: Price Validation**

**Requirement:** System shall validate price:

- **Rules:**
  - Optional
  - If provided: Must be positive number
  - Format: Currency (2 decimal places)
  - Error: "Price must be a positive number"
  - Semantic: `data-testid="price-error"`

---

#### **FR-3.6: File Validation**

**Requirement:** System shall validate uploaded file:

- **Rules:**
  - Optional
  - If provided: Type and size validation
  - Max size: 10MB
  - Allowed types: PDF, DOC, DOCX, JPG, PNG
  - Error: "File must be PDF, DOC, DOCX, JPG, or PNG and under 10MB"
  - Semantic: `data-testid="file-error"`

---

### **3.4 State-Based Rules**

#### **FR-4.1: Cannot Edit Deleted Items**

**Requirement:** System shall prevent editing deleted items:

- **Rule:**
  - If item status is "deleted":
    - Show error message: "Cannot edit deleted item"
    - Disable all form fields
    - Hide "Update" button
    - Show "Item is deleted" message
  - **Error Code:** 409 Conflict
  - **Error Type:** "ITEM_DELETED"
  - Semantic: `data-testid="item-deleted-error"`

---

#### **FR-4.2: Version Conflict Detection**

**Requirement:** System shall detect version conflicts:

- **Rule:**
  - Each item has a `version` field (integer)
  - Include current `version` in update request
  - If version mismatch (item was updated by another user):
    - Show error: "Item was modified by another user. Please refresh and try again."
    - Option to refresh and reload latest data
  - **Error Code:** 409 Conflict
  - **Error Type:** "VERSION_CONFLICT"
  - Semantic: `data-testid="version-conflict-error"`

---

### **3.5 Form Submission**

#### **FR-5.1: Update Item Request**

**Requirement:** System shall submit update request:

- **API Call:**
  - Endpoint: `PUT /api/items/{id}`
  - Method: PUT
  - Headers: Authorization: Bearer {jwt-token}
  - Body: Updated item data + version field

- **Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "item_type": "PHYSICAL",
  "category_id": "cat_123",
  "subcategory_id": "subcat_456",
  "status": "active",
  "tags": ["tag1", "tag2"],
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

- **Loading State:**
  - Show spinner: "Updating item..."
  - Disable form fields
  - Disable "Update" button
  - Semantic: `data-testid="updating-item"`

---

#### **FR-5.2: Success Response**

**Requirement:** System shall handle success response:

- **Response (200 OK):**
  - Success message: "Item updated successfully"
  - Redirect to Item List or Item Details
  - Updated item appears in list
  - Semantic: `data-testid="update-success"`

---

#### **FR-5.3: Error Response Handling**

**Requirement:** System shall handle error responses:

- **400 Bad Request:**
  - Display field-level validation errors
  - Highlight invalid fields
  - Semantic: `data-testid="validation-errors"`

- **401 Unauthorized:**
  - Error message: "Authentication required. Please log in."
  - Redirect to login page
  - Semantic: `data-testid="auth-error"`

- **404 Not Found:**
  - Error message: "Item not found"
  - Option to navigate back
  - Semantic: `data-testid="not-found-error"`

- **409 Conflict (Item Deleted):**
  - Error message: "Cannot edit deleted item"
  - Disable form
  - Semantic: `data-testid="item-deleted-error"`

- **409 Conflict (Version Mismatch):**
  - Error message: "Item was modified by another user. Please refresh and try again."
  - Option to refresh and reload
  - Semantic: `data-testid="version-conflict-error"`

- **422 Unprocessable Entity:**
  - Error message: "Invalid data format"
  - Display general error
  - Semantic: `data-testid="invalid-format-error"`

- **500 Server Error:**
  - Error message: "Something went wrong. Please try again."
  - Option to retry
  - Semantic: `data-testid="server-error"`

---

## **4. API Endpoint Specification**

### **4.1 Get Item by ID (Pre-population)**

**Endpoint:** `GET /api/items/{id}`  
**Authentication:** Required (JWT token)

**Purpose:** Fetch existing item data for form pre-population.

**Response:** Same as Flow 4 (Item Details)

---

### **4.2 Update Item Endpoint**

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

**400 Bad Request:**
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

---

## **5. Database Requirements**

### **5.1 MongoDB Update Operation**

**Collection:** `items` (same as Flow 2)

**Update Pattern:**
```javascript
db.items.updateOne(
  { 
    _id: ObjectId("507f1f77bcf86cd799439011"),
    version: 1  // Optimistic locking
  },
  { 
    $set: { 
      name: "Updated Name",
      description: "Updated description",
      version: 2,  // Increment version
      updated_at: new Date(),
      updated_by: ObjectId("507f1f77bcf86cd799439012")
    }
  }
);
```

**Version Field:**
- Increment on each update
- Used for optimistic locking
- Prevents concurrent edit conflicts

---

## **6. Security Requirements**

### **6.1 Authentication**

- All requests require valid JWT token
- Invalid/expired token → 401 Unauthorized

### **6.2 Authorization**

- Users can only edit items they created (or have permission)
- Check `created_by` or user permissions

---

## **7. Performance Requirements**

- **Form Load Time:** < 500ms (fetch existing item)
- **Update Response Time:** < 500ms
- **Validation Time:** < 100ms (client-side)

---

## **8. Non-Functional Requirements**

### **8.1 Usability**

- Form is accessible (keyboard navigation, screen readers)
- Clear validation messages
- Smooth form interactions
- Responsive design

### **8.2 Reliability**

- Graceful error handling
- Version conflict detection
- No data loss
- Optimistic locking works correctly

---

## **9. Dependencies**

### **9.1 External Dependencies**

- MongoDB database (items collection)
- FastAPI (or Express.js) for API endpoints
- Authentication system (Flow 1)

### **9.2 Internal Dependencies**

- Flow 1 (Authentication) - required for access
- Flow 2 (Item Creation) - creates items to edit
- Flow 4 (Item Details) - provides item data for pre-population

---

**Document Version:** 1.0  
**Status:** ✅ LOCKED - Ready for Architecture Design  
**Next:** Architecture Design

