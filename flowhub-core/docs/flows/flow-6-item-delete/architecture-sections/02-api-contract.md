# **API Contract - Flow 6: Item Delete**

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
Authorization: Bearer <jwt-token>  // Required for all endpoints
```

### **Response Format**
```javascript
// Success Response (200 OK)
{
  "success": true,
  "message": "Item deleted successfully",
  "item_id": "507f1f77bcf86cd799439011",
  "deleted_at": "2024-12-17T03:39:00Z"
}

// Error Response
{
  "status": "error",
  "error_code": 409,
  "error_type": "Conflict - Item already deleted",
  "message": "Item with ID 507f1f77bcf86cd799439011 is already deleted",
  "error_code_detail": "ITEM_ALREADY_DELETED",
  "timestamp": "2024-12-17T03:39:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

---

## **2. Delete Item Endpoint**

### **2.1 Delete Item**

**Endpoint:** `DELETE /api/items/{id}`

**Authentication:** Required (JWT token)

**Path Parameter:**
- `id` (required): Item ID (MongoDB ObjectId string, 24 hex characters)

**Request Example:**
```
DELETE /api/items/507f1f77bcf86cd799439011
Authorization: Bearer {jwt-token}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Item deleted successfully",
  "item_id": "507f1f77bcf86cd799439011",
  "deleted_at": "2024-12-17T03:39:00Z"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "status": "error",
  "error_code": 400,
  "error_type": "Bad Request - Invalid ID format",
  "message": "Invalid item ID format",
  "timestamp": "2024-12-17T03:39:00Z",
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
  "timestamp": "2024-12-17T03:39:00Z",
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
  "timestamp": "2024-12-17T03:39:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

**409 Conflict (Already Deleted):**
```json
{
  "status": "error",
  "error_code": 409,
  "error_type": "Conflict - Item already deleted",
  "message": "Item with ID 507f1f77bcf86cd799439011 is already deleted",
  "error_code_detail": "ITEM_ALREADY_DELETED",
  "timestamp": "2024-12-17T03:39:00Z",
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
  "timestamp": "2024-12-17T03:39:00Z",
  "path": "/api/items/507f1f77bcf86cd799439011"
}
```

---

## **3. Response Schema**

### **3.1 Success Response**

**Fields:**
- `success` (Boolean) - Always true for success
- `message` (String) - Success message
- `item_id` (String) - Deleted item ID
- `deleted_at` (String) - ISO 8601 timestamp of deletion

---

### **3.2 Error Response**

**Fields:**
- `status` (String) - Always "error"
- `error_code` (Integer) - HTTP status code
- `error_type` (String) - Error type description
- `message` (String) - Error message
- `error_code_detail` (String, optional) - Detailed error code (e.g., "ITEM_ALREADY_DELETED")
- `timestamp` (String) - ISO 8601 timestamp
- `path` (String) - API path that caused error

---

## **4. Validation Rules**

### **4.1 Item ID Validation**

- **Format:** 24-character hexadecimal string (MongoDB ObjectId)
- **Pattern:** `^[0-9a-fA-F]{24}$`
- **Validation:** Check format before querying database
- **Error:** 400 if invalid format

### **4.2 Item Existence Validation**

- **Check:** Item must exist in database
- **Validation:** Query database by _id
- **Error:** 404 if item doesn't exist

### **4.3 Item Status Validation**

- **Check:** Item status must not be "deleted"
- **Validation:** Check status before allowing deletion
- **Error:** 409 if item is already deleted

---

## **5. Status Codes Summary**

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Item deleted successfully |
| 400 | Bad Request | Invalid item ID format |
| 401 | Unauthorized | Missing/invalid authentication token |
| 404 | Not Found | Item ID doesn't exist |
| 409 | Conflict | Item already deleted |
| 500 | Internal Server Error | Server error |

---

## **6. Performance Considerations**

- **Response Time:** < 500ms (fast update with _id index)
- **Status Check:** Single database query (findOne)
- **Update Operation:** Atomic updateOne operation

---

**Next:** See `03-backend-architecture.md` for backend implementation details.

