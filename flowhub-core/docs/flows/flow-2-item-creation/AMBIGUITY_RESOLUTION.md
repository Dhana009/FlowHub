# **Flow 2 - Item Creation: Ambiguity Resolution**

**Date:** December 17, 2024  
**Version:** 1.0  
**Status:** ✅ All Ambiguities Resolved

---

## **Ambiguities Identified & Resolved**

### **1. Duplicate Check - Data Normalization** ✅
**Original Ambiguity:** Should "iPhone" match "iphone"? What about whitespace?

**Resolution:**
- ✅ Name comparison: **Case-insensitive** (iPhone = iphone = IPHONE)
- ✅ Name comparison: **Normalize whitespace** (trim leading/trailing, single internal spaces)
- ✅ Category comparison: **Case-sensitive exact match**
- ✅ Store original case in database, use normalized form for comparison

**Implementation Impact:**
```javascript
// Before: case-sensitive, whitespace-sensitive
// After: normalize name to lowercase + trimmed for comparison
const normalizedName = name.toLowerCase().trim().replace(/\s+/g, ' ');
```

---

### **2. Similar Items Algorithm** ✅
**Original Ambiguity:** Is "first 5 chars" too naive? How does it handle product variants?

**Resolution:**
- ✅ Definition: **First 5 characters of normalized name match (case-insensitive, whitespace-normalized)**
- ✅ Threshold: **If 3+ items exist with matching first 5 chars in same category → Reject**
- ✅ Example: "iPhone 13", "iPhone 14", "iPhone 15" → All have "iPhon" prefix → 3rd rejected
- ✅ Use same normalization rules as duplicate check
- ✅ Note: This rule is intentionally simple for testing determinism; prevents name explosion while allowing variants

**Test Scenarios:**
- 2 items with same prefix → Allow (Pass)
- 3+ items with same prefix → Reject 3rd+ (409 Conflict)
- Different prefixes → Allow all (Pass)

---

### **3. Validation Execution Order** ✅
**Original Ambiguity:** When multiple validations fail, which error shows first?

**Resolution:**
- ✅ **Validation Sequence (Priority):**
  1. Authentication Check (401)
  2. Schema Validation (422)
  3. File Validation (415, 413)
  4. Business Rule Validation (400)
  5. Duplicate/Similar Check (409)

- ✅ **Return first validation failure** - Do NOT accumulate errors
- ✅ This ensures deterministic, predictable error responses for testing

**Example:**
- Invalid name (too short) + invalid price (negative) → Return **name error first** (422)
- Valid schema but business rule violation → Return **business rule error** (400)

---

### **4. Cross-Field Validation Dependencies** ✅
**Original Ambiguity:** How do conditional fields interact with item type validation?

**Resolution:**
- ✅ **Physical Items:** weight + dimensions (length, width, height) are REQUIRED
  - Missing weight → 422 error
  - Missing dimension → 422 error
  - Digital/Service fields must be null/empty

- ✅ **Digital Items:** download_url + file_size are REQUIRED
  - Missing download_url → 422 error
  - Missing file_size → 422 error
  - Physical/Service fields must be null/empty

- ✅ **Service Items:** duration_hours is REQUIRED
  - Missing duration_hours → 422 error
  - Physical/Digital fields must be null/empty

**Validation Order:** Schema validation (includes conditional fields) → Business rules

---

### **5. File Upload Behavior** ✅
**Original Ambiguity:** Is file upload required or optional? What if user selects but doesn't choose file?

**Resolution:**
- ✅ File upload is **OPTIONAL** (not required)
- ✅ If file is provided:
  - Check file type → 415 if invalid type
  - Check file size → 413 if > 5 MB
- ✅ If no file is provided → Form submission succeeds (no error)
- ✅ Minimum 1 KB rule is informational only (not validated)
- ✅ Storage: `uploads/{uuid}.{extension}`

**Scenarios:**
- No file selected → 201 Created (Success)
- Invalid file type → 415 Unsupported Media Type
- File > 5 MB → 413 Payload Too Large
- Valid file → 201 Created with file_path populated

---

### **6. Tags Uniqueness** ✅
**Original Ambiguity:** Is tags uniqueness case-sensitive? ("Electronics" vs "electronics")

**Resolution:**
- ✅ Tags uniqueness: **Case-insensitive comparison**
- ✅ Validation: "Electronics" = "electronics" = "ELECTRONICS" (same tag, reject duplicate)
- ✅ Store in database as-is (preserve original case if needed)
- ✅ Maximum 10 tags per item
- ✅ Each tag: 1-30 characters

**Example:**
- Tags: ["electronics", "COMPUTER", "Laptop"] → Valid (all unique case-insensitive)
- Tags: ["electronics", "Electronics"] → Invalid (duplicate when normalized)

---

## **PRD v1.1 - Key Additions**

1. **Validation Sequence Section:** Clear priority order for all validations
2. **Normalization Rules:** Explicit whitespace and case handling
3. **Conditional Fields Reference (New Section 12):** Item type specifications with null field requirements
4. **File Upload Clarification:** Optional nature clearly stated
5. **Cross-Field Validation:** Explicit requirements per item type

---

## **Implementation Checklist**

- [ ] Update duplicate check to use case-insensitive, whitespace-normalized comparison
- [ ] Update similar items check to use normalized name prefix
- [ ] Implement validation sequence in backend (return first error)
- [ ] Verify conditional field requirements match PRD (Physical/Digital/Service)
- [ ] Confirm file upload is optional in backend
- [ ] Implement tags uniqueness as case-insensitive
- [ ] Add comprehensive test cases for all clarified scenarios

---

## **Testing Readiness**

✅ All ambiguities resolved → Deterministic test cases possible  
✅ Validation sequence defined → Predictable error responses  
✅ Normalization rules clarified → Reproducible duplicate detection  
✅ Conditional fields specified → Clear requirement per item type  

**Ready to:**
- Update implementation to match clarified PRD
- Create comprehensive test cases
- Verify implementation against updated requirements

---

**Next Step:** Align implementation with clarified PRD, then test.

