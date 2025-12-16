# **Database Schema - Flow 4: Item Details**

**Version:** 1.0  
**Date:** December 17, 2024  
**Database:** MongoDB

---

## **1. Items Collection (Reused from Flow 2)**

**Collection Name:** `items`

**Note:** This flow uses the same collection as Flow 2 (Item Creation). See Flow 2 database schema for full document structure.

**Key Fields for Details View:**
- `_id` (ObjectId) - Primary identifier for lookup
- All item fields (name, description, status, category, price, etc.)
- Conditional fields (weight, dimensions, download_url, etc.)
- `embed_url` (String, optional) - URL for embedded iframe content

---

## **2. Query Pattern**

### **2.1 Get Item by ID**

**Purpose:** Retrieve single item by MongoDB ObjectId.

**Query:**
```javascript
db.items.findOne({ _id: ObjectId("507f1f77bcf86cd799439011") });
```

**Alternative (if using string ID):**
```javascript
db.items.findOne({ id: "507f1f77bcf86cd799439011" });
```

**Performance:**
- Uses `_id` index (automatic, unique)
- Very fast lookup (O(1) with index)
- No collection scan needed

---

## **3. Index Usage**

### **3.1 _id Index (Automatic)**

**Purpose:** Fast lookup by ObjectId.

**Index:**
```javascript
// Automatically created by MongoDB
db.items.getIndexes();
// Returns: [{ v: 2, key: { _id: 1 }, name: "_id_" }]
```

**Usage:**
- Used for all `findOne({ _id: ... })` queries
- No additional index needed for this flow

---

## **4. Query Examples**

### **4.1 Get Item by Valid ObjectId**

```javascript
// Valid ObjectId
const itemId = "507f1f77bcf86cd799439011";
const item = await db.items.findOne({ _id: ObjectId(itemId) });

// Result: Item document or null
```

### **4.2 Handle Invalid ObjectId**

```javascript
// Invalid ObjectId format
const itemId = "invalid-id";

try {
  const item = await db.items.findOne({ _id: ObjectId(itemId) });
} catch (error) {
  // Handle invalid ObjectId format
  // Return 422 Unprocessable Entity
}
```

### **4.3 Get Item with Projection (Select Fields)**

```javascript
// Only return required fields (optional optimization)
const item = await db.items.findOne(
  { _id: ObjectId(itemId) },
  {
    projection: {
      name: 1,
      description: 1,
      status: 1,
      category: 1,
      price: 1,
      tags: 1,
      embed_url: 1,
      created_at: 1,
      updated_at: 1
      // Include conditional fields based on item_type
    }
  }
);
```

---

## **5. Error Scenarios**

### **5.1 Item Not Found**

**Scenario:** Item ID doesn't exist in database.

**Query Result:**
```javascript
const item = await db.items.findOne({ _id: ObjectId("507f1f77bcf86cd799439099") });
// Returns: null
```

**Handling:**
- Check if result is null
- Return 404 Not Found error

---

### **5.2 Invalid ObjectId Format**

**Scenario:** Item ID is not valid ObjectId format.

**Query Attempt:**
```javascript
try {
  const item = await db.items.findOne({ _id: ObjectId("invalid") });
} catch (error) {
  // Error: Invalid ObjectId format
  // Return 422 Unprocessable Entity
}
```

**Handling:**
- Validate ObjectId format before querying
- Return 422 if invalid format

---

## **6. Performance Optimization**

### **6.1 Index Usage**

- `_id` index is automatic and always used
- No additional indexes needed for this flow
- Query is always fast (O(1) with index)

### **6.2 Query Optimization**

**Projection (Optional):**
- Only return needed fields to reduce data transfer
- Useful if item documents are very large

**Example:**
```javascript
// Return only essential fields
db.items.findOne(
  { _id: ObjectId(itemId) },
  { projection: { name: 1, description: 1, price: 1, embed_url: 1 } }
);
```

---

## **7. Data Validation**

### **7.1 ObjectId Validation**

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
- Return 422 if invalid format
- Prevents unnecessary database queries

---

**Next:** See `02-api-contract.md` for API specifications.

