# **FlowHub — PRD: Flow 2 - Item Creation**

**Version:** 1.0 (Final)  
**Date:** December 17, 2024  
**Author:** Product Manager  
**Status:** ✅ LOCKED - Ready for Functional Specification

---

## **1. Overview**

FlowHub allows authenticated users to create items with different types (Physical, Digital, Service), each requiring specific conditional fields. The system provides comprehensive validation, file upload support, and rich error handling for automation testing.

**Flow Name:** Item Creation  
**Flow ID:** FLOW-002  
**Priority:** P0 (Critical - Core functionality)

---

## **2. Problem Statement**

Users need to create items in FlowHub with different types, each requiring specific metadata. The system must:
- Validate data comprehensively (schema + business rules)
- Handle conditional fields based on item type
- Support file uploads with type/size validation
- Prevent duplicates
- Provide clear error feedback
- Ensure data integrity

---

## **3. Business Value**

- **Data Quality:** Rich validation ensures only valid items are created
- **User Experience:** Conditional fields show/hide based on selections
- **Security:** File upload validation prevents malicious files
- **Data Integrity:** Duplicate prevention and business rules maintain consistency
- **Automation Testing:** Comprehensive error scenarios for test coverage

---

## **4. User Story**

**As a** authenticated user  
**I want to** create items with different types (Physical, Digital, Service)  
**So that** I can manage my inventory/work items with proper categorization and metadata

---

## **5. User Journey**

### **Item Creation Flow:**

1. User navigates to "Create Item" page (must be authenticated)
2. User sees item creation form with fields:
   - **Name** (required, text input)
   - **Description** (required, textarea)
   - **Item Type** (required, dropdown: Physical, Digital, Service)
   - **Price** (required, number input)
   - **Category** (required, dropdown or text input)
   - **Tags** (optional, multi-select or comma-separated)
   - **File Upload** (optional, file input)
3. **Conditional Fields Appear Based on Item Type:**
   - **If Physical:** Weight (required), Dimensions (required: length, width, height)
   - **If Digital:** Download URL (required), File Size (required)
   - **If Service:** Duration Hours (required)
4. User fills in all required fields
5. User optionally uploads a file (if provided)
6. User clicks "Create Item" button
7. **Frontend Validation (Real-time):**
   - Required fields check
   - Field length validation
   - Format validation (number ranges)
   - Conditional field validation
   - File type/size validation (if file selected)
8. **If validation fails:** Show inline error messages, prevent submission
9. **If validation passes:** Submit form to API
10. **Backend Processing:**
    - Authentication check (401 if invalid)
    - Schema validation (422 if invalid)
    - File validation (415 if invalid type, 413 if too large)
    - Business rule validation (400 if rules violated)
    - Duplicate check (409 if duplicate exists)
    - Save to MongoDB (201 if successful)
11. **Success Response:** Show success message, redirect to Item List or show created item
12. **Error Response:** Display appropriate error message based on error code

---

## **6. Item Types & Conditional Fields**

### **Physical Items:**
- **Required Conditional Fields:**
  - Weight (number, > 0, in kg)
  - Dimensions (object: length, width, height, all > 0, in cm)

### **Digital Items:**
- **Required Conditional Fields:**
  - Download URL (string, valid URL format)
  - File Size (number, > 0, in bytes)

### **Service Items:**
- **Required Conditional Fields:**
  - Duration Hours (integer, > 0, in hours)

**Note:** Conditional fields must appear/disappear dynamically based on Item Type selection. If user changes Item Type, conditional fields should update immediately.

---

## **7. File Upload Requirements**

**Allowed File Types:**
- Images: `.jpg`, `.jpeg`, `.png`
- Documents: `.pdf`, `.doc`, `.docx`

**File Size Limits:**
- Maximum: 5 MB per file
- Minimum: 1 KB

**Validation:**
- File type validation (415 if invalid)
- File size validation (413 if too large)
- File must be provided if user selects file input (400 if empty file)

**Storage:**
- Files stored in `uploads/` directory
- File path stored in MongoDB item document
- File naming: `{uuid}.{extension}`

---

## **8. Validation Rules**

### **Schema Validation (422 - Unprocessable Entity):**

**Name:**
- Required: Yes
- Type: String
- Min Length: 3 characters
- Max Length: 100 characters
- Pattern: Alphanumeric + spaces, hyphens, underscores

**Description:**
- Required: Yes
- Type: String
- Min Length: 10 characters
- Max Length: 500 characters

**Item Type:**
- Required: Yes
- Type: Enum
- Values: `PHYSICAL`, `DIGITAL`, `SERVICE`
- Case-insensitive (convert to uppercase)

**Price:**
- Required: Yes
- Type: Number (float)
- Min Value: 0.01
- Max Value: 999999.99
- Decimal Places: 2

**Category:**
- Required: Yes
- Type: String
- Min Length: 1 character
- Max Length: 50 characters

**Tags:**
- Required: No
- Type: Array of strings
- Max Items: 10 tags
- Each tag: 1-30 characters
- Tags must be unique (no duplicates)

**Conditional Fields:**
- Validated based on Item Type (see section 6)

### **Business Rule Validation (400 - Bad Request):**

1. **Category-Specific Rules:**
   - Electronics category → Must be Physical item type
   - Software category → Must be Digital item type
   - Services category → Must be Service item type

2. **Price Limits by Category:**
   - Electronics: $10.00 - $50,000.00
   - Books: $5.00 - $500.00
   - Services: $25.00 - $10,000.00
   - Other categories: No price limits

3. **Similar Items Check:**
   - If 3+ items exist with similar name (first 5 chars match) in same category → Reject
   - Error: "Too many similar items exist in this category"

### **Duplicate Validation (409 - Conflict):**

- Check: Item with same `name` AND `category` already exists
- Error: "Item with same name and category already exists"

---

## **9. Error Handling**

### **Error Response Format:**
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

### **Error Codes & Scenarios:**

**400 - Bad Request:**
- Business rule validation failed
- Invalid category-item type combination
- Price outside category limits
- Too many similar items

**401 - Unauthorized:**
- Missing authentication token
- Invalid/expired token
- User not authenticated

**409 - Conflict:**
- Duplicate item (same name + category exists)

**413 - Payload Too Large:**
- File size exceeds 5 MB limit

**415 - Unsupported Media Type:**
- File type not in allowed list (.jpg, .jpeg, .png, .pdf, .doc, .docx)

**422 - Unprocessable Entity:**
- Schema validation failed
- Missing required fields
- Invalid data types
- Field length violations
- Invalid enum values
- Conditional field validation failed

**500 - Internal Server Error:**
- Database connection failure
- Unexpected server errors

---

## **10. Success Response**

**Status Code:** 201 Created

**Response Format:**
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

## **11. Database Requirements**

**Database:** MongoDB  
**Collection:** `items`

**Required Fields:**
- `_id` (ObjectId, auto-generated)
- `name` (String, required, indexed with category)
- `description` (String, required)
- `item_type` (String, enum: PHYSICAL, DIGITAL, SERVICE)
- `price` (Number, required)
- `category` (String, required, indexed with name)
- `tags` (Array of Strings, optional)
- `created_by` (ObjectId, reference to users collection)
- `created_at` (Date, auto-generated)
- `updated_at` (Date, auto-updated)
- `is_active` (Boolean, default: true)

**Conditional Fields (based on item_type):**
- `weight` (Number, required if PHYSICAL)
- `dimensions` (Object: {length, width, height}, required if PHYSICAL)
- `download_url` (String, required if DIGITAL)
- `file_size` (Number, required if DIGITAL)
- `duration_hours` (Number, required if SERVICE)

**Optional Fields:**
- `file_path` (String, path to uploaded file)

**Indexes:**
- Compound unique index: `{name: 1, category: 1}`
- Index: `{category: 1, item_type: 1}`
- Index: `{created_by: 1}`
- Index: `{tags: 1}`

---

## **12. Out of Scope**

- Bulk item creation
- Item templates
- Item cloning/duplication
- Image preview before upload
- Drag-and-drop file upload
- Multiple file uploads
- File compression
- Item versioning
- Item approval workflow

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
- Create Functional Specification (FS) for Flow 2
- Create Architecture Document for Flow 2

---

**Document Version:** 1.0 (Final)  
**Status:** ✅ LOCKED - Ready for Functional Specification

