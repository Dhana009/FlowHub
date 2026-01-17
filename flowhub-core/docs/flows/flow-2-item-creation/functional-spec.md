# **FlowHub — Functional Specification: Flow 2 - Item Creation**

**Version:** 1.0  
**Date:** December 17, 2024  
**Author:** Business Analyst  
**Status:** ✅ LOCKED  
**Based on:** PRD Version 1.0 (Final)

---

## **1. Overview**

This document defines the detailed functional requirements for FlowHub Item Creation flow, including form validation, conditional fields, file upload, and comprehensive error handling.

**Flow Name:** Item Creation  
**Flow ID:** FLOW-002  
**PRD Reference:** prd.md (Version 1.0)

---

## **2. User Stories**

### **2.1 Create Physical Item**

**As a** authenticated user  
**I want to** create a physical item with weight and dimensions  
**So that** I can track physical inventory items

### **2.2 Create Digital Item**

**As a** authenticated user  
**I want to** create a digital item with download URL and file size  
**So that** I can manage digital products

### **2.3 Create Service Item**

**As a** authenticated user  
**I want to** create a service item with duration  
**So that** I can track service offerings

---

## **3. Functional Requirements**

### **3.1 Item Creation Form Display**

#### **FR-1.1: Create Item Page Display**

**Requirement:** System shall display a create item page with the following elements:

- **Name Input Field:**
  - Type: Text input
  - Label: "Item Name" or placeholder "Enter item name"
  - Required: Yes
  - Semantic: `role="textbox"`, `aria-label="Item Name"`, `data-testid="item-name"`

- **Description Textarea:**
  - Type: Textarea
  - Label: "Description" or placeholder "Enter item description"
  - Required: Yes
  - Rows: 4-6
  - Semantic: `role="textbox"`, `aria-label="Description"`, `data-testid="item-description"`

- **Item Type Dropdown:**
  - Type: Select dropdown
  - Label: "Item Type"
  - Required: Yes
  - Options: "Physical", "Digital", "Service"
  - Semantic: `role="combobox"`, `aria-label="Item Type"`, `data-testid="item-type"`

- **Price Input Field:**
  - Type: Number input
  - Label: "Price" or placeholder "0.00"
  - Required: Yes
  - Min: 0.01
  - Max: 999999.99
  - Step: 0.01
  - Semantic: `role="spinbutton"`, `aria-label="Price"`, `data-testid="item-price"`

- **Category Input Field:**
  - Type: Text input or dropdown
  - Label: "Category" or placeholder "Enter category"
  - Required: Yes
  - Semantic: `role="textbox"`, `aria-label="Category"`, `data-testid="item-category"`

- **Tags Input Field:**
  - Type: Multi-select or comma-separated input
  - Label: "Tags" or placeholder "Enter tags (comma-separated)"
  - Required: No
  - Semantic: `role="textbox"`, `aria-label="Tags"`, `data-testid="item-tags"`

- **File Upload Input:**
  - Type: File input
  - Label: "Upload File (Optional)"
  - Required: No
  - Accept: `.jpg,.jpeg,.png,.pdf,.doc,.docx`
  - Semantic: `role="button"`, `aria-label="Upload File"`, `data-testid="item-file-upload"`

- **Create Item Button:**
  - Type: Submit button
  - Label: "Create Item"
  - Semantic: `role="button"`, `aria-label="Create Item"`, `data-testid="create-item-submit"`

- **Cancel Button:**
  - Type: Button
  - Label: "Cancel"
  - Semantic: `role="button"`, `aria-label="Cancel"`, `data-testid="create-item-cancel"`

---

#### **FR-1.2: Conditional Fields Display**

**Requirement:** System shall show/hide conditional fields based on Item Type selection:

- **When Item Type = "Physical":**
  - Show: Weight field (required), Dimensions fields (length, width, height - all required)
  - Hide: Download URL, File Size, Duration Hours
  - Semantic: `data-testid="physical-fields"`, `data-testid="item-weight"`, `data-testid="item-dimensions"`

- **When Item Type = "Digital":**
  - Show: Download URL field (required), File Size field (required)
  - Hide: Weight, Dimensions, Duration Hours
  - Semantic: `data-testid="digital-fields"`, `data-testid="item-download-url"`, `data-testid="item-file-size"`

- **When Item Type = "Service":**
  - Show: Duration Hours field (required)
  - Hide: Weight, Dimensions, Download URL, File Size
  - Semantic: `data-testid="service-fields"`, `data-testid="item-duration-hours"`

- **Behavior:**
  - Fields appear/disappear immediately on Item Type change
  - Clear conditional field values when type changes
  - Re-validate conditional fields when they appear

---

### **3.2 Field Validation**

#### **FR-2.1: Name Field Validation**

**Requirement:** System shall validate name field with the following rules:

- **On Blur:**
  - If empty: Show error "Name is required"
  - If length < 3: Show error "Name must be at least 3 characters"
  - If length > 100: Show error "Name must not exceed 100 characters"
  - If invalid characters: Show error "Name can only contain letters, numbers, spaces, hyphens, and underscores"
  - Error displayed below field in red text
  - Semantic: `role="alert"`, `aria-live="polite"`, `data-testid="name-error"`

- **On Change:**
  - Clear error message if field becomes valid
  - Real-time validation feedback

- **Validation Rules:**
  - Required: Yes
  - Min Length: 3 characters
  - Max Length: 100 characters
  - Pattern: Alphanumeric + spaces, hyphens, underscores
  - Regex: `^[a-zA-Z0-9\s\-_]+$`

---

#### **FR-2.2: Description Field Validation**

**Requirement:** System shall validate description field:

- **On Blur:**
  - If empty: Show error "Description is required"
  - If length < 10: Show error "Description must be at least 10 characters"
  - If length > 500: Show error "Description must not exceed 500 characters"
  - Semantic: `role="alert"`, `data-testid="description-error"`

- **Validation Rules:**
  - Required: Yes
  - Min Length: 10 characters
  - Max Length: 500 characters

---

#### **FR-2.3: Item Type Field Validation**

**Requirement:** System shall validate item type field:

- **On Change:**
  - Show/hide conditional fields immediately
  - Clear conditional field values
  - Re-validate form

- **Validation Rules:**
  - Required: Yes
  - Values: "PHYSICAL", "DIGITAL", "SERVICE"
  - Case-insensitive (convert to uppercase)

---

#### **FR-2.4: Price Field Validation**

**Requirement:** System shall validate price field:

- **On Blur:**
  - If empty: Show error "Price is required"
  - If < 0.01: Show error "Price must be at least $0.01"
  - If > 999999.99: Show error "Price must not exceed $999,999.99"
  - If invalid format: Show error "Price must be a valid number"
  - Semantic: `role="alert"`, `data-testid="price-error"`

- **Validation Rules:**
  - Required: Yes
  - Type: Number (float)
  - Min: 0.01
  - Max: 999999.99
  - Decimal Places: 2

---

#### **FR-2.5: Category Field Validation**

**Requirement:** System shall validate category field:

- **On Blur:**
  - If empty: Show error "Category is required"
  - If length > 50: Show error "Category must not exceed 50 characters"
  - Semantic: `role="alert"`, `data-testid="category-error"`

- **Validation Rules:**
  - Required: Yes
  - Min Length: 1 character
  - Max Length: 50 characters

---

#### **FR-2.6: Tags Field Validation**

**Requirement:** System shall validate tags field:

- **On Blur:**
  - If > 10 tags: Show error "Maximum 10 tags allowed"
  - If duplicate tags: Show error "Tags must be unique"
  - If any tag > 30 chars: Show error "Each tag must not exceed 30 characters"
  - Semantic: `role="alert"`, `data-testid="tags-error"`

- **Validation Rules:**
  - Required: No
  - Type: Array of strings
  - Max Items: 10
  - Each Tag: 1-30 characters
  - Uniqueness: No duplicates

---

#### **FR-2.7: Conditional Fields Validation**

**Requirement:** System shall validate conditional fields based on Item Type:

- **Physical Item Fields:**
  - **Weight:**
    - Required if Item Type = Physical
    - Type: Number (float)
    - Min: > 0
    - Unit: kg
    - Error: "Weight is required for physical items" (if missing)
    - Error: "Weight must be greater than 0" (if invalid)
    - Semantic: `data-testid="weight-error"`

  - **Dimensions:**
    - Required if Item Type = Physical
    - Type: Object with length, width, height
    - All fields: Number (float), > 0
    - Unit: cm
    - Error: "Dimensions are required for physical items" (if missing)
    - Error: "All dimensions must be greater than 0" (if invalid)
    - Semantic: `data-testid="dimensions-error"`

- **Digital Item Fields:**
  - **Download URL:**
    - Required if Item Type = Digital
    - Type: String
    - Format: Valid URL
    - Error: "Download URL is required for digital items" (if missing)
    - Error: "Download URL must be a valid URL" (if invalid format)
    - Semantic: `data-testid="download-url-error"`

  - **File Size:**
    - Required if Item Type = Digital
    - Type: Number (integer)
    - Min: > 0
    - Unit: bytes
    - Error: "File size is required for digital items" (if missing)
    - Error: "File size must be greater than 0" (if invalid)
    - Semantic: `data-testid="file-size-error"`

- **Service Item Fields:**
  - **Duration Hours:**
    - Required if Item Type = Service
    - Type: Number (integer)
    - Min: > 0
    - Unit: hours
    - Error: "Duration is required for service items" (if missing)
    - Error: "Duration must be greater than 0" (if invalid)
    - Semantic: `data-testid="duration-hours-error"`

---

#### **FR-2.8: File Upload Validation**

**Requirement:** System shall validate file upload:

- **On File Select:**
  - Validate file type immediately
  - Validate file size immediately
  - Show file name and size
  - Display error if invalid

- **File Type Validation:**
  - Allowed: `.jpg`, `.jpeg`, `.png`, `.pdf`, `.doc`, `.docx`
  - Check: File extension (case-insensitive)
  - Error: "File type {extension} not supported. Allowed: jpg, jpeg, png, pdf, doc, docx"
  - Error Code: 415
  - Semantic: `data-testid="file-type-error"`

- **File Size Validation:**
  - Max Size: 5 MB (5,242,880 bytes)
  - Min Size: 1 KB (1,024 bytes)
  - Error: "File too large. Max size: 5MB" (if too large)
  - Error: "File too small. Min size: 1KB" (if too small)
  - Error Code: 413
  - Semantic: `data-testid="file-size-error"`

- **File Display:**
  - Show selected file name
  - Show file size
  - Show remove file button
  - Semantic: `data-testid="selected-file"`

---

### **3.3 Form Submission**

#### **FR-3.1: Create Item Button Behavior**

**Requirement:** System shall handle Create Item button click:

- **On Click:**
  1. Validate all fields (including conditional fields)
  2. If any field invalid: Show errors, prevent submission
  3. If all fields valid:
     - Disable button
     - Show loading spinner
     - Create FormData object
     - Append `item_data` (JSON string)
     - Append `file` (if provided)
     - Call API: `POST /api/items`
     - Content-Type: `multipart/form-data`

- **During API Call:**
  - Button shows loading state (spinner, disabled)
  - Semantic: `aria-busy="true"`, `disabled="true"`

- **On Success (201 Created):**
  - Response: `{ "status": "success", "message": "...", "data": {...}, "item_id": "..." }`
  - Show success message: "Item created successfully"
  - Redirect to Item List page (or show created item)
  - Clear form

- **On Error:**
  - **400 Bad Request:** Show error message from response
  - **401 Unauthorized:** Show error "Authentication required. Please log in."
  - **409 Conflict:** Show error "Item with same name and category already exists"
  - **413 Payload Too Large:** Show error "File too large. Max size: 5MB"
  - **415 Unsupported Media Type:** Show error "File type not supported"
  - **422 Unprocessable Entity:** Show validation errors from response
  - **500 Server Error:** Show error "Something went wrong. Please try again."
  - **Network Error:** Show error "Connection failed. Please check your internet and try again."
  - Re-enable button
  - Clear loading state
  - Semantic: `role="alert"`, `aria-live="assertive"`, `data-testid="create-item-error"`

---

### **3.4 Business Rule Validation**

#### **FR-4.1: Category-Item Type Rules**

**Requirement:** System shall enforce category-item type rules:

- **Electronics category:**
  - Must be Physical item type
  - Error: "Electronics must be physical items"
  - Error Code: 400

- **Software category:**
  - Must be Digital item type
  - Error: "Software must be digital items"
  - Error Code: 400

- **Services category:**
  - Must be Service item type
  - Error: "Services must be service items"
  - Error Code: 400

---

#### **FR-4.2: Price Limits by Category**

**Requirement:** System shall enforce price limits by category:

- **Electronics:**
  - Min: $10.00
  - Max: $50,000.00
  - Error: "Price for Electronics must be between $10.00 and $50,000.00"
  - Error Code: 400

- **Books:**
  - Min: $5.00
  - Max: $500.00
  - Error: "Price for Books must be between $5.00 and $500.00"
  - Error Code: 400

- **Services:**
  - Min: $25.00
  - Max: $10,000.00
  - Error: "Price for Services must be between $25.00 and $10,000.00"
  - Error Code: 400

- **Other categories:**
  - No price limits

---

#### **FR-4.3: Similar Items Check**

**Requirement:** System shall check for similar items:

- **Rule:**
  - If 3+ items exist with similar name (first 5 characters match) in same category → Reject
  - Error: "Too many similar items exist in this category"
  - Error Code: 400

---

#### **FR-4.4: Duplicate Check**

**Requirement:** System shall check for duplicate items:

- **Rule:**
  - Check if item with same `name` AND `category` already exists
  - Error: "Item with same name and category already exists"
  - Error Code: 409

---

## **4. API Endpoint Specification**

### **4.1 Create Item Endpoint**

**Endpoint:** `POST /api/items`  
**Authentication:** Required (JWT token in Authorization header)  
**Content-Type:** `multipart/form-data`

**Request Format:**
- Form field: `item_data` (JSON string containing item fields)
- Form field: `file` (optional, file upload)

**Request Example:**
```
POST /api/items
Content-Type: multipart/form-data
Authorization: Bearer {jwt-token}

item_data: {"name":"Laptop","description":"High-performance laptop","item_type":"PHYSICAL","price":1299.99,"category":"Electronics","tags":["laptop","computer"],"weight":2.5,"dimensions":{"length":35.5,"width":24.0,"height":2.0}}
file: [binary file data]
```

**Response Codes:**
- `201 Created` - Item created successfully
- `400 Bad Request` - Business rule validation failed
- `401 Unauthorized` - Authentication required/invalid
- `409 Conflict` - Duplicate item exists
- `413 Payload Too Large` - File size exceeds limit
- `415 Unsupported Media Type` - Invalid file type
- `422 Unprocessable Entity` - Schema validation failed
- `500 Internal Server Error` - Server error

---

## **5. Error Response Format**

### **5.1 Error Response Structure**

**Format:**
```json
{
  "status": "error",
  "error_code": 422,
  "error_type": "Unprocessable Entity - Schema validation failed",
  "message": "Name must be between 3 and 100 characters",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items"
}
```

**Error Codes:**
- `400`: Bad Request - Business logic validation failed
- `401`: Unauthorized - Authentication required
- `409`: Conflict - Resource already exists
- `413`: Payload Too Large - File size exceeds limit
- `415`: Unsupported Media Type - Invalid file type
- `422`: Unprocessable Entity - Schema validation failed
- `500`: Internal Server Error - Server error

---

## **6. Success Response Format**

### **6.1 Success Response Structure**

**Status Code:** 201 Created

**Format:**
```json
{
  "status": "success",
  "message": "Item created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Laptop Computer",
    "description": "High-performance laptop for development",
    "item_type": "PHYSICAL",
    "price": 1299.99,
    "category": "Electronics",
    "tags": ["laptop", "computer", "electronics"],
    "weight": 2.5,
    "dimensions": {
      "length": 35.5,
      "width": 24.0,
      "height": 2.0
    },
    "file_path": "uploads/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
    "created_by": "507f1f77bcf86cd799439012",
    "created_at": "2024-12-17T02:17:00Z",
    "updated_at": "2024-12-17T02:17:00Z",
    "is_active": true
  },
  "item_id": "507f1f77bcf86cd799439011"
}
```

---

## **7. Database Requirements**

### **7.1 Items Collection (MongoDB)**

**Collection Name:** `items`

**Schema:**
```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated
  name: String,                     // Required, indexed with category
  description: String,               // Required
  item_type: String,                 // Enum: PHYSICAL, DIGITAL, SERVICE
  price: Number,                     // Required
  category: String,                  // Required, indexed with name
  tags: [String],                    // Optional, array
  created_by: ObjectId,              // Reference to users collection
  created_at: Date,                  // Auto-generated
  updated_at: Date,                  // Auto-updated
  is_active: Boolean,                // Default: true
  
  // Conditional fields (based on item_type):
  weight: Number,                    // Required if PHYSICAL
  dimensions: {                      // Required if PHYSICAL
    length: Number,
    width: Number,
    height: Number
  },
  download_url: String,             // Required if DIGITAL
  file_size: Number,                 // Required if DIGITAL
  duration_hours: Number,            // Required if SERVICE
  
  // Optional:
  file_path: String                  // Path to uploaded file
}
```

**Indexes:**
- Compound unique: `{name: 1, category: 1}`
- Compound: `{category: 1, item_type: 1}`
- Single: `{created_by: 1}`
- Array: `{tags: 1}`

---

## **8. Security Requirements**

### **8.1 Authentication**

- All requests require valid JWT token
- Token validated on every request
- Invalid/expired token → 401 Unauthorized

### **8.2 Input Validation**

- All inputs validated on backend (never trust frontend)
- File type validation (whitelist approach)
- File size limits enforced
- SQL injection prevention (MongoDB parameterized queries)
- XSS prevention (sanitize inputs)

### **8.3 File Upload Security**

- File type whitelist (only allowed extensions)
- File size limits (5 MB max)
- File stored with UUID naming (prevent path traversal)
- File path stored in database (not user-controlled)

---

## **9. Non-Functional Requirements**

### **9.1 Performance**

- API response time: < 1 second
- File upload processing: < 2 seconds
- Form validation: Real-time (< 100ms)
- Page load time: < 2 seconds

### **9.2 Usability**

- All form fields have clear labels
- Error messages are clear and helpful
- Loading states visible during API calls
- Conditional fields appear/disappear smoothly
- Responsive design (mobile, tablet, desktop)
- Accessible (WCAG 2.1 Level AA)

### **9.3 Reliability**

- Graceful error handling
- No data loss
- Database transactions for consistency
- File upload rollback on error

---

## **10. Dependencies**

### **10.1 External Dependencies**

- MongoDB database for item storage
- FastAPI (or Express.js) for API endpoints
- File storage system (local filesystem or cloud storage)
- Authentication system (Flow 1)

### **10.2 Internal Dependencies**

- Flow 1 (Authentication) - required for access
- User management system (for created_by field)

---

**Document Version:** 1.0  
**Status:** ✅ LOCKED - Ready for Architecture Design  
**Next:** Architecture Design

