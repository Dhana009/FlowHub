# **Database Schema - Flow 3: Item List**

**Version:** 1.0  
**Date:** December 17, 2024  
**Database:** MongoDB

---

## **1. Items Collection (Reused from Flow 2)**

**Collection Name:** `items`

**Note:** This flow uses the same collection as Flow 2 (Item Creation). See Flow 2 database schema for full document structure.

**Key Fields for List Operations:**
- `name` (String) - Searchable, sortable
- `description` (String) - Searchable
- `status` / `is_active` (Boolean/String) - Filterable, sortable
- `category` (String) - Filterable, sortable
- `price` (Number) - Sortable
- `created_at` (Date) - Sortable (default)
- `tags` (Array) - Searchable

---

## **2. Required Indexes**

### **2.1 Text Index (for Search)**

**Purpose:** Enable fast text search on name and description fields.

```javascript
// Create text index for search
db.items.createIndex(
  { name: "text", description: "text" },
  { name: "idx_text_search" }
);
```

**Usage:**
- Used when `search` query parameter is provided
- Case-insensitive search
- Searches both name and description fields

**Query Example:**
```javascript
db.items.find({ $text: { $search: "laptop" } });
```

**Alternative (if text index not used):**
```javascript
db.items.find({
  $or: [
    { name: { $regex: "laptop", $options: "i" } },
    { description: { $regex: "laptop", $options: "i" } }
  ]
});
```

---

### **2.2 Compound Index (Status + Created Date)**

**Purpose:** Optimize queries that filter by status and sort by created date.

```javascript
// Create compound index for status filter + created_at sort
db.items.createIndex(
  { is_active: 1, created_at: -1 },
  { name: "idx_status_created" }
);
```

**Usage:**
- Used when filtering by status and sorting by created date
- Supports both ascending and descending sort

**Query Example:**
```javascript
db.items.find({ is_active: true })
  .sort({ created_at: -1 });
```

---

### **2.3 Compound Index (Category + Price)**

**Purpose:** Optimize queries that filter by category and sort by price.

```javascript
// Create compound index for category filter + price sort
db.items.createIndex(
  { category: 1, price: -1 },
  { name: "idx_category_price" }
);
```

**Usage:**
- Used when filtering by category and sorting by price
- Supports price sorting (ascending/descending)

**Query Example:**
```javascript
db.items.find({ category: "Electronics" })
  .sort({ price: -1 });
```

---

### **2.4 Single Index (Created Date - Default Sort)**

**Purpose:** Optimize default sorting by created date.

```javascript
// Create index for default sort
db.items.createIndex(
  { created_at: -1 },
  { name: "idx_created_at" }
);
```

**Usage:**
- Used for default sort (newest first)
- Used when no sort specified

**Query Example:**
```javascript
db.items.find({})
  .sort({ created_at: -1 });
```

---

### **2.5 Single Index (Name - Alphabetical Sort)**

**Purpose:** Optimize sorting by name.

```javascript
// Create index for name sort
db.items.createIndex(
  { name: 1 },
  { name: "idx_name" }
);
```

**Usage:**
- Used when sorting by name (ascending/descending)

---

### **2.6 Single Index (Price - Numerical Sort)**

**Purpose:** Optimize sorting by price.

```javascript
// Create index for price sort
db.items.createIndex(
  { price: -1 },
  { name: "idx_price" }
);
```

**Usage:**
- Used when sorting by price (ascending/descending)

---

## **3. Query Patterns**

### **3.1 Search Query**

**Pattern:** Search in name and description fields.

```javascript
// With text index
db.items.find({ $text: { $search: "laptop" } });

// Without text index (regex)
db.items.find({
  $or: [
    { name: { $regex: "laptop", $options: "i" } },
    { description: { $regex: "laptop", $options: "i" } }
  ]
});
```

---

### **3.2 Filter Query**

**Pattern:** Filter by status and/or category.

```javascript
// Status filter
db.items.find({ is_active: true });

// Category filter
db.items.find({ category: "Electronics" });

// Combined filters
db.items.find({
  is_active: true,
  category: "Electronics"
});
```

---

### **3.3 Sort Query**

**Pattern:** Sort by one or multiple fields.

```javascript
// Single field sort
db.items.find({}).sort({ price: -1 });

// Multiple field sort
db.items.find({}).sort({ category: 1, price: -1, name: 1 });
```

---

### **3.4 Pagination Query**

**Pattern:** Skip and limit for pagination.

```javascript
// Page 1, 20 items per page
db.items.find({})
  .sort({ created_at: -1 })
  .skip(0)
  .limit(20);

// Page 2, 20 items per page
db.items.find({})
  .sort({ created_at: -1 })
  .skip(20)
  .limit(20);

// Page N, limit items per page
db.items.find({})
  .sort({ created_at: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
```

---

### **3.5 Combined Query (Search + Filter + Sort + Pagination)**

**Pattern:** All features combined.

```javascript
// Search + Filter + Sort + Pagination
db.items.find({
  // Search
  $or: [
    { name: { $regex: "laptop", $options: "i" } },
    { description: { $regex: "laptop", $options: "i" } }
  ],
  // Filters
  is_active: true,
  category: "Electronics"
})
.sort({ price: -1 })  // Sort
.skip(20)             // Pagination (page 2)
.limit(20);           // Items per page
```

---

## **4. Count Queries**

### **4.1 Total Count**

**Pattern:** Count total items matching filters.

```javascript
// Count with filters
db.items.countDocuments({
  is_active: true,
  category: "Electronics"
});

// Count with search
db.items.countDocuments({
  $or: [
    { name: { $regex: "laptop", $options: "i" } },
    { description: { $regex: "laptop", $options: "i" } }
  ]
});
```

---

## **5. Performance Optimization**

### **5.1 Index Usage**

**Best Practices:**
- Always use indexes for filter and sort operations
- Compound indexes should match query pattern
- Use `.explain()` to verify index usage

**Check Index Usage:**
```javascript
db.items.find({ is_active: true })
  .sort({ created_at: -1 })
  .explain("executionStats");
```

**Look for:**
- `IXSCAN` (index scan) - Good ✅
- `COLLSCAN` (collection scan) - Bad ❌

---

### **5.2 Query Optimization**

**Projection (Select Only Needed Fields):**
```javascript
// Only return required fields
db.items.find({}, {
  name: 1,
  description: 1,
  status: 1,
  category: 1,
  price: 1,
  created_at: 1
});
```

**Limit Results:**
```javascript
// Always use limit
db.items.find({}).limit(100);
```

---

### **5.3 Pagination Optimization**

**Skip/Limit (Offset Pagination):**
- Simple but slow for large offsets
- Use for small datasets or early pages

**Cursor-based Pagination (Alternative):**
```javascript
// More efficient for large datasets
// First page
db.items.find({}).sort({ _id: 1 }).limit(20);

// Next page (using last _id from previous page)
db.items.find({ _id: { $gt: lastId } })
  .sort({ _id: 1 })
  .limit(20);
```

**Note:** For Phase B, skip/limit is sufficient. Cursor-based can be added later if needed.

---

## **6. Index Maintenance**

### **6.1 Index Creation Script**

```javascript
// Run this script to create all required indexes
db.items.createIndex({ name: "text", description: "text" }, { name: "idx_text_search" });
db.items.createIndex({ is_active: 1, created_at: -1 }, { name: "idx_status_created" });
db.items.createIndex({ category: 1, price: -1 }, { name: "idx_category_price" });
db.items.createIndex({ created_at: -1 }, { name: "idx_created_at" });
db.items.createIndex({ name: 1 }, { name: "idx_name" });
db.items.createIndex({ price: -1 }, { name: "idx_price" });
```

### **6.2 Index Monitoring**

**Check Existing Indexes:**
```javascript
db.items.getIndexes();
```

**Drop Unused Indexes:**
```javascript
db.items.dropIndex("index_name");
```

---

**Next:** See `02-api-contract.md` for API specifications.

