# **API Contract - Flow 4: Item Details**

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
  "name": "Laptop Computer",
  "description": "...",
  // ... all item fields
}

// Error Response
{
  "status": "error",
  "error_code": 404,
  "error_type": "Not Found - Resource not found",
  "message": "Item with ID {id} not found",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items/{id}"
}
```

---

## **2. Get Item by ID Endpoint**

### **2.1 Get Item**

**Endpoint:** `GET /api/items/{id}`

**Authentication:** Required (JWT token)

**Path Parameter:**
- `id` (required): Item ID (MongoDB ObjectId string, 24 hex characters)

**Request Example:**
```
GET /api/items/507f1f77bcf86cd799439011
Authorization: Bearer {jwt-token}
```

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Laptop Computer",
  "description": "High-performance laptop for software development with 16GB RAM and 512GB SSD",
  "item_type": "PHYSICAL",
  "status": "active",
  "category": "Electronics",
  "price": 1299.99,
  "tags": ["laptop", "computer", "electronics", "development"],
  "weight": 2.5,
  "dimensions": {
    "length": 35.5,
    "width": 24.0,
    "height": 2.0
  },
  "file_path": "uploads/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
  "embed_url": "https://example.com/embed/item/507f1f77bcf86cd799439011",
  "created_by": "507f1f77bcf86cd799439012",
  "created_at": "2024-12-17T02:17:00Z",
  "updated_at": "2024-12-17T02:17:00Z",
  "is_active": true
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "status": "error",
  "error_code": 404,
  "error_type": "Not Found - Resource not found",
  "message": "Item with ID 507f1f77bcf86cd799439011 not found",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**422 Unprocessable Entity (Invalid ID Format):**
```json
{
  "status": "error",
  "error_code": 422,
  "error_type": "Unprocessable Entity - Invalid ID format",
  "message": "Invalid item ID format. Expected 24-character hexadecimal string.",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items/invalid-id"
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "error_code": 401,
  "error_type": "Unauthorized - Authentication required",
  "message": "Authentication required. Please log in.",
  "timestamp": "2024-12-17T02:17:00Z",
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
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

---

## **3. Response Schema**

### **3.1 Item Object (Full Schema)**

**All Fields Returned:**
- `_id`: ObjectId string
- `name`: String
- `description`: String
- `item_type`: Enum (PHYSICAL, DIGITAL, SERVICE)
- `status`: String (active, inactive, pending)
- `category`: String
- `price`: Number
- `tags`: Array of strings
- `created_by`: ObjectId string
- `created_at`: ISO 8601 date string
- `updated_at`: ISO 8601 date string
- `is_active`: Boolean

**Conditional Fields (based on item_type):**
- `weight`: Number (if PHYSICAL)
- `dimensions`: Object (if PHYSICAL)
- `download_url`: String (if DIGITAL)
- `file_size`: Number (if DIGITAL)
- `duration_hours`: Number (if SERVICE)

**Optional Fields:**
- `file_path`: String (if file uploaded)
- `embed_url`: String (if embedded content available)

---

## **4. Validation Rules**

### **4.1 Item ID Validation**

- **Format:** 24-character hexadecimal string (MongoDB ObjectId)
- **Pattern:** `^[0-9a-fA-F]{24}$`
- **Validation:** Check format before querying database
- **Error:** 422 if invalid format

### **4.2 Response Validation**

- **Required Fields:** _id, name, description, item_type, category, created_at
- **Optional Fields:** All other fields
- **Data Types:** Validate all field types match schema

---

## **5. Status Codes Summary**

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Item found and returned |
| 401 | Unauthorized | Missing/invalid authentication token |
| 404 | Not Found | Item ID doesn't exist in database |
| 422 | Unprocessable Entity | Invalid item ID format |
| 500 | Internal Server Error | Server error |

---

## **6. Performance Considerations**

- **Response Time:** < 500ms (fast lookup with _id index)
- **Data Size:** Return full item object (not paginated)
- **Caching:** Optional - cache frequently accessed items

---

**Next:** See `03-backend-architecture.md` for backend implementation details.

