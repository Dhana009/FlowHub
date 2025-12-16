# **API Contract - Flow 3: Item List**

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
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}

// Error Response
{
  "status": "error",
  "error_code": 400,
  "error_type": "Bad Request - Invalid query parameters",
  "message": "Invalid page number. Must be >= 1",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items"
}
```

---

## **2. Get Items Endpoint**

### **2.1 Get Items**

**Endpoint:** `GET /api/items`

**Authentication:** Required (JWT token)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | - | Search term for name/description |
| `status` | string | No | - | Filter by status (active, inactive, pending) |
| `category` | string | No | - | Filter by category |
| `sort_by` | array | No | ["created_at"] | Sort fields (name, status, category, price, created_at) |
| `sort_order` | array | No | ["desc"] | Sort orders (asc, desc) |
| `page` | integer | No | 1 | Page number (min: 1) |
| `limit` | integer | No | 20 | Items per page (min: 1, max: 100) |

**Request Example:**
```
GET /api/items?search=laptop&status=active&category=Electronics&sort_by=price&sort_order=desc&page=1&limit=20
Authorization: Bearer {jwt-token}
```

**Success Response (200 OK):**
```json
{
  "items": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Laptop Computer",
      "description": "High-performance laptop for development",
      "item_type": "PHYSICAL",
      "status": "active",
      "category": "Electronics",
      "price": 1299.99,
      "tags": ["laptop", "computer"],
      "created_at": "2024-12-17T02:17:00Z",
      "updated_at": "2024-12-17T02:17:00Z",
      "is_active": true
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Gaming Laptop",
      "description": "High-end gaming laptop with RTX graphics",
      "item_type": "PHYSICAL",
      "status": "active",
      "category": "Electronics",
      "price": 2499.99,
      "tags": ["laptop", "gaming"],
      "created_at": "2024-12-16T10:30:00Z",
      "updated_at": "2024-12-16T10:30:00Z",
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

**Error Responses:**

**400 Bad Request (Invalid Parameters):**
```json
{
  "status": "error",
  "error_code": 400,
  "error_type": "Bad Request - Invalid query parameters",
  "message": "Invalid page number. Must be >= 1",
  "timestamp": "2024-12-17T02:17:00Z",
  "path": "/api/items"
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
  "path": "/api/items"
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

## **3. Query Parameter Details**

### **3.1 Search Parameter**

**Format:** `?search={term}`

**Examples:**
- `?search=laptop` - Search for "laptop" in name/description
- `?search=high performance` - Search for multiple words
- `?search=` - Empty search (returns all items)

**Behavior:**
- Case-insensitive
- Partial match (substring)
- Searches in `name` and `description` fields
- Uses `$or` operator (matches if found in either field)

---

### **3.2 Status Parameter**

**Format:** `?status={value}`

**Values:**
- `active` - Show only active items
- `inactive` - Show only inactive items
- `pending` - Show only pending items
- (empty) - Show all items

**Examples:**
- `?status=active`
- `?status=inactive`

**Behavior:**
- Case-insensitive
- Maps to `is_active` field in database
- Single value (not array)

---

### **3.3 Category Parameter**

**Format:** `?category={value}`

**Values:**
- Any valid category name (Electronics, Books, Services, etc.)
- (empty) - Show all categories

**Examples:**
- `?category=Electronics`
- `?category=Books`

**Behavior:**
- Case-sensitive (exact match)
- Single value (not array)

---

### **3.4 Sort Parameters**

**Format:** `?sort_by={field1,field2}&sort_order={order1,order2}`

**Sort Fields:**
- `name` - Sort by name
- `status` - Sort by status
- `category` - Sort by category
- `price` - Sort by price
- `created_at` - Sort by creation date (default)

**Sort Orders:**
- `asc` - Ascending
- `desc` - Descending (default)

**Examples:**
- `?sort_by=price&sort_order=desc` - Sort by price descending
- `?sort_by=name&sort_order=asc` - Sort by name ascending
- `?sort_by=category,price&sort_order=asc,desc` - Sort by category asc, then price desc

**Behavior:**
- Multiple fields supported (primary, secondary, tertiary)
- Sort order array must match sort_by array length
- Default: `created_at` descending

---

### **3.5 Pagination Parameters**

**Format:** `?page={number}&limit={number}`

**Page:**
- Minimum: 1
- Default: 1
- Integer only

**Limit:**
- Minimum: 1
- Maximum: 100
- Default: 20
- Integer only

**Examples:**
- `?page=1&limit=20` - First page, 20 items
- `?page=2&limit=10` - Second page, 10 items
- `?page=1&limit=100` - First page, 100 items (max)

**Behavior:**
- Page 1 is first page (not 0)
- Skip calculation: `(page - 1) * limit`
- Total pages: `ceil(total / limit)`

---

## **4. Combined Query Examples**

### **4.1 Search + Filter**
```
GET /api/items?search=laptop&status=active&category=Electronics
```

### **4.2 Filter + Sort**
```
GET /api/items?status=active&sort_by=price&sort_order=desc
```

### **4.3 Search + Filter + Sort + Pagination**
```
GET /api/items?search=laptop&status=active&category=Electronics&sort_by=price&sort_order=desc&page=2&limit=20
```

### **4.4 Multiple Sort Fields**
```
GET /api/items?sort_by=category,price,name&sort_order=asc,desc,asc
```

---

## **5. Response Schema**

### **5.1 Item Object**

```json
{
  "_id": "string (ObjectId)",
  "name": "string",
  "description": "string",
  "item_type": "string (enum: PHYSICAL, DIGITAL, SERVICE)",
  "status": "string (enum: active, inactive, pending)",
  "category": "string",
  "price": "number",
  "tags": ["array of strings"],
  "created_at": "string (ISO 8601 date)",
  "updated_at": "string (ISO 8601 date)",
  "is_active": "boolean"
}
```

### **5.2 Pagination Object**

```json
{
  "page": "integer (current page number)",
  "limit": "integer (items per page)",
  "total": "integer (total items matching filters)",
  "total_pages": "integer (total number of pages)",
  "has_next": "boolean (true if next page exists)",
  "has_prev": "boolean (true if previous page exists)"
}
```

---

## **6. Validation Rules**

### **6.1 Query Parameter Validation**

- **search:** String, 0-100 characters, trimmed
- **status:** Enum: "active", "inactive", "pending" (case-insensitive)
- **category:** String, must exist in database (case-sensitive)
- **sort_by:** Array of strings, must be valid field names
- **sort_order:** Array of strings, values: "asc", "desc" (case-insensitive)
- **page:** Integer, min: 1
- **limit:** Integer, min: 1, max: 100

### **6.2 Error Scenarios**

**Invalid Page:**
- `page=0` → 400 Bad Request
- `page=-1` → 400 Bad Request
- `page=abc` → 400 Bad Request

**Invalid Limit:**
- `limit=0` → 400 Bad Request
- `limit=101` → 400 Bad Request (exceeds max)
- `limit=abc` → 400 Bad Request

**Invalid Sort Field:**
- `sort_by=invalid_field` → 400 Bad Request
- Response includes list of valid fields

**Invalid Sort Order:**
- `sort_order=invalid` → 400 Bad Request
- Must be "asc" or "desc"

---

## **7. Status Codes Summary**

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Items retrieved successfully |
| 400 | Bad Request | Invalid query parameters |
| 401 | Unauthorized | Missing/invalid authentication token |
| 500 | Internal Server Error | Server error |

---

**Next:** See `03-backend-architecture.md` for backend implementation details.

