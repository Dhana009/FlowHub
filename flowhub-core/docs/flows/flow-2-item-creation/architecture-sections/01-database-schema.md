# **Database Schema - Flow 2: Item Creation**

**Version:** 1.0  
**Date:** December 17, 2024  
**Database:** MongoDB

---

## **1. Items Collection**

**Collection Name:** `items`

### **Schema Definition**

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated
  name: String,                     // Required, 3-100 chars, indexed with category
  description: String,              // Required, 10-500 chars
  item_type: String,                // Required, enum: PHYSICAL, DIGITAL, SERVICE
  price: Number,                    // Required, 0.01-999999.99
  category: String,                 // Required, 1-50 chars, indexed with name
  tags: [String],                   // Optional, max 10 items, each 1-30 chars
  
  // Conditional fields based on item_type:
  weight: Number,                   // Required if item_type = PHYSICAL, > 0, unit: kg
  dimensions: {                     // Required if item_type = PHYSICAL
    length: Number,                 // > 0, unit: cm
    width: Number,                  // > 0, unit: cm
    height: Number                  // > 0, unit: cm
  },
  download_url: String,            // Required if item_type = DIGITAL, valid URL
  file_size: Number,                // Required if item_type = DIGITAL, > 0, unit: bytes
  duration_hours: Number,           // Required if item_type = SERVICE, > 0, unit: hours
  
  // File metadata (optional):
  file_path: String,                // Path to uploaded file (e.g., "uploads/uuid.pdf")
  file_metadata: {                  // Optional, file details
    original_name: String,
    content_type: String,
    size: Number,
    uploaded_at: Date
  },
  
  // Metadata:
  created_by: ObjectId,             // Required, reference to users collection
  created_at: Date,                 // Auto-generated on creation
  updated_at: Date,                 // Auto-updated on modification
  is_active: Boolean                // Default: true
}
```

### **Validation Rules**

```javascript
{
  name: {
    required: true,
    type: String,
    minlength: 3,
    maxlength: 100,
    match: /^[a-zA-Z0-9\s\-_]+$/  // Alphanumeric + spaces, hyphens, underscores
  },
  description: {
    required: true,
    type: String,
    minlength: 10,
    maxlength: 500
  },
  item_type: {
    required: true,
    type: String,
    enum: ["PHYSICAL", "DIGITAL", "SERVICE"]
  },
  price: {
    required: true,
    type: Number,
    min: 0.01,
    max: 999999.99
  },
  category: {
    required: true,
    type: String,
    minlength: 1,
    maxlength: 50
  },
  tags: {
    required: false,
    type: Array,
    maxItems: 10,
    items: {
      type: String,
      minlength: 1,
      maxlength: 30
    }
  },
  // Conditional validations handled in application layer
  created_by: {
    required: true,
    type: ObjectId,
    ref: "users"
  }
}
```

### **Indexes**

```javascript
// Compound unique index for duplicate prevention (name + category)
db.items.createIndex(
  { name: 1, category: 1 }, 
  { unique: true, name: "idx_name_category_unique" }
);

// Compound index for filtering by category and item_type
db.items.createIndex(
  { category: 1, item_type: 1 },
  { name: "idx_category_item_type" }
);

// Index for filtering by creator
db.items.createIndex(
  { created_by: 1 },
  { name: "idx_created_by" }
);

// Index for tag search
db.items.createIndex(
  { tags: 1 },
  { name: "idx_tags" }
);

// Index for sorting by creation date
db.items.createIndex(
  { created_at: -1 },
  { name: "idx_created_at" }
);

// Index for active items filtering
db.items.createIndex(
  { is_active: 1, created_at: -1 },
  { name: "idx_active_created" }
);
```

### **Example Documents**

#### **Physical Item:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "Laptop Computer",
  description: "High-performance laptop for software development with 16GB RAM and 512GB SSD",
  item_type: "PHYSICAL",
  price: 1299.99,
  category: "Electronics",
  tags: ["laptop", "computer", "electronics", "development"],
  weight: 2.5,
  dimensions: {
    length: 35.5,
    width: 24.0,
    height: 2.0
  },
  file_path: "uploads/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
  file_metadata: {
    original_name: "laptop-specs.pdf",
    content_type: "application/pdf",
    size: 245760,
    uploaded_at: ISODate("2024-12-17T02:17:00Z")
  },
  created_by: ObjectId("507f1f77bcf86cd799439012"),
  created_at: ISODate("2024-12-17T02:17:00Z"),
  updated_at: ISODate("2024-12-17T02:17:00Z"),
  is_active: true
}
```

#### **Digital Item:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  name: "Software License",
  description: "Premium software license for professional use with lifetime updates",
  item_type: "DIGITAL",
  price: 299.99,
  category: "Software",
  tags: ["license", "software", "premium"],
  download_url: "https://example.com/download/software-v1.0.zip",
  file_size: 52428800,
  created_by: ObjectId("507f1f77bcf86cd799439012"),
  created_at: ISODate("2024-12-17T02:20:00Z"),
  updated_at: ISODate("2024-12-17T02:20:00Z"),
  is_active: true
}
```

#### **Service Item:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439014"),
  name: "Consulting Service",
  description: "Professional consulting service for software architecture and design",
  item_type: "SERVICE",
  price: 150.00,
  category: "Services",
  tags: ["consulting", "architecture", "design"],
  duration_hours: 8,
  created_by: ObjectId("507f1f77bcf86cd799439012"),
  created_at: ISODate("2024-12-17T02:25:00Z"),
  updated_at: ISODate("2024-12-17T02:25:00Z"),
  is_active: true
}
```

---

## **2. Data Integrity Rules**

### **2.1 Required Fields**
- All items must have: `name`, `description`, `item_type`, `price`, `category`, `created_by`, `created_at`, `updated_at`, `is_active`
- Conditional fields required based on `item_type`:
  - PHYSICAL: `weight`, `dimensions`
  - DIGITAL: `download_url`, `file_size`
  - SERVICE: `duration_hours`

### **2.2 Unique Constraints**
- Combination of `name` + `category` must be unique (enforced by compound unique index)

### **2.3 Referential Integrity**
- `created_by` must reference a valid user in `users` collection
- Application layer should validate this before insertion

### **2.4 Data Type Constraints**
- All numeric fields must be positive (where applicable)
- All string fields must meet length requirements
- `item_type` must be one of the enum values

---

## **3. Query Patterns**

### **3.1 Find Item by Name and Category (Duplicate Check)**
```javascript
db.items.findOne({
  name: "Laptop Computer",
  category: "Electronics"
});
```

### **3.2 Find Similar Items (Business Rule Check)**
```javascript
db.items.find({
  name: { $regex: "^Lapto", $options: "i" },
  category: "Electronics"
}).count();
```

### **3.3 Find Items by Creator**
```javascript
db.items.find({
  created_by: ObjectId("507f1f77bcf86cd799439012"),
  is_active: true
}).sort({ created_at: -1 });
```

### **3.4 Find Items by Category and Type**
```javascript
db.items.find({
  category: "Electronics",
  item_type: "PHYSICAL",
  is_active: true
});
```

---

## **4. Migration Considerations**

### **4.1 Initial Setup**
- Create collection if not exists
- Create all indexes
- Set default values for `is_active: true`

### **4.2 Future Enhancements**
- Add soft delete support (deleted_at field)
- Add versioning support (version field)
- Add audit trail (created_by, updated_by tracking)

---

**Next:** See `02-api-contract.md` for API specifications.

