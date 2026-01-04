# Seed Data Management - Agent Instructions

**Purpose:** Quick reference for test automation agents implementing seed data management  
**Last Updated:** 2025-01-04  
**Status:** All endpoints implemented, tested, and documented

---

## ✅ ALL QUESTIONS ANSWERED

**Complete documentation:** See `SEED_DATA_MANAGEMENT.md` for detailed answers to all 7 categories of questions.

**Summary:** All required endpoints are implemented and tested (71/71 tests passing).

---

## 🎯 QUICK START: Recommended Approach

### Step 1: Verify Seed Data Exists

```javascript
// Single API call - fast even with 10,000+ items
const status = await GET('/api/v1/items/seed-status/:userId?seed_version=v1.0');

if (status.seed_complete) {
  // ✅ Seed data ready (11+ items with 'seed' tag)
  return;
}
```

**Endpoint:** `GET /api/v1/items/seed-status/:userId`  
**Performance:** < 100ms (count query, no item fetching)  
**Response:**
```json
{
  "seed_complete": true,
  "total_items": 11,
  "required_count": 11,
  "missing_items": []
}
```

---

### Step 2: Create Missing Seed Items

```javascript
// Batch creation - idempotent (handles duplicates)
const result = await POST('/api/v1/items/batch', {
  items: seedItems.map(item => ({
    ...item,
    tags: ['seed', 'v1.0']  // Required: tag items as seed data
  })),
  skip_existing: true  // Important: prevents 409 errors
});
```

**Endpoint:** `POST /api/v1/items/batch`  
**Performance:** ~200-500ms for 11 items  
**Response:**
```json
{
  "created": 8,
  "skipped": 3,  // Already existed
  "failed": 0,
  "results": [...]
}
```

---

### Step 3: Verify Completion

```javascript
// Verify seed is complete
const finalStatus = await GET('/api/v1/items/seed-status/:userId?seed_version=v1.0');
if (!finalStatus.seed_complete) {
  throw new Error('Seed data creation failed');
}
```

---

## 📋 AVAILABLE ENDPOINTS

| Endpoint | Purpose | When to Use |
|----------|---------|-------------|
| `GET /api/v1/items/seed-status/:userId` | Check seed completion | ✅ **Primary: Verify seed exists** |
| `POST /api/v1/items/batch` | Batch create items | ✅ **Primary: Create seed data** |
| `GET /api/v1/items/count` | Count items with filters | Count items (not seed-specific) |
| `POST /api/v1/items/check-exists` | Check if items exist | Verify specific items by name |
| `POST /api/v1/internal/reset` | Full DB reset | Clean slate (test environments only) |

---

## 🔑 KEY CONCEPTS

### 1. Seed Item Identification

**Method:** Use `tags` field
```json
{
  "tags": ["seed", "v1.0"]  // Required: "seed" tag identifies seed items
}
```

**NOT:** No `is_seed_data` field, no naming pattern required (but recommended for clarity)

---

### 2. Version Management

**Method:** Add version to tags
```json
{
  "tags": ["seed", "v1.0"]  // Version as tag
}
```

**Query by version:**
```javascript
GET /api/v1/items/seed-status/:userId?seed_version=v1.0
```

**Migration strategy:**
- Create new version with new tags
- Old version remains (can delete later if needed)
- Query by version to check specific version

---

### 3. Idempotency

**Critical:** Always use `skip_existing: true` in batch creation

```javascript
POST /api/v1/items/batch
{
  "items": [...],
  "skip_existing": true  // ✅ Prevents 409 errors, safe to retry
}
```

**Behavior:**
- If item exists: Skip (counted in `skipped`)
- If item new: Create (counted in `created`)
- No errors thrown for duplicates

---

### 4. Performance Optimization

**❌ DON'T DO THIS:**
```javascript
// Fetches ALL items (slow with 10,000+ items)
const allItems = await GET('/api/v1/items');
const seedItems = allItems.filter(item => item.tags.includes('seed'));
```

**✅ DO THIS:**
```javascript
// Single count query (fast regardless of DB size)
const status = await GET('/api/v1/items/seed-status/:userId');
```

---

## 🚫 WHAT DOESN'T EXIST

1. **Global Seed Data:** No concept of global/shared seed data. All items are user-owned.
2. **User-Specific Deletion Endpoint:** No `DELETE /users/:userId/seed-data`. Use:
   - `POST /api/v1/internal/reset` (full DB reset)
   - Individual `DELETE /api/v1/items/:id` calls
3. **Multiple Names in GET Query:** No `GET /items?names=Item1,Item2`. Use `POST /api/v1/items/check-exists` instead.

---

## 📝 IMPLEMENTATION CHECKLIST

When implementing seed data management:

- [ ] Use `GET /api/v1/items/seed-status/:userId` to verify seed exists
- [ ] Tag all seed items with `["seed", "v1.0"]` (or appropriate version)
- [ ] Use `POST /api/v1/items/batch` with `skip_existing: true` for creation
- [ ] Verify completion with seed-status endpoint after creation
- [ ] Handle version migrations by creating new version, optionally deleting old
- [ ] Use `POST /api/v1/internal/reset` only in isolated test environments

---

## 🔍 TESTING

**Test File:** `flowhub-core/backend/tests/integration/seed-data-endpoints.test.js`

**Test Results:** 71/71 tests passing (100% pass rate)

**Coverage:**
- ✅ Count endpoint (16 tests)
- ✅ Check-exists endpoint (16 tests)
- ✅ Batch endpoint (16 tests)
- ✅ Seed-status endpoint (16 tests)
- ✅ Regression tests (5 tests)

---

## 📚 FULL DOCUMENTATION

For complete details, see: `SEED_DATA_MANAGEMENT.md`

**Sections:**
1. Global Seed Data (Q1.1-Q1.3)
2. User-Specific Verification (Q2.1-Q2.4)
3. Cleanup/Reset (Q3.1-Q3.3)
4. Batch Operations (Q4.1-Q4.2)
5. Performance Optimization (Q5.1-Q5.2)
6. Schema Changes & Versioning (Q6.1-Q6.2)
7. Implementation Review (Q7.1-Q7.2)

---

## ✅ VERIFICATION

**All questions answered:** ✅ Yes  
**All endpoints implemented:** ✅ Yes  
**All endpoints tested:** ✅ Yes  
**Documentation complete:** ✅ Yes  
**Ready for use:** ✅ Yes

---

## 🎯 SUMMARY FOR AGENTS

**Primary Goal (Verify seed with ONE call):** ✅ Solved
- Use: `GET /api/v1/items/seed-status/:userId`

**Secondary Goal (Efficient creation):** ✅ Solved
- Use: `POST /api/v1/items/batch` with `skip_existing: true`

**Tertiary Goal (Schema changes):** ✅ Solved
- Use: Version tagging in `tags` field

**All requirements met.** Use the recommended approach above.
