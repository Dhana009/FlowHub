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
- Minimum: 1 KB (informational only, not validated)

**File Upload Validation Sequence:**
1. Check if file is provided in request (optional)
2. If NO file provided → Continue without file validation (no error)
3. If file IS provided:
   - **Step 1:** Validate file type
     - Check MIME type against allowed list
     - If invalid → 415 Unsupported Media Type
   - **Step 2:** Validate file size
     - Check actual file size ≤ 5 MB
     - If exceeds → 413 Payload Too Large
   - **Step 3:** Store file
     - Save to `uploads/` directory
     - Naming: `{uuid}.{extension}`

**File Validation Timing in Overall Sequence:**
- File validation occurs AFTER schema validation but BEFORE business rules
- File upload is independent of item type (can upload for any item type)
- File upload does NOT trigger conditional field requirements
- File upload is purely optional enhancement

**File Upload Rollback Strategy (Atomic Operations):**
- **Two-Phase Commit Pattern:** File operations use atomic transaction with rollback capability
- **Phase 1 - Validation (No Side Effects):**
  - Validate file metadata (type, size) without persistence
  - If validation fails → Return error immediately, no cleanup needed
- **Phase 2 - Atomic Persistence:**
  - Create item record in database (with transaction)
  - Upload file(s) to storage
  - Update item with file references
  - Commit transaction OR rollback everything on any failure
- **Rollback Actions (On Any Failure):**
  - If item creation fails → No cleanup needed (nothing persisted)
  - If file upload fails after item creation → Delete item record + any partially uploaded files
  - If file content validation fails → Delete item record + all uploaded files
  - If business rules fail after file upload → Delete item record + all uploaded files
- **Error Handling:**
  - All file operations are tracked in rollback action list
  - On any error, execute rollback actions in reverse order
  - Log all rollback failures but don't fail the rollback process
- **File Path Storage:**
  - `file_path` field is only set after successful file upload and item creation
  - If file upload fails, `file_path` is null/omitted (not set)
  - If item creation fails, no file_path is stored even if file was uploaded

**Storage Details:**
- Files stored in `uploads/` directory
- File path stored in MongoDB item document as `file_path` field
- File naming: `{uuid}.{extension}` (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf`)
- File path example: `uploads/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf`
- UUID generation: Use standard UUID v4 format

**Scope of File Validation (What is validated):**
- ✅ File type (MIME type check)
- ✅ File size (must be ≤ 5 MB)
- ❌ NOT validated: File content, virus scanning, magic number verification

**Scope NOT Included (Out of Scope):**
- Virus/malware scanning
- File content validation
- Magic number verification
- Compression
- Multiple file uploads

---

## **8. Validation Rules**

### **Validation Sequence (Priority Order - DETERMINISTIC)**
Process validations in this exact sequence. Stop and return error at first failure.

**Error Precedence Hierarchy:**
1. **Level 1 - Structural/Schema Errors** (Highest Priority): Missing fields, invalid types, format violations
2. **Level 2 - File Errors** (Second Priority): File type/size validation failures
3. **Level 3 - Business Logic Errors** (Lowest Priority): Business rules, duplicates, similar items

1. **Authentication Check** (always first, Precedence 0)
   - Verify token exists and is valid
   - Failure → 401 Unauthorized
   - **Note:** Authentication failures take absolute precedence over all other validations
   
2. **Schema Validation** (Level 1 - Structural, Precedence 1)
   - Name: length, pattern
   - Description: length
   - Item type: enum validation (PHYSICAL, DIGITAL, SERVICE)
   - Price: range, decimal places
   - Category: length
   - Tags: array length, tag length, tag uniqueness (case-insensitive)
   - **Conditional fields: presence check for required fields per type**
     - If conditional fields are missing → 422 error (schema validation, NOT business rule)
     - Example: Physical item missing weight → 422 "Weight is required for physical items"
   - Failure → 422 Unprocessable Entity
   - **Edge Case Handling:** If conditional fields fail validation, return schema error (422), not business rule error (400)
   
3. **File Validation** (Level 2 - File, Precedence 2, only if file is provided in request)
   - File type check (MIME type validation)
   - File size check (≤ 5 MB)
   - Failure → 415 (invalid type) or 413 (too large)
   - **Edge Case Handling:** 
     - If conditional fields pass schema validation but file validation fails → Return file error (413/415)
     - File validation errors take precedence over business rule errors
     - Example: Physical item with valid weight but invalid file → 415/413 error, NOT business rule error
   
4. **Business Rule Validation** (Level 3 - Business Logic, Precedence 3)
   - Category-item type compatibility (Electronics→PHYSICAL, Software→DIGITAL, Services→SERVICE)
   - Price range validation by category (Electronics: $10-$50k, Books: $5-$500, Services: $25-$10k)
   - Conditional field value validation (weight > 0, dimensions > 0, download_url valid URL, duration_hours integer > 0)
   - Similar items check: 3+ items with same adaptive prefix in SAME normalized category
   - Failure → 400 Bad Request
   - **Note:** Business rule validation only runs if schema and file validation pass
   
5. **Duplicate Check** (Level 3 - Business Logic, Precedence 3, database lookups)
   - Check for exact duplicate: same normalized name + same normalized category
   - Failure → 409 Conflict
   - **Note:** Duplicate check runs after all other validations pass

**Execution Rule:** Stop at FIRST validation failure. Return that error code and message. Do NOT continue or accumulate errors.

**Validation Sequence Examples:**
- Physical item missing weight + invalid file → Return 422 (schema error, not file error)
- Physical item with valid weight + invalid file → Return 413/415 (file error, not business rule error)
- Physical item with valid weight + valid file + invalid category-type combo → Return 400 (business rule error)

---

### **Schema Validation (422 - Unprocessable Entity):**

**Name:**
- Required: Yes
- Type: String
- Min Length: 3 characters
- Max Length: 100 characters
- Pattern: Alphanumeric + spaces, hyphens, underscores
- **Normalization Rules (FOR COMPARISON ONLY - Store original case):**
  - Trim leading/trailing whitespace (spaces, tabs, newlines)
  - Normalize internal whitespace: Replace 1+ consecutive spaces/tabs with single space
  - Convert to lowercase for comparison
  - Algorithm: `name.toLowerCase().trim().replace(/\s+/g, ' ')`
  - Example: "  iPhone 13  " → normalized to "iphone 13" for comparison
  - Store: Keep original case in database ("  iPhone 13  ")

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
- **Normalization Rule:** All categories are normalized to Title Case for storage and comparison
  - Input: Accept any case (e.g., "electronics", "ELECTRONICS", "Electronics")
  - Storage: Store as Title Case (e.g., "Electronics")
  - Comparison: All comparisons use normalized Title Case form
  - Algorithm: `.trim().title()` (e.g., "consumer electronics" → "Consumer Electronics")
- **Important:** Category normalization ensures consistent matching across all operations (duplicates, business rules, similar items)

**Tags:**
- Required: No
- Type: Array of strings
- Max Items: 10 tags
- Each tag: 1-30 characters
- Tags must be unique (no duplicates)
- **Uniqueness Rule:** 
  - Uniqueness scope: Per item (not global across all items)
  - Comparison: Case-insensitive (e.g., "electronics" = "ELECTRONICS" = "Electronics")
  - Normalization: Lowercase comparison, trim whitespace
  - Storage: Store original case in database
  - Algorithm: When validating tags array, compare each tag case-insensitively; reject if any duplicates found
- **Example:** Tags ["Electronics", "COMPUTER", "Laptop"] → Valid (all unique when lowercased)
- **Example:** Tags ["electronics", "Electronics"] → Invalid (duplicate when normalized)

**Conditional Fields (Validated Based on Item Type - See Section 6):**

**PHYSICAL Items Conditional Validation:**
- `weight` REQUIRED (number, > 0, in kg)
- `dimensions` REQUIRED (object with length, width, height all > 0, in cm)
- Missing weight → 422 error: "Weight is required for physical items"
- Missing dimensions → 422 error: "Dimensions are required for physical items"
- Invalid dimension values → 422 error (specific field)
- `download_url`, `file_size`, `duration_hours` must be null/empty (not provided in request)
- If these fields are provided for PHYSICAL items → 422 error: "These fields are not allowed for physical items"

**DIGITAL Items Conditional Validation:**
- `download_url` REQUIRED (string, valid URL format with http/https)
- `file_size` REQUIRED (number, > 0, in bytes)
- Missing download_url → 422 error: "Download URL is required for digital items"
- Missing file_size → 422 error: "File size is required for digital items"
- Invalid URL format → 422 error: "Download URL must be valid HTTP/HTTPS URL"
- `weight`, `dimensions`, `duration_hours` must be null/empty (not provided in request)
- If these fields are provided for DIGITAL items → 422 error: "These fields are not allowed for digital items"

**SERVICE Items Conditional Validation:**
- `duration_hours` REQUIRED (positive integer, > 0, in hours)
- Missing duration_hours → 422 error: "Duration hours is required for service items"
- Invalid value → 422 error: "Duration hours must be positive integer"
- `weight`, `dimensions`, `download_url`, `file_size` must be null/empty (not provided in request)
- If these fields are provided for SERVICE items → 422 error: "These fields are not allowed for service items"

**Validation Order for Conditional Fields:**
1. Validate item_type is provided and valid
2. Check required conditional fields for that type
3. Verify non-applicable fields are not provided
4. Validate values of conditional fields (ranges, formats)

### **Business Rule Validation (400 - Bad Request):**

1. **Category Normalization (Canonical Form):**
   - **Storage Rule:** All categories are stored in Title Case (e.g., "Electronics", "Home Appliances")
   - **Normalization Algorithm:** Convert input category to Title Case: `.trim().title()`
     - "electronics" → "Electronics"
     - "ELECTRONICS" → "Electronics"
     - "consumer electronics" → "Consumer Electronics"
   - **Comparison Rule:** All category comparisons (business rules, duplicates) use normalized Title Case
   - **Display Rule:** Always display stored Title Case form to users
   - **Input Rule:** Accept any case from user, normalize immediately before processing

2. **Category-Specific Rules (Applied to Normalized Categories):**
   - Electronics category → Must be Physical item type
   - Software category → Must be Digital item type
   - Services category → Must be Service item type
   - **Note:** Rules apply to normalized Title Case form (e.g., "electronics", "Electronics", "ELECTRONICS" all normalize to "Electronics")

3. **Price Limits by Category (Applied to Normalized Categories):**
   - Electronics: $10.00 - $50,000.00
   - Books: $5.00 - $500.00
   - Services: $25.00 - $10,000.00
   - Other categories: No price limits
   - **Note:** Price limits apply to normalized category names

3. **Similar Items Check:**
   - **Definition:** Adaptive prefix matching of normalized name (case-insensitive, whitespace-normalized) in SAME category
   - **Normalization Process:**
     1. Convert name to lowercase: `.toLowerCase()`
     2. Trim leading/trailing whitespace: `.trim()`
     3. Normalize internal whitespace: `.replace(/\s+/g, ' ')` (1+ spaces → single space)
   - **Adaptive Prefix Algorithm (Handles names <5 characters):**
     - **0 characters:** No similarity matching (empty name invalid)
     - **1-2 characters:** Use entire normalized name for matching
     - **3-4 characters:** Use all but last character (allows minor typos)
     - **5+ characters:** Use first 5 characters (standard rule)
     - **Pseudocode:**
       ```
       normalized = newName.toLowerCase().trim().replace(/\s+/g, ' ');
       nameLength = normalized.length;
       if (nameLength == 0) {
         prefix = ""; // Invalid case
       } else if (nameLength <= 2) {
         prefix = normalized; // Use entire name
       } else if (nameLength <= 4) {
         prefix = normalized.substring(0, nameLength - 1); // All but last char
       } else {
         prefix = normalized.substring(0, 5); // First 5 chars
       }
       ```
   - **Threshold Rule:** If count ≥ 3 → Reject (inclusive)
   - **Matching Logic:** Items match if their prefixes are identical (exact match, not substring)
   - **Pseudocode:**
     ```
     normalized = newName.toLowerCase().trim().replace(/\s+/g, ' ');
     prefix = getAdaptivePrefix(normalized);
     count = database.items.countDocuments({
       normalizedCategory: normalizedCategory,
       is_active: true,
       normalizedNamePrefix: prefix
     });
     if (count >= 3) {
       reject with 400 "Too many similar items exist in this category"
     }
     ```
   - **Concrete Examples:**
     - "iPhone 13", "iPhone 14", "iPhone 15" → All normalize to "iPhon" prefix → Count=3 → 3rd item rejected
     - "iPhone 13", "iPhone 14" → Count=2 → Allow new "iPhone 15" (because count would be 3, reject on 3rd)
     - "Phone" (5 chars) → Prefix: "Phone" → Matches: "Phon" (4 chars, prefix: "Pho"), "Phone" (5 chars, prefix: "Phone")
     - "Phon" (4 chars) → Prefix: "Pho" → Matches: "Phone" (prefix: "Phone" doesn't match "Pho"), "Phon" (prefix: "Pho" matches)
     - "AI" (2 chars) → Prefix: "AI" → Matches: "AI", "A" (1 char, prefix: "A" doesn't match "AI")
   - Error: "Too many similar items exist in this category" (400)
   - **Determinism:** Fully deterministic, testable, no ML/semantics

### **Duplicate Validation (409 - Conflict):**

- **Check:** Item with same normalized name AND same normalized category already exists
- **Duplicate Detection Algorithm:**
  ```
  normalizedNewName = newName.toLowerCase().trim().replace(/\s+/g, ' ');
  normalizedCategory = itemCategory.trim().title(); // Title Case normalization
  existingItem = database.items.findOne({
    // Name comparison: case-insensitive + whitespace-normalized
    normalizedName: normalizedNewName,
    // Category comparison: normalized Title Case
    normalizedCategory: normalizedCategory,
    is_active: true
  });
  if (existingItem) {
    reject with 409 "Item with same name and category already exists"
  }
  ```
- **Storage:** 
  - Name: Store original case + whitespace in database AND store normalized version for lookup
  - Category: Store normalized Title Case form in database (normalizedCategory field)
- **Examples:**
  - "  iPhone  " in category "Electronics" + "IPHONE" in "electronics" → Both normalize to "iphone" + "Electronics" → Duplicate (409)
  - "iPhone" in category "Electronics" + "iPhone" in "Electronics" → Duplicate (409)
  - "iPhone" in category "Electronics" + "iPhone" in "electronics" → Both normalize to "Electronics" → Duplicate (409)
  - "iPhone Pro" + "iPhone" → NOT duplicate (different normalized names)

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
- `name` (String, required, store original case)
- `normalizedName` (String, required, lowercase + whitespace-normalized, indexed)
- `description` (String, required)
- `item_type` (String, enum: PHYSICAL, DIGITAL, SERVICE)
- `price` (Number, required)
- `category` (String, required, store normalized Title Case)
- `normalizedCategory` (String, required, Title Case normalized, indexed)
- `normalizedNamePrefix` (String, required, adaptive prefix for similarity matching, indexed)
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
- Compound unique index: `{normalizedName: 1, normalizedCategory: 1}` (prevents duplicates at DB level)
- Index: `{normalizedCategory: 1, item_type: 1}`
- Index: `{created_by: 1}`
- Index: `{tags: 1}`
- Index: `{normalizedNamePrefix: 1, normalizedCategory: 1}` (for similar items check)

**Additional Fields for Normalization:**
- `normalizedName` (String, lowercase + whitespace-normalized, indexed)
- `normalizedCategory` (String, Title Case, indexed)
- `normalizedNamePrefix` (String, adaptive prefix for similarity matching, indexed)

**Concurrent Request Handling (Race Condition Protection):**
- **Database-Level Constraints:**
  - Compound unique index on `{normalizedName: 1, normalizedCategory: 1}` prevents duplicate items at database level
  - MongoDB will reject duplicate inserts even if two requests arrive simultaneously
- **Transaction Strategy:**
  - Use MongoDB transactions with `READ_COMMITTED` isolation level
  - Wrap item creation in transaction to ensure atomicity
  - Similar items count check uses `findOneAndUpdate` with atomic increment to prevent race conditions
- **Error Handling for Concurrent Requests:**
  - If duplicate key error (E11000) occurs → Return 409 Conflict with message "Item with same name and category already exists"
  - If transaction conflict occurs → Retry with exponential backoff (max 3 retries)
  - If retry limit exceeded → Return 500 Internal Server Error with message "Unable to complete request due to high concurrency. Please try again."
- **Similar Items Count Protection:**
  - Use atomic increment operations for counting similar items
  - Check count within transaction to prevent race conditions
  - If count check and item creation are in same transaction, both succeed or both fail

---

## **12. Item Type & Conditional Fields Reference**

### **Physical Items:**
- **Conditional Fields:** weight (required), dimensions (required: length, width, height)
- **Validation:**
  - weight: positive number (> 0, in kg)
  - dimensions: all positive numbers (> 0, in cm)
- **Allowed fields:** name, description, price, category, tags, weight, dimensions, file_path
- **Fields that must be null:** download_url, file_size, duration_hours

### **Digital Items:**
- **Conditional Fields:** download_url (required), file_size (required)
- **Validation:**
  - download_url: valid URL format (http/https)
  - file_size: positive number (> 0, in bytes)
- **Allowed fields:** name, description, price, category, tags, download_url, file_size, file_path
- **Fields that must be null:** weight, dimensions, duration_hours

### **Service Items:**
- **Conditional Fields:** duration_hours (required)
- **Validation:**
  - duration_hours: positive integer (> 0, in hours)
- **Allowed fields:** name, description, price, category, tags, duration_hours, file_path
- **Fields that must be null:** weight, dimensions, download_url, file_size

---

## **13. Out of Scope**

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

## **14. Approval & Sign-off**

**PRD Status:** ✅ **FINAL / LOCKED - ALL AMBIGUITIES RESOLVED & VERIFIED**  
**Version:** 1.4 (Final - All Critical Ambiguities Resolved via Gemini Architecture Analysis)  
**Date Approved:** December 17, 2024

**Changes in v1.4 (Critical Ambiguity Resolutions - Gemini Architecture Analysis):**
- **Ambiguity 1 - Similar Items Algorithm:** Added adaptive prefix matching algorithm for names <5 characters
  - 0 chars: No matching
  - 1-2 chars: Use entire name
  - 3-4 chars: Use all but last character
  - 5+ chars: Use first 5 characters
- **Ambiguity 2 - File Validation Rollback:** Added two-phase commit pattern with atomic operations
  - Phase 1: Validation without side effects
  - Phase 2: Atomic persistence with rollback on any failure
  - Clear cleanup strategy for all failure scenarios
- **Ambiguity 3 - Category Case Sensitivity:** Implemented canonical Title Case normalization
  - All categories normalized to Title Case for storage and comparison
  - Consistent handling across duplicates, business rules, and similar items
  - Added `normalizedCategory` field to database schema
- **Ambiguity 4 - Concurrent Request Handling:** Added database-level constraints and transaction strategy
  - Compound unique index prevents duplicates at DB level
  - MongoDB transactions with READ_COMMITTED isolation
  - Retry logic with exponential backoff for transaction conflicts
  - Atomic operations for similar items count
- **Ambiguity 5 - Validation Sequence Edge Case:** Clarified error precedence hierarchy
  - Level 1: Structural/Schema errors (highest priority)
  - Level 2: File errors (second priority)
  - Level 3: Business logic errors (lowest priority)
  - Added concrete examples for edge case handling
- **Database Schema Updates:** Added normalized fields (`normalizedName`, `normalizedCategory`, `normalizedNamePrefix`)
- **Updated Indexes:** Changed to use normalized fields for all lookups

**Changes in v1.3 (Gemini Final Verification Feedback):**
- Expanded validation sequence with explicit step descriptions and all fields per step
- Added concrete pseudocode for duplicate detection algorithm
- Added concrete pseudocode and examples for similar items algorithm
- Added regex/normalization algorithm: `toLowerCase().trim().replace(/\s+/g, ' ')`
- Clarified database storage strategy (store original + normalized for lookups)
- Clarified "per-item scope" for tags (uniqueness within single item's tags array)
- Expanded file validation with "only if provided" logic and default behavior
- Fixed error code for similar items (400, not 409)
- Ensured 100% determinism and testability
- All edge cases covered with concrete examples

**Changes in v1.1 (Initial Ambiguity Resolution):**
- Added validation sequence/priority order
- Clarified name normalization rules (case-insensitive, whitespace normalization)
- Clarified duplicate check comparison rules
- Clarified similar items algorithm with concrete examples
- Clarified file upload optionality
- Clarified conditional field requirements per item type
- Added item type reference section with explicit null field requirements

**Approved By:**
- Product Manager: ✅ Approved
- Tester/SDET: ✅ Ambiguity Analysis & Resolution Complete
- Stakeholders: ✅ Approved

**Next Steps:**
- Update Implementation to match clarified PRD
- Test against updated requirements
- Proceed to Flow 3 (Item List)

---

**Document Version:** 1.4 (Final - All Critical Ambiguities Resolved)  
**Status:** ✅ LOCKED - Ready for Implementation Alignment

