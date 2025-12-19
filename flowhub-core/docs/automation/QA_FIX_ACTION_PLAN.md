# QA Framework Fix Action Plan
**Status:** Ready to Implement  
**Blocking Issues:** 0 (All backend endpoints confirmed working)  
**Framework Changes Required:** 3

---

## Summary

The backend API is **working correctly**. The automation framework needs **3 simple fixes** to align with the actual backend contract:

1. **Schema Fix:** `total_pages` (not `pages`)
2. **Endpoint Fix:** DELETE instead of PATCH deactivate  
3. **No Change:** Login response already wrapped correctly

---

## Fix #1: Update Pagination Schema

### File
`data/schemas/list_response.json` (or equivalent)

### Change
Replace:
```json
"pages": { "type": "integer" }
```

With:
```json
"total_pages": { "type": "integer" }
```

### Complete Schema (CORRECTED)
```json
{
  "type": "object",
  "required": ["status", "items", "pagination"],
  "properties": {
    "status": { "type": "string", "enum": ["success"] },
    "items": {
      "type": "array",
      "items": { "$ref": "#/definitions/item" }
    },
    "pagination": {
      "type": "object",
      "required": ["page", "limit", "total", "total_pages", "has_next", "has_prev"],
      "properties": {
        "page": { "type": "integer", "minimum": 1 },
        "limit": { "type": "integer", "minimum": 1, "maximum": 100 },
        "total": { "type": "integer", "minimum": 0 },
        "total_pages": { "type": "integer", "minimum": 0 },
        "has_next": { "type": "boolean" },
        "has_prev": { "type": "boolean" }
      }
    }
  }
}
```

---

## Fix #2: Update ItemService Methods

### Current Code (BROKEN)
```python
# File: ItemService.py (or equivalent)

def deactivate_item(self, item_id):
    """Deactivate/delete an item"""
    return self.api_client.patch(f"/items/{item_id}/deactivate")

def activate_item(self, item_id):
    """Activate/restore a deleted item"""
    return self.api_client.patch(f"/items/{item_id}/activate")
```

### Fixed Code
```python
# File: ItemService.py (or equivalent)

def deactivate_item(self, item_id):
    """Deactivate/delete an item (soft delete)"""
    # CHANGED: DELETE instead of PATCH to /deactivate
    return self.api_client.delete(f"/items/{item_id}")

def activate_item(self, item_id):
    """Activate/restore a deleted item"""
    # NO CHANGE: This endpoint exists and works
    return self.api_client.patch(f"/items/{item_id}/activate")
```

---

## Fix #3: Update Lifecycle Test

### Test File
`tests/test_item_lifecycle.py` (or equivalent)

### Current Test (FAILING)
```python
def test_item_lifecycle():
    # 1. Create
    response = service.create_item(item_data)
    item_id = response['data']['_id']
    assert response['status'] == 'success'
    
    # 2. Deactivate - FAILING ❌
    response = service.deactivate_item(item_id)
    # Error: 404 Not Found (endpoint doesn't exist)
    assert response['status'] == 'success'
    assert response['data']['is_active'] == False
    
    # 3. Activate - FAILING ❌ (can't run because deactivate failed)
    response = service.activate_item(item_id)
    assert response['status'] == 'success'
    assert response['data']['is_active'] == True
```

### Fixed Test
```python
def test_item_lifecycle():
    # 1. Create item
    response = service.create_item(item_data)
    assert response['status'] == 'success'
    item_id = response['data']['_id']
    assert response['data']['is_active'] == True
    assert response['data']['deleted_at'] is None
    
    # 2. Verify item is active in list
    list_response = service.list_items()
    assert list_response['status'] == 'success'
    # Validate pagination structure (FIXED SCHEMA)
    assert 'total_pages' in list_response['pagination']  # Changed from 'pages'
    assert 'has_next' in list_response['pagination']
    assert 'has_prev' in list_response['pagination']
    
    # 3. Deactivate item (FIXED: Now using DELETE)
    response = service.deactivate_item(item_id)
    assert response['status'] == 'success'
    assert response['data']['is_active'] == False
    assert response['data']['deleted_at'] is not None
    
    # 4. Verify item not in active list
    list_response = service.list_items()
    ids = [item['_id'] for item in list_response['items']]
    assert item_id not in ids, "Deleted item should not appear in list"
    
    # 5. Activate item (FIXED: Endpoint exists)
    response = service.activate_item(item_id)
    assert response['status'] == 'success'
    assert response['data']['is_active'] == True
    assert response['data']['deleted_at'] is None
    
    # 6. Verify item is back in active list
    list_response = service.list_items()
    ids = [item['_id'] for item in list_response['items']]
    assert item_id in ids, "Reactivated item should appear in list"
    
    print("✅ Item lifecycle test passed!")
```

---

## Fix #4: Login Response Schema (NO CHANGE NEEDED)

### Current Status
✅ **Already correct** - The backend returns:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "...",
    "user": { ... }
  }
}
```

### Validation Schema (USE AS-IS)
```json
{
  "type": "object",
  "required": ["status", "message", "data"],
  "properties": {
    "status": { "type": "string", "enum": ["success"] },
    "message": { "type": "string" },
    "data": {
      "type": "object",
      "required": ["token", "user"],
      "properties": {
        "token": { "type": "string" },
        "user": {
          "type": "object",
          "required": ["_id", "email", "username", "role"],
          "properties": {
            "_id": { "type": "string" },
            "email": { "type": "string" },
            "username": { "type": "string" },
            "role": { "enum": ["ADMIN", "EDITOR", "VIEWER"] }
          }
        }
      }
    }
  }
}
```

---

## Implementation Checklist

- [ ] **Step 1:** Update `list_response.json` schema (`pages` → `total_pages`)
- [ ] **Step 2:** Update ItemService.deactivate_item() (PATCH → DELETE)
- [ ] **Step 3:** Update lifecycle test to validate pagination and lifecycle
- [ ] **Step 4:** Run test suite: `pytest tests/test_item_lifecycle.py -v`
- [ ] **Step 5:** Verify all tests pass ✅
- [ ] **Step 6:** Update documentation with corrected endpoints

---

## Expected Test Results (After Fixes)

```
test_item_lifecycle.py::test_item_lifecycle PASSED          ✅
test_pagination.py::test_pagination_response PASSED         ✅
test_item_create.py::test_create_item PASSED               ✅
test_item_list.py::test_list_items PASSED                  ✅
test_item_activate.py::test_activate_deleted_item PASSED   ✅

===================== 5 passed in 2.34s =====================
```

---

## Backend Verification Commands

If you want to double-check the backend behavior before fixing the framework:

```bash
# 1. Test pagination response
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/v1/items?page=1&limit=10

# Look for: "total_pages" field (NOT "pages")

# 2. Test deactivate (DELETE method - NOT PATCH)
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/v1/items/507f1f77bcf86cd799439011

# Should return: 200 with is_active: false

# 3. Test activate
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/v1/items/507f1f77bcf86cd799439011/activate

# Should return: 200 with is_active: true
```

---

## Timeline

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Update pagination schema | 5 min | 🔵 Ready |
| 2 | Update ItemService methods | 5 min | 🔵 Ready |
| 3 | Update test cases | 10 min | 🔵 Ready |
| 4 | Run tests | 2 min | 🔵 Ready |
| 5 | Document fixes | 5 min | 🔵 Ready |
| **Total** | | **27 min** | ✅ |

---

## Support

If any fixes don't work:
1. Check backend is running: `curl http://localhost:5000/health`
2. Check token is valid: Look for `401 Unauthorized` errors
3. Check endpoint exists: See BACKEND_API_CONTRACT_VALIDATION.md



