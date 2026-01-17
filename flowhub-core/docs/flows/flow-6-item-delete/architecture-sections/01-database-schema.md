# **Database Schema - Flow 6: Item Delete**

**Version:** 1.0  
**Date:** December 17, 2024  
**Database:** MongoDB

---

## **1. Items Collection (Reused from Flow 2)**

**Collection Name:** `items`

**Note:** This flow uses the same collection as Flow 2 (Item Creation). See Flow 2 database schema for full document structure.

**Key Fields for Delete:**
- `_id` (ObjectId) - Primary identifier for lookup
- `status` (String) - Item status (active, inactive, pending, deleted)
- `deleted_at` (Date, optional) - Timestamp when item was deleted
- `updated_at` (Date) - Last update timestamp

---

## **2. Soft Delete Mechanism**

### **2.1 Status Field**

**Purpose:** Track item status, including deleted state.

**Values:**
- `"active"` - Item is active
- `"inactive"` - Item is inactive
- `"pending"` - Item is pending
- `"deleted"` - Item is deleted (soft delete)

---

### **2.2 Deleted At Timestamp**

**Purpose:** Record when item was deleted.

**Field:** `deleted_at` (Date, optional)

**Behavior:**
- Set to current timestamp when item is deleted
- Null/undefined for non-deleted items
- Used for audit trail and recovery

---

## **3. Update Operations**

### **3.1 Soft Delete Item**

**Purpose:** Change item status to "deleted" (soft delete).

**Query:**
```javascript
db.items.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  { 
    $set: { 
      status: "deleted",
      deleted_at: new Date(),
      updated_at: new Date()
    }
  }
);
```

**Result:**
- Item status changed to "deleted"
- `deleted_at` set to current timestamp
- `updated_at` updated to current timestamp
- Item remains in database (not physically deleted)

---

### **3.2 Check Item Status Before Delete**

**Purpose:** Prevent deleting already deleted items.

**Query:**
```javascript
// Check if item exists and is not already deleted
const item = await db.items.findOne({ 
  _id: ObjectId("507f1f77bcf86cd799439011") 
});

if (!item) {
  // Return 404 Not Found
}

if (item.status === "deleted") {
  // Return 409 Conflict - Already deleted
}
```

---

## **4. Error Scenarios**

### **4.1 Item Not Found**

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

### **4.2 Item Already Deleted**

**Scenario:** Item status is already "deleted".

**Query Result:**
```javascript
const item = await db.items.findOne({ 
  _id: ObjectId("507f1f77bcf86cd799439011") 
});

if (item.status === "deleted") {
  // Return 409 Conflict error
  // Error: "Item is already deleted"
}
```

**Handling:**
- Check item status before allowing deletion
- Return 409 Conflict error if already deleted

---

## **5. Performance Optimization**

### **5.1 Index Usage**

- `_id` index: Used for findOne and updateOne operations
- Fast lookup (O(1) with index)

### **5.2 Status Index (Optional)**

**Purpose:** Fast filtering of active items (for list view).

**Index:**
```javascript
db.items.createIndex({ status: 1 });
```

**Usage:**
- Filter active items: `db.items.find({ status: "active" })`
- Fast query with status index

---

## **6. Data Validation**

### **6.1 Item ID Validation**

**Before Query:**
```python
from bson import ObjectId

def is_valid_objectid(id_string):
    try:
        ObjectId(id_string)
        return True
    except:
        return False
```

**Usage:**
- Validate before querying database
- Return 400 if invalid format
- Prevents unnecessary database queries

---

### **6.2 Status Validation**

**Before Delete:**
```python
# Check if item exists
item = await db.items.find_one({ "_id": ObjectId(item_id) });

if not item:
    raise ItemNotFoundError(item_id)

# Check if already deleted
if item["status"] == "deleted":
    raise ItemAlreadyDeletedError(item_id)
```

**Usage:**
- Validate status before allowing deletion
- Return 409 if already deleted
- Prevents duplicate delete operations

---

**Next:** See `02-api-contract.md` for API specifications.

