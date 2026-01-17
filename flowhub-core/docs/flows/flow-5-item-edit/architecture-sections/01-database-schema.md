# **Database Schema - Flow 5: Item Edit**

**Version:** 1.0  
**Date:** December 17, 2024  
**Database:** MongoDB

---

## **1. Items Collection (Reused from Flow 2)**

**Collection Name:** `items`

**Note:** This flow uses the same collection as Flow 2 (Item Creation). See Flow 2 database schema for full document structure.

**Key Fields for Edit:**
- `_id` (ObjectId) - Primary identifier for lookup
- `version` (Integer) - Version number for optimistic locking
- `status` (String) - Item status (active, inactive, deleted)
- All item fields (name, description, category, price, etc.)
- `updated_at` (Date) - Last update timestamp
- `updated_by` (ObjectId) - User who last updated the item

---

## **2. Version Field**

### **2.1 Version Purpose**

**Purpose:** Optimistic locking to prevent concurrent edit conflicts.

**Behavior:**
- Each item has a `version` field (integer, starts at 1)
- Version increments on each update
- Update query includes version check
- If version mismatch → 409 Conflict error

---

### **2.2 Version Schema**

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "Laptop Computer",
  "version": 1,  // Current version
  "created_at": ISODate("2024-12-17T02:17:00Z"),
  "updated_at": ISODate("2024-12-17T02:17:00Z"),
  "updated_by": ObjectId("507f1f77bcf86cd799439012")
}
```

---

## **3. Update Operations**

### **3.1 Update Item by ID (with Version Check)**

**Purpose:** Update item document with optimistic locking.

**Query:**
```javascript
db.items.findOneAndUpdate(
  { 
    _id: ObjectId("507f1f77bcf86cd799439011"),
    version: 1  // Expected version (from request)
  },
  { 
    $set: { 
      name: "Updated Laptop Computer",
      description: "Updated description",
      price: 1399.99,
      version: 2,  // Increment version
      updated_at: new Date(),
      updated_by: ObjectId("507f1f77bcf86cd799439012")
    }
  },
  { 
    returnDocument: "after"  // Return updated document
  }
);
```

**Result:**
- If version matches: Update succeeds, return updated document
- If version mismatch: Update fails (no document matched), return null

---

### **3.2 Update Item (without Version Check - Not Recommended)**

**Purpose:** Update item without version check (for admin operations only).

**Query:**
```javascript
db.items.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  { 
    $set: { 
      name: "Updated Name",
      version: 2,
      updated_at: new Date(),
      updated_by: ObjectId("507f1f77bcf86cd799439012")
    }
  }
);
```

**Note:** This bypasses optimistic locking. Use only for admin operations.

---

## **4. State-Based Validation**

### **4.1 Check Item Status Before Update**

**Purpose:** Prevent editing deleted items.

**Query:**
```javascript
// Check if item is deleted
const item = await db.items.findOne({ 
  _id: ObjectId("507f1f77bcf86cd799439011") 
});

if (item.status === "deleted") {
  // Return 409 Conflict error
  // Error: "Cannot edit deleted item"
}
```

---

## **5. Error Scenarios**

### **5.1 Version Mismatch**

**Scenario:** Item was updated by another user (version changed).

**Query Result:**
```javascript
const result = await db.items.findOneAndUpdate(
  { 
    _id: ObjectId("507f1f77bcf86cd799439011"),
    version: 1  // Expected version
  },
  { $set: { ... } }
);

// Returns: null (no document matched)
```

**Handling:**
- Check if result is null
- Return 409 Conflict error
- Error: "Version mismatch. Expected: 2, Provided: 1"

---

### **5.2 Item Not Found**

**Scenario:** Item ID doesn't exist in database.

**Query Result:**
```javascript
const item = await db.items.findOne({ 
  _id: ObjectId("507f1f77bcf86cd799439099") 
});
// Returns: null
```

**Handling:**
- Check if result is null
- Return 404 Not Found error

---

### **5.3 Item Deleted**

**Scenario:** Item status is "deleted".

**Query Result:**
```javascript
const item = await db.items.findOne({ 
  _id: ObjectId("507f1f77bcf86cd799439011") 
});

if (item.status === "deleted") {
  // Return 409 Conflict error
  // Error: "Cannot edit deleted item"
}
```

**Handling:**
- Check item status before update
- Return 409 Conflict error if deleted

---

## **6. Performance Optimization**

### **6.1 Index Usage**

- `_id` index: Used for findOne and updateOne operations
- Fast lookup (O(1) with index)

### **6.2 Update Optimization**

**findOneAndUpdate vs updateOne:**
- `findOneAndUpdate`: Returns updated document (better for response)
- `updateOne`: Returns update result only (faster, but need separate query for response)

**Recommendation:** Use `findOneAndUpdate` for edit flow (need updated document in response).

---

## **7. Data Validation**

### **7.1 Version Validation**

**Before Update:**
```python
from bson import ObjectId

# Check if version matches
existing_item = await db.items.find_one({ 
    "_id": ObjectId(item_id) 
});

if existing_item["version"] != update_data["version"]:
    raise VersionMismatchError(
        expected=existing_item["version"],
        provided=update_data["version"]
    )
```

**Usage:**
- Validate version before update
- Return 409 if version mismatch
- Prevents concurrent edit conflicts

---

**Next:** See `02-api-contract.md` for API specifications.

