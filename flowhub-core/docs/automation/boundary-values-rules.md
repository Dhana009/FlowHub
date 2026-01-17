# **Boundary Values & Business Rules for QA Testing**

**Purpose:** Complete boundary values and validation rules for all API endpoints  
**Use Case:** Boundary testing, mutation testing, negative test case generation

---

## **Authentication Endpoints**

### **Email Field**
- **Type:** string
- **Required:** Yes
- **Min Length:** N/A (validated by regex)
- **Max Length:** N/A (validated by regex)
- **Pattern:** `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- **Boundary Values:**
  - ✅ Valid: `user@example.com`, `test.user@domain.co.uk`
  - ❌ Invalid: `user@`, `@example.com`, `user@example`, `user example@domain.com`
  - **Edge Cases:** Empty string, null, number, object, special chars without @

### **Password Field**
- **Type:** string
- **Required:** Yes
- **Min Length:** 8 characters
- **Max Length:** No explicit limit (test with 1000+ chars)
- **Pattern Requirements:**
  - At least one uppercase (A-Z)
  - At least one lowercase (a-z)
  - At least one number (0-9)
  - At least one special char (!@#$%^&*)
- **Boundary Values:**
  - ✅ Valid: `Password123!`, `Test@1234`
  - ❌ Invalid: `password123!` (no uppercase), `PASSWORD123!` (no lowercase), `Password!` (no number), `Password123` (no special char)
  - **Edge Cases:**
    - Exactly 7 chars: `Pass123!` → Should fail
    - Exactly 8 chars: `Pass123!` → Should pass
    - All requirements in one char: `P1!a` → Too short (4 chars)

### **OTP Field**
- **Type:** string
- **Required:** Yes
- **Exact Length:** 6 digits
- **Pattern:** `^[0-9]{6}$`
- **Boundary Values:**
  - ✅ Valid: `123456`, `000000`, `999999`
  - ❌ Invalid: `12345` (5 digits), `1234567` (7 digits), `abcdef` (letters), `12 3456` (spaces)

### **First Name / Last Name**
- **Type:** string
- **Required:** Yes
- **Min Length:** 2 characters
- **Max Length:** 50 characters
- **Pattern:** `^[a-zA-Z\s]+$` (letters and spaces only)
- **Boundary Values:**
  - ✅ Valid: `Jo`, `John`, `Mary Jane`, `O'Brien` (if allowed)
  - ❌ Invalid: `J` (1 char), `A` (1 char), `John123` (numbers), `John-Doe` (hyphen)
  - **Edge Cases:**
    - Exactly 2 chars: `Jo` → Should pass
    - Exactly 50 chars: `A...A` (50 chars) → Should pass
    - Exactly 51 chars: `A...A` (51 chars) → Should fail
    - Empty string, null, number, object

### **Role Field**
- **Type:** string
- **Required:** No (defaults to "EDITOR")
- **Allowed Values:** `"ADMIN"`, `"EDITOR"`, `"VIEWER"`
- **Case Sensitive:** Yes (must be uppercase)
- **Boundary Values:**
  - ✅ Valid: `"ADMIN"`, `"EDITOR"`, `"VIEWER"`, `null` (defaults to EDITOR)
  - ❌ Invalid: `"admin"` (lowercase), `"Admin"` (mixed case), `"USER"` (not in enum)

### **Remember Me Field**
- **Type:** boolean
- **Required:** No (defaults to false)
- **Boundary Values:**
  - ✅ Valid: `true`, `false`, `null` (defaults to false)
  - ❌ Invalid: `"true"` (string), `1` (number), `"yes"` (string)

---

## **Item Management Endpoints**

### **Name Field**
- **Type:** string
- **Required:** Yes
- **Min Length:** 3 characters
- **Max Length:** 100 characters
- **Pattern:** `^[a-zA-Z0-9\s\-_]+$` (alphanumeric, spaces, hyphens, underscores)
- **Boundary Values:**
  - ✅ Valid: `ABC`, `Item Name`, `Item-123`, `Item_Name`
  - ❌ Invalid: `AB` (2 chars), `Item@Name` (@ not allowed), `Item.Name` (. not allowed)
  - **Edge Cases:**
    - Exactly 3 chars: `ABC` → Should pass
    - Exactly 100 chars: `A...A` (100 chars) → Should pass
    - Exactly 101 chars: `A...A` (101 chars) → Should fail

### **Description Field**
- **Type:** string
- **Required:** Yes
- **Min Length:** 10 characters
- **Max Length:** 500 characters
- **Boundary Values:**
  - ✅ Valid: `This is a valid description with at least 10 characters`
  - ❌ Invalid: `Short` (5 chars), `Too short` (9 chars)
  - **Edge Cases:**
    - Exactly 10 chars: `1234567890` → Should pass
    - Exactly 500 chars: `A...A` (500 chars) → Should pass
    - Exactly 501 chars: `A...A` (501 chars) → Should fail

### **Item Type Field**
- **Type:** string
- **Required:** Yes
- **Allowed Values:** `"PHYSICAL"`, `"DIGITAL"`, `"SERVICE"`
- **Case Sensitive:** Yes (must be uppercase)
- **Boundary Values:**
  - ✅ Valid: `"PHYSICAL"`, `"DIGITAL"`, `"SERVICE"`
  - ❌ Invalid: `"physical"`, `"Physical"`, `"PRODUCT"` (not in enum)

### **Price Field**
- **Type:** number
- **Required:** Yes
- **Min Value:** 0.01
- **Max Value:** 999,999.99
- **Decimal Places:** 2 (rounded automatically)
- **Boundary Values:**
  - ✅ Valid: `0.01`, `999999.99`, `100.50`, `0.99`
  - ❌ Invalid: `0.00` (below minimum), `0.009` (below minimum), `1000000.00` (above maximum)
  - **Edge Cases:**
    - Exactly 0.01 → Should pass
    - Exactly 999999.99 → Should pass
    - 0.005 (rounds to 0.01) → Should pass
    - 0.004 (rounds to 0.00) → Should fail
    - Negative numbers → Should fail
    - String "100" → Should fail (type validation)

### **Category Field**
- **Type:** string
- **Required:** Yes
- **Min Length:** 1 character
- **Max Length:** 50 characters
- **Boundary Values:**
  - ✅ Valid: `A`, `Electronics`, `Home & Garden`
  - ❌ Invalid: Empty string `""`, `A...A` (51 chars)
  - **Edge Cases:**
    - Exactly 1 char: `A` → Should pass
    - Exactly 50 chars: `A...A` (50 chars) → Should pass
    - Exactly 51 chars: `A...A` (51 chars) → Should fail

### **Tags Field**
- **Type:** array of strings
- **Required:** No (defaults to empty array)
- **Max Items:** 10 tags
- **Tag Min Length:** 1 character
- **Tag Max Length:** 30 characters
- **Uniqueness:** All tags must be unique
- **Boundary Values:**
  - ✅ Valid: `[]`, `["tag1"]`, `["tag1", "tag2", ... "tag10"]` (10 unique tags)
  - ❌ Invalid: `["tag1", "tag1"]` (duplicate), `["tag1", ... "tag11"]` (11 tags), `[""]` (empty tag)
  - **Edge Cases:**
    - Exactly 10 tags → Should pass
    - Exactly 11 tags → Should fail
    - Tag with 1 char: `["A"]` → Should pass
    - Tag with 30 chars: `["A...A"]` (30 chars) → Should pass
    - Tag with 31 chars: `["A...A"]` (31 chars) → Should fail

### **PHYSICAL Item - Weight Field**
- **Type:** number
- **Required:** Yes (if item_type is PHYSICAL)
- **Min Value:** 0.01
- **Boundary Values:**
  - ✅ Valid: `0.01`, `100.5`, `999.99`
  - ❌ Invalid: `0.00`, `0.009`, negative numbers
  - **Edge Cases:**
    - Exactly 0.01 → Should pass
    - 0.005 (rounds) → Should pass
    - 0.004 (rounds to 0.00) → Should fail

### **PHYSICAL Item - Length/Width/Height Fields**
- **Type:** number
- **Required:** Yes (if item_type is PHYSICAL)
- **Min Value:** 0.01
- **Boundary Values:**
  - Same as Weight field above

### **DIGITAL Item - Download URL Field**
- **Type:** string
- **Required:** Yes (if item_type is DIGITAL)
- **Format:** Valid URL (http:// or https://)
- **Boundary Values:**
  - ✅ Valid: `https://example.com/file.zip`, `http://domain.com/download`
  - ❌ Invalid: `not-a-url`, `ftp://example.com` (wrong protocol), `example.com` (no protocol)

### **DIGITAL Item - File Size Field**
- **Type:** integer
- **Required:** Yes (if item_type is DIGITAL)
- **Min Value:** 1 (bytes)
- **Boundary Values:**
  - ✅ Valid: `1`, `1024`, `1048576` (1MB)
  - ❌ Invalid: `0`, negative numbers, decimals

### **SERVICE Item - Duration Hours Field**
- **Type:** integer
- **Required:** Yes (if item_type is SERVICE)
- **Min Value:** 1 hour
- **Boundary Values:**
  - ✅ Valid: `1`, `24`, `168` (1 week)
  - ❌ Invalid: `0`, negative numbers, decimals

### **Version Field (for PUT /items/:id)**
- **Type:** integer
- **Required:** Yes
- **Min Value:** 1
- **Purpose:** Optimistic locking
- **Boundary Values:**
  - ✅ Valid: `1`, `2`, `100`
  - ❌ Invalid: `0`, negative numbers, decimals, string "1"
  - **Business Rule:** Must match current item version in database, otherwise returns 409 VERSION_CONFLICT

---

## **User Management Endpoints**

### **Role Field (PATCH /users/:id/role)**
- **Type:** string
- **Required:** Yes
- **Allowed Values:** `"ADMIN"`, `"EDITOR"`, `"VIEWER"`
- **Boundary Values:** Same as Auth role field

### **IsActive Field (PATCH /users/:id/status)**
- **Type:** boolean
- **Required:** Yes
- **Boundary Values:**
  - ✅ Valid: `true`, `false`
  - ❌ Invalid: `"true"` (string), `1` (number), `null`

---

## **Bulk Operations Endpoints**

### **Operation Field**
- **Type:** string
- **Required:** Yes
- **Allowed Values:** `"delete"`, `"activate"`, `"deactivate"`, `"update_category"`
- **Boundary Values:**
  - ✅ Valid: `"delete"`, `"activate"`, `"deactivate"`, `"update_category"`
  - ❌ Invalid: `"DELETE"` (uppercase), `"remove"` (not in enum), `null`

### **ItemIds Field**
- **Type:** array of strings
- **Required:** Yes
- **Min Items:** 1
- **Boundary Values:**
  - ✅ Valid: `["id1"]`, `["id1", "id2", ... "id100"]`
  - ❌ Invalid: `[]` (empty array), `null`, `"id1"` (string instead of array)

---

## **Query Parameters**

### **Pagination - Page**
- **Type:** integer
- **Required:** No (defaults to 1)
- **Min Value:** 1
- **Boundary Values:**
  - ✅ Valid: `1`, `2`, `100`
  - ❌ Invalid: `0`, negative numbers, decimals, string "1"

### **Pagination - Limit**
- **Type:** integer
- **Required:** No (defaults to 20)
- **Min Value:** 1
- **Max Value:** 100 (for GET /items)
- **Boundary Values:**
  - ✅ Valid: `1`, `20`, `100`
  - ❌ Invalid: `0`, `101` (above max), negative numbers, decimals

### **Search Field (GET /items)**
- **Type:** string
- **Required:** No
- **Boundary Values:**
  - ✅ Valid: `"laptop"`, `""` (empty string), `null`
  - **Edge Cases:** Very long strings (1000+ chars), special characters

### **Status Field (GET /items)**
- **Type:** string
- **Required:** No
- **Allowed Values:** `"active"`, `"inactive"`
- **Boundary Values:**
  - ✅ Valid: `"active"`, `"inactive"`, `null`
  - ❌ Invalid: `"ACTIVE"` (uppercase), `"deleted"` (not in enum)

### **Sort Order Field**
- **Type:** string
- **Required:** No
- **Allowed Values:** `"asc"`, `"desc"`
- **Boundary Values:**
  - ✅ Valid: `"asc"`, `"desc"`, `null`
  - ❌ Invalid: `"ASC"` (uppercase), `"ascending"` (not in enum)

---

## **Business Rules**

### **Conditional Field Requirements**
1. **PHYSICAL items** MUST have: `weight`, `length`, `width`, `height`
2. **DIGITAL items** MUST have: `download_url`, `file_size`
3. **SERVICE items** MUST have: `duration_hours`
4. Conditional fields for other types are ignored/cleared

### **Duplicate Detection**
- Items with same `name` + `category` + `created_by` are considered duplicates
- Returns `409 CONFLICT_ERROR` if duplicate detected
- Case-insensitive name matching (normalized)

### **Ownership Rules**
- **EDITOR** can only modify/delete items they created (`created_by` matches user ID)
- **ADMIN** can modify/delete any item (bypasses ownership check)
- **VIEWER** cannot create/modify/delete items (403 Forbidden)

### **Optimistic Locking**
- `PUT /items/:id` requires `version` field
- `version` must match current item version in database
- If mismatch: Returns `409 VERSION_CONFLICT`
- Version increments automatically on each update

### **Soft Delete**
- `DELETE /items/:id` sets `is_active: false` (soft delete)
- Soft-deleted items can be restored via `PATCH /items/:id/activate`
- Soft-deleted items excluded from default GET /items queries (unless `status=inactive`)

### **Self-Protection Rules**
- Admin cannot deactivate their own account
- Returns `403 Forbidden` if admin tries to deactivate themselves

---

## **Testing Recommendations**

### **Boundary Testing Strategy:**
1. **Min Boundary:** Test value at minimum (e.g., 3 chars for name)
2. **Min - 1:** Test value just below minimum (e.g., 2 chars for name) → Should fail
3. **Max Boundary:** Test value at maximum (e.g., 100 chars for name)
4. **Max + 1:** Test value just above maximum (e.g., 101 chars for name) → Should fail
5. **Type Violations:** Test with wrong types (number instead of string, etc.)
6. **Pattern Violations:** Test with invalid patterns (special chars where not allowed)

### **Mutation Testing:**
- Change required fields to optional
- Change enum values to invalid values
- Change numeric ranges (min/max)
- Change string patterns
- Change array constraints (min/max items)

---

**Use this document for generating boundary test cases and mutation test scenarios.**






