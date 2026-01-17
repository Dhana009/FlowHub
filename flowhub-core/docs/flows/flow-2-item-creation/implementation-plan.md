# Flow 2 - Item Creation: Implementation Plan

**Version:** 1.0  
**Date:** December 17, 2024  
**Status:** Ready for Implementation  
**Based on PRD:** v1.4 (All Ambiguities Resolved)

---

## 1. Architecture Overview

### System Components & Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  ItemForm       │  FileUpload     │  ValidationDisplay          │
│  Component      │  Component      │  Component                  │
└─────────────────┴─────────────────┴─────────────────────────────┘
                              │
                              ▼ HTTP POST /api/items
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express)                          │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐ │
│ │ Auth Middleware │ │ Route Handler   │ │ File Upload         │ │
│ │                 │ │                 │ │ Middleware          │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    VALIDATION LAYERS                            │
├─────────────────────────────────────────────────────────────────┤
│ Layer 1: Auth    → Layer 2: Schema   → Layer 3: File           │
│         ▼                   ▼                   ▼               │
│ Layer 4: Business Rules    → Layer 5: Duplicate Check          │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐ │
│ │ Item Service    │ │ File Service     │ │ Category Service     │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                         │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐ │
│ │ items           │ │ files           │ │ normalized fields    │ │
│ │ Collection      │ │ Collection      │ │ (indexed)            │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Structure

```
┌─────────────────────────────────────────┐
│ Layer 1: Authentication                 │ ← JWT validation (Flow 1)
├─────────────────────────────────────────┤
│ Layer 2: Schema Validation              │ ← Joi/Yup validation
├─────────────────────────────────────────┤
│ Layer 3: File Validation                │ ← Size, MIME, structure
├─────────────────────────────────────────┤
│ Layer 4: Business Rules                 │ ← Type-specific rules
├─────────────────────────────────────────┤
│ Layer 5: Duplicate Detection            │ ← Adaptive matching
└─────────────────────────────────────────┘
```

---

## 2. Phase Breakdown

### Phase 2.1: Foundation & Database (Days 1-2)
**Goal:** Set up database schema, models, and indexes

**Tasks:**
- [ ] Design MongoDB schemas with normalized fields
- [ ] Create Mongoose models (Item, File)
- [ ] Setup database indexes (unique constraints, performance indexes)
- [ ] Create base repository pattern
- [ ] Setup database transactions support
- [ ] Create migration scripts

**Deliverables:**
- `models/Item.js` - Item model with all fields
- `models/File.js` - File model for uploads
- Database indexes configured
- Transaction support ready

### Phase 2.2: Core Backend Services (Days 3-4)
**Goal:** Implement validation layers and business logic

**Tasks:**
- [ ] Implement 5-layer validation service
- [ ] Create ItemService class
- [ ] Build CategoryService (normalization)
- [ ] Implement FileService (two-phase commit)
- [ ] Error handling framework
- [ ] Adaptive prefix matching algorithm

**Deliverables:**
- `services/validationService.js` - All 5 validation layers
- `services/itemService.js` - Item business logic
- `services/categoryService.js` - Category normalization
- `services/fileService.js` - File upload with rollback

### Phase 2.3: API Layer (Days 5-6)
**Goal:** Create API endpoints and middleware

**Tasks:**
- [ ] Create item routes (`POST /api/items`)
- [ ] File upload middleware (multer integration)
- [ ] Request validation middleware
- [ ] Response formatting
- [ ] API documentation
- [ ] Integration with Flow 1 auth

**Deliverables:**
- `routes/itemRoutes.js` - Item creation endpoint
- `middleware/upload.js` - File upload handling
- `controllers/itemController.js` - Request handling
- API documentation updated

### Phase 2.4: Frontend Components (Days 7-8)
**Goal:** Build React components for item creation

**Tasks:**
- [ ] ItemForm component with conditional fields
- [ ] FileUpload component with progress
- [ ] ValidationDisplay component
- [ ] Type-specific field components (Physical/Digital/Service)
- [ ] State management setup
- [ ] Form integration and submission

**Deliverables:**
- `components/items/ItemForm/ItemForm.jsx`
- `components/items/FileUpload/FileUpload.jsx`
- `components/items/TypeSpecificFields/` (Physical/Digital/Service)
- `hooks/useItemForm.js` - Form state management
- `services/itemService.js` - Frontend API client

### Phase 2.5: Integration & Testing (Days 9-10)
**Goal:** Complete integration and comprehensive testing

**Tasks:**
- [ ] Unit tests (backend services)
- [ ] Integration tests (API endpoints)
- [ ] E2E tests (full user flow)
- [ ] Performance testing
- [ ] Error scenario testing
- [ ] Documentation completion

**Deliverables:**
- Complete test suite (unit, integration, E2E)
- Test coverage > 80%
- Performance benchmarks
- Updated documentation

---

## 3. Task Decomposition

### Phase 2.1: Foundation & Database (16 hours)

| Task | Estimate | Dependencies | Priority |
|------|----------|--------------|----------|
| Design MongoDB schemas | 2h | - | P0 |
| Create Mongoose models | 3h | Schema design | P0 |
| Setup database indexes | 2h | Models | P0 |
| Create base repository pattern | 4h | Models | P1 |
| Setup database transactions | 3h | Repository | P0 |
| Create migration scripts | 2h | All above | P1 |

**Key Requirements:**
- Items collection with normalized fields (`normalizedName`, `normalizedCategory`, `normalizedNamePrefix`)
- Files collection for upload tracking
- Unique compound index: `{normalizedName: 1, normalizedCategory: 1}`
- Transaction support for atomic operations

### Phase 2.2: Core Backend Services (16 hours)

| Task | Estimate | Dependencies | Priority |
|------|----------|--------------|----------|
| Implement validation layers | 6h | Models | P0 |
| Create ItemService class | 4h | Validation | P0 |
| Build CategoryService | 2h | Models | P0 |
| Implement FileService | 3h | Models | P0 |
| Error handling framework | 1h | Services | P0 |

**Key Requirements:**
- 5-layer sequential validation (stop at first failure)
- Adaptive prefix matching for names <5 characters
- Category normalization (Title Case)
- Two-phase commit for file uploads

### Phase 2.3: API Layer (16 hours)

| Task | Estimate | Dependencies | Priority |
|------|----------|--------------|----------|
| Create item routes | 3h | Services | P0 |
| File upload middleware | 4h | FileService | P0 |
| Request validation middleware | 2h | Validation layers | P0 |
| Response formatting | 2h | Routes | P0 |
| API documentation | 3h | All endpoints | P1 |
| Integration with auth | 2h | Flow 1 | P0 |

**Key Requirements:**
- `POST /api/items` endpoint
- Multipart form-data support
- Error response format matching PRD
- Integration with Flow 1 authentication

### Phase 2.4: Frontend Components (16 hours)

| Task | Estimate | Dependencies | Priority |
|------|----------|--------------|----------|
| ItemForm component | 6h | API | P0 |
| FileUpload component | 4h | API | P0 |
| Validation display | 2h | ItemForm | P0 |
| State management setup | 2h | Components | P0 |
| Form integration | 2h | All components | P0 |

**Key Requirements:**
- Dynamic conditional fields based on item type
- Real-time validation feedback
- File upload with progress indication
- Error message display

### Phase 2.5: Integration & Testing (16 hours)

| Task | Estimate | Dependencies | Priority |
|------|----------|--------------|----------|
| Unit tests (backend) | 6h | Backend complete | P0 |
| Integration tests | 4h | API complete | P0 |
| E2E tests | 4h | Frontend complete | P0 |
| Performance testing | 2h | Integration complete | P1 |

**Key Requirements:**
- Test all 5 validation layers
- Test adaptive prefix matching
- Test file upload rollback
- Test concurrent request handling
- Test error precedence

---

## 4. Database Schema

### Items Collection

```javascript
// models/Item.js
const itemSchema = new mongoose.Schema({
  // Core fields
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  normalizedName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  normalizedNamePrefix: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  item_type: {
    type: String,
    required: true,
    enum: ['PHYSICAL', 'DIGITAL', 'SERVICE'],
    uppercase: true
  },
  price: {
    type: Number,
    required: true,
    min: 0.01,
    max: 999999.99
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  normalizedCategory: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  
  // Conditional fields (based on item_type)
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  download_url: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      }
    }
  },
  file_size: {
    type: Number,
    min: 0
  },
  duration_hours: {
    type: Number,
    min: 0
  },
  
  // Optional file attachment
  file_path: {
    type: String
  },
  
  // Metadata
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
itemSchema.index({ 
  normalizedName: 1, 
  normalizedCategory: 1 
}, { 
  unique: true,
  name: 'unique_item_name_category'
});

itemSchema.index({ normalizedCategory: 1, item_type: 1 });
itemSchema.index({ created_by: 1 });
itemSchema.index({ tags: 1 });
itemSchema.index({ normalizedNamePrefix: 1, normalizedCategory: 1 });

// Pre-save hook to generate normalized fields
itemSchema.pre('save', function(next) {
  // Normalize name
  this.normalizedName = this.name.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Generate adaptive prefix
  const nameLength = this.normalizedName.length;
  if (nameLength === 0) {
    this.normalizedNamePrefix = '';
  } else if (nameLength <= 2) {
    this.normalizedNamePrefix = this.normalizedName;
  } else if (nameLength <= 4) {
    this.normalizedNamePrefix = this.normalizedName.substring(0, nameLength - 1);
  } else {
    this.normalizedNamePrefix = this.normalizedName.substring(0, 5);
  }
  
  // Normalize category to Title Case
  this.normalizedCategory = this.category.trim().replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
  
  next();
});

module.exports = mongoose.model('Item', itemSchema);
```

---

## 5. API Design

### POST /api/items

**Request Format:**
```javascript
// Content-Type: multipart/form-data
{
  // Core fields
  "name": "string (required, 3-100 chars)",
  "description": "string (required, 10-500 chars)",
  "item_type": "PHYSICAL|DIGITAL|SERVICE (required)",
  "category": "string (required, 1-50 chars)",
  "price": "number (required, 0.01-999999.99)",
  "tags": "array (optional, max 10, each 1-30 chars)",
  
  // Conditional fields based on item_type
  // PHYSICAL:
  "weight": "number (required if PHYSICAL, > 0)",
  "dimensions": {
    "length": "number (required if PHYSICAL, > 0)",
    "width": "number (required if PHYSICAL, > 0)",
    "height": "number (required if PHYSICAL, > 0)"
  },
  
  // DIGITAL:
  "download_url": "string (required if DIGITAL, valid URL)",
  "file_size": "number (required if DIGITAL, > 0)",
  
  // SERVICE:
  "duration_hours": "number (required if SERVICE, integer > 0)",
  
  // Optional file
  "file": "File (optional, max 5MB, allowed types: .jpg, .jpeg, .png, .pdf, .doc, .docx)"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Item created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Laptop Computer",
    "description": "High-performance laptop for development",
    "item_type": "PHYSICAL",
    "price": 1299.99,
    "category": "Electronics",
    "tags": ["laptop", "computer", "electronics"],
    "weight": 2.5,
    "dimensions": {
      "length": 35.5,
      "width": 24.0,
      "height": 2.0
    },
    "file_path": "uploads/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
    "created_by": "507f1f77bcf86cd799439012",
    "created_at": "2024-12-17T02:17:00Z",
    "updated_at": "2024-12-17T02:17:00Z",
    "is_active": true
  },
  "item_id": "507f1f77bcf86cd799439011"
}
```

**Error Response Format:**
```json
{
  "status": "error",
  "error_code": 422,
  "error_type": "Unprocessable Entity - Schema validation failed",
  "message": "Name must be between 3 and 100 characters",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items"
}
```

---

## 6. Validation Implementation Strategy

### Layer 1: Authentication (Already Implemented in Flow 1)
- Uses JWT middleware from Flow 1
- Returns 401 if token missing/invalid

### Layer 2: Schema Validation

```javascript
// services/validationService.js - Schema Validation
static validateSchema(data) {
  const errors = [];
  
  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push({ field: 'name', message: 'Name is required' });
  } else {
    const trimmed = data.name.trim();
    if (trimmed.length < 3 || trimmed.length > 100) {
      errors.push({ field: 'name', message: 'Name must be between 3 and 100 characters' });
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
      errors.push({ field: 'name', message: 'Name contains invalid characters' });
    }
  }
  
  // Description validation
  if (!data.description || typeof data.description !== 'string') {
    errors.push({ field: 'description', message: 'Description is required' });
  } else {
    const trimmed = data.description.trim();
    if (trimmed.length < 10 || trimmed.length > 500) {
      errors.push({ field: 'description', message: 'Description must be between 10 and 500 characters' });
    }
  }
  
  // Item type validation
  if (!data.item_type || !['PHYSICAL', 'DIGITAL', 'SERVICE'].includes(data.item_type.toUpperCase())) {
    errors.push({ field: 'item_type', message: 'Item type must be PHYSICAL, DIGITAL, or SERVICE' });
  }
  
  // Price validation
  if (data.price === undefined || data.price === null) {
    errors.push({ field: 'price', message: 'Price is required' });
  } else {
    const price = parseFloat(data.price);
    if (isNaN(price) || price < 0.01 || price > 999999.99) {
      errors.push({ field: 'price', message: 'Price must be between 0.01 and 999999.99' });
    }
    if (price.toFixed(2) !== price.toFixed(2)) {
      errors.push({ field: 'price', message: 'Price must have at most 2 decimal places' });
    }
  }
  
  // Category validation
  if (!data.category || typeof data.category !== 'string') {
    errors.push({ field: 'category', message: 'Category is required' });
  } else {
    const trimmed = data.category.trim();
    if (trimmed.length < 1 || trimmed.length > 50) {
      errors.push({ field: 'category', message: 'Category must be between 1 and 50 characters' });
    }
  }
  
  // Tags validation
  if (data.tags) {
    if (!Array.isArray(data.tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array' });
    } else {
      if (data.tags.length > 10) {
        errors.push({ field: 'tags', message: 'Maximum 10 tags allowed' });
      }
      const normalizedTags = data.tags.map(t => t.toLowerCase().trim());
      const uniqueTags = new Set(normalizedTags);
      if (normalizedTags.length !== uniqueTags.size) {
        errors.push({ field: 'tags', message: 'Tags must be unique (case-insensitive)' });
      }
      data.tags.forEach((tag, index) => {
        if (typeof tag !== 'string' || tag.trim().length < 1 || tag.trim().length > 30) {
          errors.push({ field: `tags[${index}]`, message: 'Each tag must be between 1 and 30 characters' });
        }
      });
    }
  }
  
  // Conditional field validation (presence check)
  const itemType = data.item_type?.toUpperCase();
  if (itemType === 'PHYSICAL') {
    if (!data.weight || data.weight <= 0) {
      errors.push({ field: 'weight', message: 'Weight is required for physical items' });
    }
    if (!data.dimensions || !data.dimensions.length || !data.dimensions.width || !data.dimensions.height) {
      errors.push({ field: 'dimensions', message: 'Dimensions are required for physical items' });
    }
    // Check that non-applicable fields are not provided
    if (data.download_url || data.file_size || data.duration_hours) {
      errors.push({ field: 'item_type', message: 'These fields are not allowed for physical items' });
    }
  } else if (itemType === 'DIGITAL') {
    if (!data.download_url || typeof data.download_url !== 'string') {
      errors.push({ field: 'download_url', message: 'Download URL is required for digital items' });
    } else if (!/^https?:\/\/.+/.test(data.download_url)) {
      errors.push({ field: 'download_url', message: 'Download URL must be valid HTTP/HTTPS URL' });
    }
    if (!data.file_size || data.file_size <= 0) {
      errors.push({ field: 'file_size', message: 'File size is required for digital items' });
    }
    // Check that non-applicable fields are not provided
    if (data.weight || data.dimensions || data.duration_hours) {
      errors.push({ field: 'item_type', message: 'These fields are not allowed for digital items' });
    }
  } else if (itemType === 'SERVICE') {
    if (!data.duration_hours || !Number.isInteger(parseInt(data.duration_hours)) || data.duration_hours <= 0) {
      errors.push({ field: 'duration_hours', message: 'Duration hours is required for service items' });
    }
    // Check that non-applicable fields are not provided
    if (data.weight || data.dimensions || data.download_url || data.file_size) {
      errors.push({ field: 'item_type', message: 'These fields are not allowed for service items' });
    }
  }
  
  return errors.length > 0 ? { layer: 2, errors } : null;
}
```

### Layer 3: File Validation

```javascript
// services/validationService.js - File Validation
static validateFile(file) {
  if (!file) return null; // File is optional
  
  const errors = [];
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  // File size validation (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    errors.push({ field: 'file', message: 'File size exceeds 5 MB limit' });
  }
  
  // MIME type validation
  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push({ field: 'file', message: 'File type not allowed. Allowed types: .jpg, .jpeg, .png, .pdf, .doc, .docx' });
  }
  
  return errors.length > 0 ? { layer: 3, errors } : null;
}
```

### Layer 4: Business Rules Validation

```javascript
// services/validationService.js - Business Rules
static validateBusinessRules(data) {
  const errors = [];
  const normalizedCategory = data.category.trim().replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
  const itemType = data.item_type?.toUpperCase();
  
  // Category-item type compatibility
  if (normalizedCategory === 'Electronics' && itemType !== 'PHYSICAL') {
    errors.push({ field: 'category', message: 'Electronics category must be Physical item type' });
  }
  if (normalizedCategory === 'Software' && itemType !== 'DIGITAL') {
    errors.push({ field: 'category', message: 'Software category must be Digital item type' });
  }
  if (normalizedCategory === 'Services' && itemType !== 'SERVICE') {
    errors.push({ field: 'category', message: 'Services category must be Service item type' });
  }
  
  // Price range validation by category
  const price = parseFloat(data.price);
  if (normalizedCategory === 'Electronics') {
    if (price < 10 || price > 50000) {
      errors.push({ field: 'price', message: 'Electronics price must be between $10.00 and $50,000.00' });
    }
  } else if (normalizedCategory === 'Books') {
    if (price < 5 || price > 500) {
      errors.push({ field: 'price', message: 'Books price must be between $5.00 and $500.00' });
    }
  } else if (normalizedCategory === 'Services') {
    if (price < 25 || price > 10000) {
      errors.push({ field: 'price', message: 'Services price must be between $25.00 and $10,000.00' });
    }
  }
  
  // Conditional field value validation
  if (itemType === 'PHYSICAL') {
    if (data.weight && data.weight <= 0) {
      errors.push({ field: 'weight', message: 'Weight must be greater than 0' });
    }
    if (data.dimensions) {
      if (data.dimensions.length && data.dimensions.length <= 0) {
        errors.push({ field: 'dimensions.length', message: 'Length must be greater than 0' });
      }
      if (data.dimensions.width && data.dimensions.width <= 0) {
        errors.push({ field: 'dimensions.width', message: 'Width must be greater than 0' });
      }
      if (data.dimensions.height && data.dimensions.height <= 0) {
        errors.push({ field: 'dimensions.height', message: 'Height must be greater than 0' });
      }
    }
  } else if (itemType === 'DIGITAL') {
    if (data.file_size && data.file_size <= 0) {
      errors.push({ field: 'file_size', message: 'File size must be greater than 0' });
    }
  } else if (itemType === 'SERVICE') {
    if (data.duration_hours && (!Number.isInteger(parseInt(data.duration_hours)) || data.duration_hours <= 0)) {
      errors.push({ field: 'duration_hours', message: 'Duration hours must be a positive integer' });
    }
  }
  
  // Similar items check (adaptive prefix matching)
  // This will be done in Layer 5 with database lookup
  
  return errors.length > 0 ? { layer: 4, errors } : null;
}
```

### Layer 5: Duplicate Detection

```javascript
// services/validationService.js - Duplicate Detection
static async validateDuplicates(data, userId) {
  const normalizedName = data.name.toLowerCase().trim().replace(/\s+/g, ' ');
  const normalizedCategory = data.category.trim().replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
  
  // Check for exact duplicate
  const existingItem = await Item.findOne({
    normalizedName: normalizedName,
    normalizedCategory: normalizedCategory,
    created_by: userId,
    is_active: true
  });
  
  if (existingItem) {
    return {
      layer: 5,
      errors: [{ field: 'name', message: 'Item with same name and category already exists' }],
      duplicates: [{
        id: existingItem._id,
        name: existingItem.name,
        category: existingItem.category
      }]
    };
  }
  
  // Check for similar items (adaptive prefix matching)
  const nameLength = normalizedName.length;
  let prefix;
  if (nameLength === 0) {
    prefix = '';
  } else if (nameLength <= 2) {
    prefix = normalizedName;
  } else if (nameLength <= 4) {
    prefix = normalizedName.substring(0, nameLength - 1);
  } else {
    prefix = normalizedName.substring(0, 5);
  }
  
  const similarCount = await Item.countDocuments({
    normalizedNamePrefix: prefix,
    normalizedCategory: normalizedCategory,
    created_by: userId,
    is_active: true
  });
  
  if (similarCount >= 3) {
    return {
      layer: 4, // Business rule error (400)
      errors: [{ field: 'name', message: 'Too many similar items exist in this category' }]
    };
  }
  
  return null;
}
```

---

## 7. File Upload Implementation (Two-Phase Commit)

```javascript
// services/fileService.js
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

class FileService {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads', 'items');
    this.tempDir = path.join(this.uploadDir, 'temp');
  }

  async uploadWithTwoPhaseCommit(file, userId, session) {
    let tempFilePath = null;
    let fileRecord = null;

    try {
      // Phase 1: Upload to temporary location
      await this._ensureDirectoryExists(this.tempDir);
      
      const fileExtension = path.extname(file.originalname);
      const tempFileName = `temp_${uuidv4()}${fileExtension}`;
      tempFilePath = path.join(this.tempDir, tempFileName);
      
      await fs.writeFile(tempFilePath, file.buffer);
      
      // Create file record (not yet linked to item)
      fileRecord = {
        filename: tempFileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: tempFilePath,
        uploadedBy: userId,
        status: 'uploading',
        createdAt: new Date()
      };
      
      // Note: In a real implementation, you might want to save this to a File collection
      // For now, we'll return the file info to be saved with the item
      
      return {
        tempFilePath,
        fileInfo: fileRecord
      };

    } catch (error) {
      // Rollback: Clean up temp file
      if (tempFilePath && await this._fileExists(tempFilePath)) {
        await fs.unlink(tempFilePath).catch(() => {});
      }
      throw error;
    }
  }

  async commitFileUpload(tempFilePath, itemId) {
    try {
      // Phase 2: Move to permanent location
      await this._ensureDirectoryExists(this.uploadDir);
      
      const fileExtension = path.extname(tempFilePath);
      const permanentFileName = `${itemId}_${uuidv4()}${fileExtension}`;
      const permanentPath = path.join(this.uploadDir, permanentFileName);
      
      await fs.rename(tempFilePath, permanentPath);
      
      return permanentPath.replace(process.cwd() + path.sep, '').replace(/\\/g, '/');
    } catch (error) {
      throw error;
    }
  }

  async rollbackFileUpload(tempFilePath) {
    try {
      if (tempFilePath && await this._fileExists(tempFilePath)) {
        await fs.unlink(tempFilePath);
      }
    } catch (error) {
      // Log error but don't throw (cleanup should be best-effort)
      console.error('Error during file rollback:', error);
    }
  }

  async _ensureDirectoryExists(dir) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async _fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new FileService();
```

---

## 8. Controller Implementation

```javascript
// controllers/itemController.js
const Item = require('../models/Item');
const ValidationService = require('../services/validationService');
const FileService = require('../services/fileService');
const mongoose = require('mongoose');

class ItemController {
  async createItem(req, res, next) {
    const session = await mongoose.startSession();
    let uploadedFile = null;
    let tempFilePath = null;

    try {
      session.startTransaction();

      // Layer 1: Authentication (handled by middleware)
      const userId = req.user.id;

      // Extract and prepare data
      const itemData = this._extractItemData(req.body);
      const file = req.file;

      // Layer 2: Schema Validation
      const schemaErrors = ValidationService.validateSchema(itemData);
      if (schemaErrors) {
        await session.abortTransaction();
        return res.status(422).json({
          status: 'error',
          error_code: 422,
          error_type: 'Unprocessable Entity - Schema validation failed',
          message: schemaErrors.errors[0].message,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Layer 3: File Validation (if file provided)
      if (file) {
        const fileErrors = ValidationService.validateFile(file);
        if (fileErrors) {
          await session.abortTransaction();
          const errorCode = fileErrors.errors[0].message.includes('size') ? 413 : 415;
          return res.status(errorCode).json({
            status: 'error',
            error_code: errorCode,
            error_type: errorCode === 413 ? 'Payload Too Large' : 'Unsupported Media Type',
            message: fileErrors.errors[0].message,
            timestamp: new Date().toISOString(),
            path: req.path
          });
        }
      }

      // Layer 4: Business Rules Validation
      const businessRuleErrors = ValidationService.validateBusinessRules(itemData);
      if (businessRuleErrors) {
        await session.abortTransaction();
        return res.status(400).json({
          status: 'error',
          error_code: 400,
          error_type: 'Bad Request - Business rule validation failed',
          message: businessRuleErrors.errors[0].message,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Layer 5: Duplicate Detection
      const duplicateErrors = await ValidationService.validateDuplicates(itemData, userId);
      if (duplicateErrors) {
        await session.abortTransaction();
        const errorCode = duplicateErrors.layer === 5 ? 409 : 400;
        return res.status(errorCode).json({
          status: 'error',
          error_code: errorCode,
          error_type: errorCode === 409 ? 'Conflict - Duplicate item' : 'Bad Request - Too many similar items',
          message: duplicateErrors.errors[0].message,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Handle file upload (two-phase commit - Phase 1)
      if (file) {
        uploadedFile = await FileService.uploadWithTwoPhaseCommit(file, userId, session);
        tempFilePath = uploadedFile.tempFilePath;
      }

      // Create item
      const normalizedData = this._normalizeItemData(itemData, userId);
      const item = new Item(normalizedData);
      await item.save({ session });

      // Commit file upload (Phase 2)
      if (uploadedFile) {
        const permanentPath = await FileService.commitFileUpload(tempFilePath, item._id);
        item.file_path = permanentPath;
        await item.save({ session });
      }

      await session.commitTransaction();

      // Return success response
      const responseData = await this._formatItemResponse(item);
      return res.status(201).json({
        status: 'success',
        message: 'Item created successfully',
        data: responseData,
        item_id: item._id.toString()
      });

    } catch (error) {
      // Rollback transaction
      await session.abortTransaction();

      // Rollback file upload if it was started
      if (tempFilePath) {
        await FileService.rollbackFileUpload(tempFilePath);
      }

      // Handle duplicate key error (MongoDB unique constraint)
      if (error.code === 11000) {
        return res.status(409).json({
          status: 'error',
          error_code: 409,
          error_type: 'Conflict - Duplicate item',
          message: 'Item with same name and category already exists',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      next(error);
    } finally {
      session.endSession();
    }
  }

  _extractItemData(body) {
    return {
      name: body.name,
      description: body.description,
      item_type: body.item_type,
      price: parseFloat(body.price),
      category: body.category,
      tags: body.tags ? (Array.isArray(body.tags) ? body.tags : body.tags.split(',').map(t => t.trim())) : [],
      weight: body.weight ? parseFloat(body.weight) : undefined,
      dimensions: body.length || body.width || body.height ? {
        length: body.length ? parseFloat(body.length) : undefined,
        width: body.width ? parseFloat(body.width) : undefined,
        height: body.height ? parseFloat(body.height) : undefined
      } : undefined,
      download_url: body.download_url,
      file_size: body.file_size ? parseFloat(body.file_size) : undefined,
      duration_hours: body.duration_hours ? parseInt(body.duration_hours) : undefined
    };
  }

  _normalizeItemData(data, userId) {
    const normalizedName = data.name.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedCategory = data.category.trim().replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    
    // Generate adaptive prefix
    const nameLength = normalizedName.length;
    let normalizedNamePrefix;
    if (nameLength === 0) {
      normalizedNamePrefix = '';
    } else if (nameLength <= 2) {
      normalizedNamePrefix = normalizedName;
    } else if (nameLength <= 4) {
      normalizedNamePrefix = normalizedName.substring(0, nameLength - 1);
    } else {
      normalizedNamePrefix = normalizedName.substring(0, 5);
    }
    
    return {
      name: data.name.trim(),
      normalizedName,
      normalizedNamePrefix,
      description: data.description.trim(),
      item_type: data.item_type.toUpperCase(),
      price: data.price,
      category: normalizedCategory,
      normalizedCategory: normalizedCategory.toLowerCase(),
      tags: data.tags,
      weight: data.weight,
      dimensions: data.dimensions,
      download_url: data.download_url,
      file_size: data.file_size,
      duration_hours: data.duration_hours,
      created_by: userId,
      is_active: true
    };
  }

  async _formatItemResponse(item) {
    const itemObj = item.toObject();
    
    // Remove internal fields
    delete itemObj.normalizedName;
    delete itemObj.normalizedNamePrefix;
    delete itemObj.normalizedCategory;
    delete itemObj.__v;
    
    return itemObj;
  }
}

module.exports = new ItemController();
```

---

## 9. Testing Strategy

### Test Structure

```
tests/
├── unit/
│   ├── services/
│   │   ├── validationService.test.js
│   │   ├── itemService.test.js
│   │   └── fileService.test.js
│   └── models/
│       └── Item.test.js
├── integration/
│   ├── api/
│   │   ├── itemCreation.test.js
│   │   └── validation.test.js
│   └── database/
│       └── transactions.test.js
└── e2e/
    ├── itemCreation.test.js
    └── fileUpload.test.js
```

### Key Test Cases

1. **Validation Layer Tests:**
   - Layer 1: Authentication (401 errors)
   - Layer 2: Schema validation (422 errors)
   - Layer 3: File validation (413/415 errors)
   - Layer 4: Business rules (400 errors)
   - Layer 5: Duplicate detection (409 errors)

2. **Adaptive Prefix Matching Tests:**
   - Names < 5 characters
   - Names exactly 5 characters
   - Names > 5 characters
   - Similar items threshold (3 items)

3. **File Upload Tests:**
   - Two-phase commit success
   - Rollback on item creation failure
   - Rollback on validation failure
   - Concurrent uploads

4. **Category Normalization Tests:**
   - Title Case conversion
   - Case-insensitive duplicate detection
   - Business rule matching

5. **Concurrent Request Tests:**
   - Simultaneous duplicate creation
   - Transaction conflicts
   - Database constraint violations

---

## 10. Implementation Checklist

### Backend
- [ ] Create Item model with normalized fields
- [ ] Setup database indexes
- [ ] Implement 5-layer validation service
- [ ] Create ItemService
- [ ] Create CategoryService (normalization)
- [ ] Implement FileService (two-phase commit)
- [ ] Create item controller
- [ ] Create item routes
- [ ] File upload middleware
- [ ] Error handling middleware
- [ ] Unit tests (services)
- [ ] Integration tests (API)

### Frontend
- [ ] ItemForm component
- [ ] FileUpload component
- [ ] Type-specific field components
- [ ] Validation display component
- [ ] useItemForm hook
- [ ] Item service (API client)
- [ ] Form state management
- [ ] Error handling
- [ ] E2E tests

### Documentation
- [ ] API documentation
- [ ] Component documentation
- [ ] Testing guide
- [ ] Deployment guide

---

## 11. Next Steps

1. **Start with Phase 2.1:** Set up database schema and models
2. **Implement validation layers:** Build each layer incrementally
3. **Create API endpoint:** Test with Postman/Thunder Client
4. **Build frontend:** Start with basic form, add conditional fields
5. **Add file upload:** Implement two-phase commit
6. **Write tests:** Unit → Integration → E2E
7. **Documentation:** Update API docs and README

---

**Implementation Plan Version:** 1.0  
**Last Updated:** December 17, 2024  
**Status:** Ready for Implementation

