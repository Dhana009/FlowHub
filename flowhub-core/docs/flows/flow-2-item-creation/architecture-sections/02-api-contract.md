# **API Contract - Flow 2: Item Creation**

**Version:** 1.0  
**Date:** December 17, 2024  
**Base URL:** `http://localhost:8000/api`

---

## **1. Base Configuration**

### **API Prefix**
- **Development:** `http://localhost:8000/api`
- **Production:** `https://api.flowhub.com/api`

### **Request Headers**
```javascript
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>  // Required for all endpoints
```

### **Response Format**
```javascript
// Success Response (201 Created)
{
  "status": "success",
  "message": "Item created successfully",
  "data": { ... },
  "item_id": "507f1f77bcf86cd799439011"
}

// Error Response
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

## **2. Item Creation Endpoint**

### **2.1 Create Item**

**Endpoint:** `POST /api/items`

**Authentication:** Required (JWT token)

**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
```
item_data: {
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
  }
}
file: [binary file data]  // Optional
```

**Note:** `item_data` is sent as a JSON string in form field, `file` is sent as binary data.

**Request Example (cURL):**
```bash
curl -X POST http://localhost:8000/api/items \
  -H "Authorization: Bearer <jwt-token>" \
  -F "item_data={\"name\":\"Laptop\",\"description\":\"High-performance laptop\",\"item_type\":\"PHYSICAL\",\"price\":1299.99,\"category\":\"Electronics\",\"weight\":2.5,\"dimensions\":{\"length\":35.5,\"width\":24.0,\"height\":2.0}}" \
  -F "file=@/path/to/file.pdf"
```

**Success Response (201 Created):**
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
    "file_metadata": {
      "original_name": "laptop-specs.pdf",
      "content_type": "application/pdf",
      "size": 245760,
      "uploaded_at": "2024-12-17T02:17:00Z"
    },
    "created_by": "507f1f77bcf86cd799439012",
    "created_at": "2024-12-17T02:17:00Z",
    "updated_at": "2024-12-17T02:17:00Z",
    "is_active": true
  },
  "item_id": "507f1f77bcf86cd799439011"
}
```

**Error Responses:**

**400 Bad Request (Business Rule Violation):**
```json
{
  "status": "error",
  "error_code": 400,
  "error_type": "Bad Request - Business logic validation failed",
  "message": "Electronics must be physical items",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items"
}
```

**401 Unauthorized (Authentication Required):**
```json
{
  "status": "error",
  "error_code": 401,
  "error_type": "Unauthorized - Authentication required",
  "message": "Authentication required. Please log in.",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items"
}
```

**409 Conflict (Duplicate Item):**
```json
{
  "status": "error",
  "error_code": 409,
  "error_type": "Conflict - Resource already exists",
  "message": "Item with same name and category already exists",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items"
}
```

**413 Payload Too Large (File Size Limit):**
```json
{
  "status": "error",
  "error_code": 413,
  "error_type": "Payload Too Large - File size exceeds limit",
  "message": "File too large. Max size: 5MB",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items"
}
```

**415 Unsupported Media Type (Invalid File Type):**
```json
{
  "status": "error",
  "error_code": 415,
  "error_type": "Unsupported Media Type - Invalid file type",
  "message": "File type .exe not supported. Allowed: jpg, jpeg, png, pdf, doc, docx",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items"
}
```

**422 Unprocessable Entity (Schema Validation Failed):**
```json
{
  "status": "error",
  "error_code": 422,
  "error_type": "Unprocessable Entity - Schema validation failed",
  "message": "Name must be between 3 and 100 characters",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items",
  "validation_errors": [
    {
      "field": "name",
      "message": "Name must be between 3 and 100 characters"
    },
    {
      "field": "weight",
      "message": "Weight is required for physical items"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "error_code": 500,
  "error_type": "Internal Server Error",
  "message": "Something went wrong. Please try again.",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items"
}
```

---

## **3. Request Schema**

### **3.1 Item Data Schema (JSON String)**

**Field:** `item_data` (sent as JSON string in form field)

**Schema:**
```json
{
  "name": "string (required, 3-100 chars)",
  "description": "string (required, 10-500 chars)",
  "item_type": "enum (required): PHYSICAL | DIGITAL | SERVICE",
  "price": "number (required, 0.01-999999.99)",
  "category": "string (required, 1-50 chars)",
  "tags": "array of strings (optional, max 10 items)",
  "is_active": "boolean (optional, default: true)",
  
  // Conditional fields based on item_type:
  // Required if item_type = PHYSICAL:
  "weight": "number (> 0, required if PHYSICAL)",
  "dimensions": {
    "length": "number (> 0, required if PHYSICAL)",
    "width": "number (> 0, required if PHYSICAL)",
    "height": "number (> 0, required if PHYSICAL)"
  },
  // Required if item_type = DIGITAL:
  "download_url": "string (valid URL, required if DIGITAL)",
  "file_size": "number (> 0, required if DIGITAL)",
  // Required if item_type = SERVICE:
  "duration_hours": "number (> 0, required if SERVICE)"
}
```

**Example (Physical Item):**
```json
{
  "name": "Laptop Computer",
  "description": "High-performance laptop for development",
  "item_type": "PHYSICAL",
  "price": 1299.99,
  "category": "Electronics",
  "tags": ["laptop", "computer"],
  "weight": 2.5,
  "dimensions": {
    "length": 35.5,
    "width": 24.0,
    "height": 2.0
  }
}
```

**Example (Digital Item):**
```json
{
  "name": "Software License",
  "description": "Premium software license",
  "item_type": "DIGITAL",
  "price": 299.99,
  "category": "Software",
  "tags": ["license", "software"],
  "download_url": "https://example.com/download/software.zip",
  "file_size": 52428800
}
```

**Example (Service Item):**
```json
{
  "name": "Consulting Service",
  "description": "Professional consulting service",
  "item_type": "SERVICE",
  "price": 150.00,
  "category": "Services",
  "tags": ["consulting"],
  "duration_hours": 8
}
```

### **3.2 File Upload (Optional)**

**Field:** `file` (sent as binary data in form field)

**Constraints:**
- **Allowed Types:** `.jpg`, `.jpeg`, `.png`, `.pdf`, `.doc`, `.docx`
- **Max Size:** 5 MB (5,242,880 bytes)
- **Min Size:** 1 KB (1,024 bytes)
- **Required:** No

---

## **4. Validation Rules**

### **4.1 Schema Validation (422)**

- **Name:** Required, 3-100 chars, alphanumeric + spaces/hyphens/underscores
- **Description:** Required, 10-500 chars
- **Item Type:** Required, enum: PHYSICAL, DIGITAL, SERVICE
- **Price:** Required, 0.01-999999.99
- **Category:** Required, 1-50 chars
- **Tags:** Optional, max 10 items, each 1-30 chars, unique
- **Conditional Fields:** Validated based on item_type

### **4.2 Business Rule Validation (400)**

- Category-item type compatibility
- Price limits by category
- Similar items check (3+ similar items in same category)

### **4.3 Duplicate Validation (409)**

- Check: name + category combination must be unique

### **4.4 File Validation**

- **File Type (415):** Must be in allowed list
- **File Size (413):** Must be within 1 KB - 5 MB range

---

## **5. Status Codes Summary**

| Code | Meaning | When Used |
|------|---------|-----------|
| 201 | Created | Item successfully created |
| 400 | Bad Request | Business rule validation failed |
| 401 | Unauthorized | Missing/invalid authentication token |
| 409 | Conflict | Duplicate item exists |
| 413 | Payload Too Large | File size exceeds limit |
| 415 | Unsupported Media Type | Invalid file type |
| 422 | Unprocessable Entity | Schema validation failed |
| 500 | Internal Server Error | Server error |

---

**Next:** See `03-backend-architecture.md` for backend implementation details.

