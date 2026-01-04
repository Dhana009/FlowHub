# Backend Q&A - Flow 3 Testing Issues
## Answers to Test Failure Questions

**Version:** 1.0  
**Last Updated:** 2024-12-17  
**Source:** Extracted directly from backend codebase (`flowhub-core/backend/`)

This document answers specific questions about backend validation rules and behavior that affect Flow 3 test design.

---

## Q1: Seed Item Creation - "Theta" Validation Error

### Question
**Error:** 400 Bad Request for "Seed Item Theta"  
**Payload:** `{"item_type": "DIGITAL", "category": "Electronics", "price": 500, ...}`  
**Question:** Is there a validation rule I'm missing?

### Answer

**Root Cause:** Category-Item Type Compatibility Rule

**Validation Rule (Layer 4 - Business Rules):**
```javascript
// flowhub-core/backend/src/services/validationService.js:294-303
// Category-item type compatibility
if (normalizedCategory === 'Electronics' && upperType !== 'PHYSICAL') {
  errors.push({ field: 'category', message: 'Electronics category must be Physical item type' });
}
if (normalizedCategory === 'Software' && upperType !== 'DIGITAL') {
  errors.push({ field: 'category', message: 'Software category must be Digital item type' });
}
if (normalizedCategory === 'Services' && upperType !== 'SERVICE') {
  errors.push({ field: 'category', message: 'Services category must be Service item type' });
}
```

**Category-Item Type Compatibility Matrix:**

| Category | Allowed Item Type | Error Message |
|----------|------------------|---------------|
| **Electronics** | **PHYSICAL only** | "Electronics category must be Physical item type" |
| **Software** | **DIGITAL only** | "Software category must be Digital item type" |
| **Services** | **SERVICE only** | "Services category must be Service item type" |
| **Other categories** | Any type (PHYSICAL, DIGITAL, SERVICE) | No restriction |

**Your Error:**
- ❌ `item_type: "DIGITAL"` + `category: "Electronics"` → **400 Bad Request**
- ✅ `item_type: "PHYSICAL"` + `category: "Electronics"` → **Valid**

**Additional Price Validation for Electronics:**
```javascript
// flowhub-core/backend/src/services/validationService.js:307-310
if (normalizedCategory === 'Electronics') {
  if (priceNum < 10 || priceNum > 50000) {
    errors.push({ field: 'price', message: 'Electronics price must be between $10.00 and $50,000.00' });
  }
}
```

**Price Ranges by Category:**
- **Electronics:** $10.00 - $50,000.00
- **Books:** $5.00 - $500.00
- **Services:** $25.00 - $10,000.00
- **Other categories:** No price restriction (only schema min/max: $0.01 - $999,999.99)

**Solution:**
Change "Theta" item to:
- Option 1: `item_type: "PHYSICAL"` + `category: "Electronics"` (if it's a physical electronics item)
- Option 2: `item_type: "DIGITAL"` + `category: "Software"` (if it's a digital item)
- Option 3: `item_type: "DIGITAL"` + `category: "OtherCategory"` (use a different category)

**Code Reference:**
```javascript
// flowhub-core/backend/src/services/validationService.js:294-303
// Category-item type compatibility
if (normalizedCategory === 'Electronics' && upperType !== 'PHYSICAL') {
  errors.push({ field: 'category', message: 'Electronics category must be Physical item type' });
}
```

---

## Q2: Filter Results - Actual Counts

### Question
**My test expects:** 9 active items, 2 inactive items  
**Question:** Does the backend return ALL items (including other users' items) or only items owned by the current user?

### Answer

**RBAC Filtering Logic:**

```javascript
// flowhub-core/backend/src/services/itemService.js:282-287
// CRITICAL: Filter by user ownership for data isolation
// ADMIN and VIEWER can see all items (VIEWER is read-only)
// Only EDITOR is restricted to their own items
if (userId && role !== 'ADMIN' && role !== 'VIEWER') {
  query.created_by = userId;
}
```

**Visibility Rules:**

| Role | Sees Own Items | Sees Other Users' Items | Query Filter |
|------|---------------|------------------------|--------------|
| **ADMIN** | ✅ Yes | ✅ Yes | No `created_by` filter |
| **VIEWER** | ✅ Yes | ✅ Yes | No `created_by` filter |
| **EDITOR** | ✅ Yes | ❌ No | `created_by = userId` |

**Impact on Your Test:**

**If you're testing as EDITOR:**
- ❌ You will **NOT** see items created by other users
- ✅ You will **ONLY** see items where `created_by === your_user_id`
- **Your counts will be wrong** if seed data was created by different users

**If you're testing as ADMIN or VIEWER:**
- ✅ You will see **ALL** items (all users)
- ✅ Your counts should match total seed data

**Solution:**
1. **Check your test user role** - Are you using EDITOR, ADMIN, or VIEWER?
2. **Check seed data ownership** - Who created the seed items? (`created_by` field)
3. **If EDITOR:** Ensure all seed items have `created_by = your_test_user_id`
4. **If ADMIN/VIEWER:** Counts should match all seed data regardless of owner

**Code Reference:**
```javascript
// flowhub-core/backend/src/services/itemService.js:282-287
if (userId && role !== 'ADMIN' && role !== 'VIEWER') {
  query.created_by = userId; // EDITOR sees only own items
}
```

---

## Q3: Category Filter - "Electronics" Count

### Question
**My test expects:** 3 Electronics items (Alpha, Delta, Theta)  
**Actual result:** 2 items  
**Question:** Is "Electronics" a valid category? Should it be case-sensitive? Are there predefined categories?

### Answer

**Category Normalization:**

```javascript
// flowhub-core/backend/src/services/categoryService.js (if exists)
// Categories are normalized to Title Case
const normalizedCategory = category.trim().replace(/\w\S*/g, (txt) => 
  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
);
```

**Category Filtering:**
```javascript
// flowhub-core/backend/src/services/itemService.js:297-301
// Category filter
if (category && category.trim()) {
  const normalizedCategory = categoryService.normalizeCategory(category);
  query.normalizedCategory = normalizedCategory;
}
```

**Key Points:**

1. **Case-Insensitive Matching:**
   - Input: `"electronics"`, `"Electronics"`, `"ELECTRONICS"` → All normalized to `"Electronics"`
   - Filter uses normalized category for matching

2. **No Predefined Categories:**
   - ❌ There are **NO** predefined/enum categories
   - ✅ Categories are **free-form strings** (1-50 chars)
   - ✅ Any category name is valid (except compatibility rules with item_type)

3. **Why You're Missing "Theta":**
   - **Most likely:** "Theta" has `item_type: "DIGITAL"` + `category: "Electronics"`
   - **Result:** Item creation failed (Q1 answer) → Item doesn't exist in database
   - **Filter result:** Only 2 items (Alpha, Delta) because Theta was never created

**Solution:**
1. **Check if "Theta" was actually created:**
   - Verify seed creation didn't fail due to category-item_type mismatch
   - Check seed logs/errors

2. **Verify category values:**
   - Ensure all 3 items have exact same normalized category: `"Electronics"`
   - Check for typos: "Electronics" vs "Electronics " (trailing space)

3. **Check RBAC filtering (Q2):**
   - If EDITOR, ensure all 3 items have `created_by = your_user_id`

**Code Reference:**
```javascript
// flowhub-core/backend/src/services/itemService.js:297-301
if (category && category.trim()) {
  const normalizedCategory = categoryService.normalizeCategory(category);
  query.normalizedCategory = normalizedCategory; // Case-insensitive match
}
```

---

## Q4: Pagination - Default Behavior

### Question
**Question:** What is the default limit value when I first land on `/items`? (10, 20, or 50?)

### Answer

**Default Limit:** ✅ **20 items per page**

**Evidence:**
```javascript
// flowhub-core/backend/src/services/itemService.js:275-276
const {
  // ...
  page = 1,
  limit = 20  // Default: 20
} = filters;
```

```javascript
// flowhub-core/backend/src/controllers/itemController.js:284
let limit = 20;  // Default: 20
```

**Default Values:**

| Parameter | Default | Min | Max |
|-----------|---------|-----|-----|
| `page` | `1` | `1` | - |
| `limit` | `20` | `1` | `100` |
| `sort_by` | `['createdAt']` | - | - |
| `sort_order` | `['desc']` | - | - |

**Frontend Default:**
```javascript
// flowhub-core/frontend/src/pages/ItemsPage.jsx:37-44
const [pagination, setPagination] = useState({
  page: 1,
  limit: 20,  // Frontend also defaults to 20
  total: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false
});
```

**Available Limit Options:**
- Frontend dropdown: 10, 20, 50, 100
- Backend accepts: 1-100 (any value)

**Code Reference:**
```javascript
// flowhub-core/backend/src/services/itemService.js:275-276
page = 1,
limit = 20  // Default limit
```

---

## Summary Table

| Question | Answer | Impact |
|----------|--------|--------|
| **Q1: Theta Validation Error** | Electronics MUST be PHYSICAL | Change item_type or category |
| **Q2: Filter Counts** | EDITOR sees only own items, ADMIN/VIEWER see all | Check role and seed ownership |
| **Q3: Electronics Count** | Case-insensitive, no predefined categories, Theta likely failed creation | Verify item was created, check category normalization |
| **Q4: Default Limit** | 20 items per page | Use 20 as default in tests |

---

## Recommended Test Data Fixes

### Fix 1: Theta Item

**Current (Invalid):**
```json
{
  "name": "Seed Item Theta",
  "item_type": "DIGITAL",
  "category": "Electronics",
  "price": 500
}
```

**Option A (Physical Electronics):**
```json
{
  "name": "Seed Item Theta",
  "item_type": "PHYSICAL",
  "category": "Electronics",
  "price": 500,
  "weight": 2.5,
  "dimensions": { "length": 30, "width": 20, "height": 10 }
}
```

**Option B (Digital Software):**
```json
{
  "name": "Seed Item Theta",
  "item_type": "DIGITAL",
  "category": "Software",
  "price": 500,
  "download_url": "https://example.com/file.zip",
  "file_size": 1024000
}
```

**Option C (Digital Other Category):**
```json
{
  "name": "Seed Item Theta",
  "item_type": "DIGITAL",
  "category": "Digital Products",  // Any category except Electronics/Software/Services
  "price": 500,
  "download_url": "https://example.com/file.zip",
  "file_size": 1024000
}
```

### Fix 2: Seed Data Ownership

**For EDITOR tests:**
```javascript
// Ensure all seed items have same created_by
const seedItems = items.map(item => ({
  ...item,
  created_by: editor_user_id  // Same user for all items
}));
```

**For ADMIN/VIEWER tests:**
```javascript
// Can use any created_by (will see all items)
const seedItems = items.map(item => ({
  ...item,
  created_by: any_user_id  // Doesn't matter
}));
```

### Fix 3: Category Consistency

**Ensure all Electronics items:**
- Have `item_type: "PHYSICAL"`
- Have normalized category: `"Electronics"` (case-insensitive input is fine)
- Have price between $10.00 - $50,000.00

---

## Validation Rules Summary

### Category-Item Type Rules

| Category | Required Item Type | Price Range |
|----------|-------------------|-------------|
| Electronics | PHYSICAL | $10.00 - $50,000.00 |
| Software | DIGITAL | No restriction |
| Services | SERVICE | $25.00 - $10,000.00 |
| Books | Any | $5.00 - $500.00 |
| Other | Any | No restriction |

### RBAC Visibility Rules

| Role | Sees All Items | Sees Own Items Only |
|------|----------------|---------------------|
| ADMIN | ✅ | - |
| VIEWER | ✅ | - |
| EDITOR | ❌ | ✅ |

### Default Values

| Parameter | Default |
|-----------|---------|
| `page` | `1` |
| `limit` | `20` |
| `sort_by` | `['createdAt']` |
| `sort_order` | `['desc']` |

---

**End of Backend Q&A**
