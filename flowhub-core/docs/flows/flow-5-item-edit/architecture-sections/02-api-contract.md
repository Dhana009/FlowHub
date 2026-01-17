# **API Contract - Flow 5: Item Edit**

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
Content-Type: application/json
Authorization: Bearer <jwt-token>  // Required for all endpoints
```

### **Response Format**
```javascript
// Success Response (200 OK)
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Updated Laptop Computer",
  // ... all item fields
  "version": 2,
  "updated_at": "2024-12-17T03:25:00Z"
}

// Error Response
{
  "status": "error",
  "error_code": 409,
  "error_type": "Conflict - Version mismatch",
  "message": "Item was modified by another user. Expected version: 2, Provided: 1",
  "error_code_detail": "VERSION_CONFLICT",
  "current_version": 2,
  "provided_version": 1,
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

---

## **2. Get Item by ID Endpoint (Pre-population)**

### **2.1 Get Item**

**Endpoint:** `GET /api/items/{id}`

**Authentication:** Required (JWT token)

**Purpose:** Fetch existing item data for form pre-population.

**Note:** Same endpoint as Flow 4 (Item Details). See Flow 4 API contract for full specification.

**Response:** Full item object including `version` field.

---

## **3. Update Item Endpoint**

### **3.1 Update Item**

**Endpoint:** `PUT /api/items/{id}`

**Authentication:** Required (JWT token)

**Path Parameter:**
- `id` (required): Item ID (MongoDB ObjectId string, 24 hex characters)

**Request Body:**
```json
{
  "name": "Updated Laptop Computer",
  "description": "Updated description",
  "item_type": "PHYSICAL",
  "category_id": "cat_123",
  "subcategory_id": "subcat_456",
  "status": "active",
  "tags": ["laptop", "updated"],
  "price": 1399.99,
  "weight": 2.8,
  "dimensions": {
    "length": 36.0,
    "width": 25.0,
    "height": 2.1
  },
  "version": 1
}
```

**Request Example:**
```
PUT /api/items/507f1f77bcf86cd799439011
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "name": "Updated Laptop Computer",
  "description": "Updated description",
  "item_type": "PHYSICAL",
  "category_id": "cat_123",
  "status": "active",
  "price": 1399.99,
  "version": 1
}
```

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Updated Laptop Computer",
  "description": "Updated description",
  "item_type": "PHYSICAL",
  "category_id": "cat_123",
  "subcategory_id": "subcat_456",
  "status": "active",
  "tags": ["laptop", "updated"],
  "price": 1399.99,
  "weight": 2.8,
  "dimensions": {
    "length": 36.0,
    "width": 25.0,
    "height": 2.1
  },
  "version": 2,
  "created_at": "2024-12-17T02:17:00Z",
  "updated_at": "2024-12-17T03:25:00Z",
  "created_by": "507f1f77bcf86cd799439012",
  "updated_by": "507f1f77bcf86cd799439012",
  "is_active": true
}
```

**Error Responses:**

**400 Bad Request (Validation Errors):**
```json
{
  "status": "error",
  "error_code": 400,
  "error_type": "Bad Request - Validation failed",
  "message": "Validation failed",
  "errors": {
    "name": "Name must be 1-100 characters",
    "price": "Price must be a positive number"
  },
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "error_code": 401,
  "error_type": "Unauthorized - Authentication required",
  "message": "Authentication required. Please log in.",
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "error_code": 404,
  "error_type": "Not Found - Resource not found",
  "message": "Item with ID 507f1f77bcf86cd799439011 not found",
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**409 Conflict (Item Deleted):**
```json
{
  "status": "error",
  "error_code": 409,
  "error_type": "Conflict - Item deleted",
  "message": "Cannot edit deleted item",
  "error_code_detail": "ITEM_DELETED",
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**409 Conflict (Version Mismatch):**
```json
{
  "status": "error",
  "error_code": 409,
  "error_type": "Conflict - Version mismatch",
  "message": "Item was modified by another user. Expected version: 2, Provided: 1",
  "error_code_detail": "VERSION_CONFLICT",
  "current_version": 2,
  "provided_version": 1,
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**422 Unprocessable Entity:**
```json
{
  "status": "error",
  "error_code": 422,
  "error_type": "Unprocessable Entity - Invalid data format",
  "message": "Invalid data format",
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "error_code": 500,
  "error_type": "Internal Server Error",
  "message": "Something went wrong. Please try again.",
  "timestamp": "2024-12-17T03:25:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

---

## **4. Request Schema**

### **4.1 Update Request Body**

**Required Fields:**
- `name`: String (1-100 characters)
- `item_type`: Enum (PHYSICAL, DIGITAL, SERVICE)
- `category_id`: String
- `status`: String (active, inactive, pending)
- `version`: Integer (current version from GET request)

**Optional Fields:**
- `description`: String (max 1000 characters)
- `subcategory_id`: String
- `tags`: Array of strings
- `price`: Number (positive)

**Conditional Fields (based on item_type):**
- `weight`: Number (if PHYSICAL)
- `dimensions`: Object (if PHYSICAL)
- `download_url`: String (if DIGITAL)
- `file_size`: Number (if DIGITAL)
- `duration_hours`: Number (if SERVICE)

---

## **5. Validation Rules**

### **5.1 Item ID Validation**

- **Format:** 24-character hexadecimal string (MongoDB ObjectId)
- **Pattern:** `^[0-9a-fA-F]{24}$`
- **Validation:** Check format before querying database
- **Error:** 422 if invalid format

### **5.2 Version Validation**

- **Required:** Must be included in request
- **Type:** Integer
- **Validation:** Must match current item version
- **Error:** 409 if version mismatch

### **5.3 Status Validation**

- **Rule:** Cannot edit items with status "deleted"
- **Validation:** Check status before allowing update
- **Error:** 409 if item is deleted

### **5.4 Field Validation**

- **Same as Creation:** All validation rules from Flow 2 apply
- **Name:** 1-100 characters, alphanumeric + spaces + hyphens
- **Price:** Positive number if provided
- **File:** Type and size validation (if file uploaded)

---

## **6. Status Codes Summary**

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Item updated successfully |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing/invalid authentication token |
| 404 | Not Found | Item ID doesn't exist |
| 409 | Conflict | Version mismatch or item deleted |
| 422 | Unprocessable Entity | Invalid data format |
| 500 | Internal Server Error | Server error |

---

## **7. Performance Considerations**

- **Response Time:** < 500ms (fast update with _id index)
- **Version Check:** Atomic operation (findOneAndUpdate)
- **Data Size:** Return full updated item object

---

**Next:** See `03-backend-architecture.md` for backend implementation details.

