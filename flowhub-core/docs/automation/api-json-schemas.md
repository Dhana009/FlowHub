# **API JSON Schemas for QA Testing**

**Purpose:** Complete JSON schemas for request/response validation  
**Format:** JSON Schema Draft 07

---

## **Item Management Endpoints**

### **POST /api/v1/items - Create Item**

**Content-Type:** `multipart/form-data`

**Request Schema:**
```json
{
  "type": "object",
  "required": ["name", "description", "item_type", "price", "category"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 3,
      "maxLength": 100,
      "pattern": "^[a-zA-Z0-9\\s\\-_]+$"
    },
    "description": {
      "type": "string",
      "minLength": 10,
      "maxLength": 500
    },
    "item_type": {
      "type": "string",
      "enum": ["PHYSICAL", "DIGITAL", "SERVICE"]
    },
    "price": {
      "type": "number",
      "minimum": 0.01,
      "maximum": 999999.99,
      "multipleOf": 0.01
    },
    "category": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1,
        "maxLength": 30
      },
      "maxItems": 10,
      "uniqueItems": true
    },
    "weight": {
      "type": "number",
      "minimum": 0.01
    },
    "length": {
      "type": "number",
      "minimum": 0.01
    },
    "width": {
      "type": "number",
      "minimum": 0.01
    },
    "height": {
      "type": "number",
      "minimum": 0.01
    },
    "download_url": {
      "type": "string",
      "format": "uri"
    },
    "file_size": {
      "type": "integer",
      "minimum": 1
    },
    "duration_hours": {
      "type": "integer",
      "minimum": 1
    },
    "embed_url": {
      "type": "string",
      "format": "uri"
    }
  },
  "allOf": [
    {
      "if": {
        "properties": { "item_type": { "const": "PHYSICAL" } }
      },
      "then": {
        "required": ["weight", "length", "width", "height"]
      }
    },
    {
      "if": {
        "properties": { "item_type": { "const": "DIGITAL" } }
      },
      "then": {
        "required": ["download_url", "file_size"]
      }
    },
    {
      "if": {
        "properties": { "item_type": { "const": "SERVICE" } }
      },
      "then": {
        "required": ["duration_hours"]
      }
    }
  ]
}
```

**Success Response (201):**
```json
{
  "type": "object",
  "required": ["status", "message", "data", "item_id"],
  "properties": {
    "status": { "type": "string", "const": "success" },
    "message": { "type": "string" },
    "item_id": { "type": "string" },
    "data": {
      "type": "object",
      "required": ["_id", "name", "description", "item_type", "price", "category", "version", "is_active"],
      "properties": {
        "_id": { "type": "string" },
        "name": { "type": "string" },
        "description": { "type": "string" },
        "item_type": { "type": "string", "enum": ["PHYSICAL", "DIGITAL", "SERVICE"] },
        "price": { "type": "number" },
        "category": { "type": "string" },
        "tags": { "type": "array", "items": { "type": "string" } },
        "version": { "type": "integer", "minimum": 1 },
        "is_active": { "type": "boolean" },
        "created_by": { "type": "string" },
        "createdAt": { "type": "string", "format": "date-time" },
        "updatedAt": { "type": "string", "format": "date-time" }
      }
    }
  }
}
```

---

### **GET /api/v1/items - List Items**

**Query Parameters:**
- `search` (string, optional): Search term
- `status` (string, optional): `"active"` or `"inactive"`
- `category` (string, optional): Category filter
- `page` (integer, optional, default: 1, minimum: 1)
- `limit` (integer, optional, default: 20, minimum: 1, maximum: 100)
- `sort_by` (string, optional): Field name to sort by
- `sort_order` (string, optional): `"asc"` or `"desc"`

**Success Response (200):**
```json
{
  "type": "object",
  "required": ["status", "data", "pagination"],
  "properties": {
    "status": { "type": "string", "const": "success" },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["_id", "name", "item_type", "price", "category"],
        "properties": {
          "_id": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "item_type": { "type": "string" },
          "price": { "type": "number" },
          "category": { "type": "string" },
          "is_active": { "type": "boolean" }
        }
      }
    },
    "pagination": {
      "type": "object",
      "required": ["page", "limit", "total", "pages"],
      "properties": {
        "page": { "type": "integer" },
        "limit": { "type": "integer" },
        "total": { "type": "integer" },
        "pages": { "type": "integer" }
      }
    }
  }
}
```

---

### **GET /api/v1/items/:id - Get Item**

**Success Response (200):**
```json
{
  "type": "object",
  "required": ["status", "data"],
  "properties": {
    "status": { "type": "string", "const": "success" },
    "data": {
      "type": "object",
      "required": ["_id", "name", "description", "item_type", "price", "category", "version"],
      "properties": {
        "_id": { "type": "string" },
        "name": { "type": "string" },
        "description": { "type": "string" },
        "item_type": { "type": "string" },
        "price": { "type": "number" },
        "category": { "type": "string" },
        "tags": { "type": "array" },
        "version": { "type": "integer" },
        "is_active": { "type": "boolean" },
        "created_by": { "type": "string" },
        "createdAt": { "type": "string" },
        "updatedAt": { "type": "string" }
      }
    }
  }
}
```

---

### **PUT /api/v1/items/:id - Update Item**

**Request Schema:**
```json
{
  "type": "object",
  "required": ["version"],
  "properties": {
    "version": {
      "type": "integer",
      "minimum": 1
    },
    "name": { "type": "string", "minLength": 3, "maxLength": 100 },
    "description": { "type": "string", "minLength": 10, "maxLength": 500 },
    "price": { "type": "number", "minimum": 0.01, "maximum": 999999.99 },
    "category": { "type": "string", "minLength": 1, "maxLength": 50 },
    "tags": { "type": "array", "items": { "type": "string" }, "maxItems": 10 }
  }
}
```

**Success Response (200):**
```json
{
  "type": "object",
  "required": ["status", "message", "data"],
  "properties": {
    "status": { "type": "string", "const": "success" },
    "message": { "type": "string" },
    "data": {
      "type": "object",
      "required": ["_id", "version"],
      "properties": {
        "_id": { "type": "string" },
        "version": { "type": "integer" }
      }
    }
  }
}
```

**Error Response (409) - Version Conflict:**
```json
{
  "type": "object",
  "required": ["status", "error_code", "error_type"],
  "properties": {
    "status": { "type": "string", "const": "error" },
    "error_code": { "type": "integer", "const": 409 },
    "error_type": { "type": "string" },
    "error_code_detail": { "type": "string", "const": "VERSION_CONFLICT" },
    "message": { "type": "string" }
  }
}
```

---

### **DELETE /api/v1/items/:id - Delete Item**

**Success Response (200):**
```json
{
  "type": "object",
  "required": ["status", "message"],
  "properties": {
    "status": { "type": "string", "const": "success" },
    "message": { "type": "string" }
  }
}
```

---

## **User Management Endpoints**

### **GET /api/v1/users - List Users**

**Query Parameters:**
- `page` (integer, optional, default: 1)
- `limit` (integer, optional, default: 20)

**Success Response (200):**
```json
{
  "type": "object",
  "required": ["status", "data", "pagination"],
  "properties": {
    "status": { "type": "string", "const": "success" },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["_id", "email", "firstName", "lastName", "role", "isActive"],
        "properties": {
          "_id": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "firstName": { "type": "string" },
          "lastName": { "type": "string" },
          "role": { "type": "string", "enum": ["ADMIN", "EDITOR", "VIEWER"] },
          "isActive": { "type": "boolean" },
          "createdAt": { "type": "string", "format": "date-time" }
        }
      }
    },
    "pagination": {
      "type": "object",
      "required": ["page", "limit", "total", "pages"],
      "properties": {
        "page": { "type": "integer" },
        "limit": { "type": "integer" },
        "total": { "type": "integer" },
        "pages": { "type": "integer" }
      }
    }
  }
}
```

---

### **PATCH /api/v1/users/:id/role - Update User Role**

**Request Schema:**
```json
{
  "type": "object",
  "required": ["role"],
  "properties": {
    "role": {
      "type": "string",
      "enum": ["ADMIN", "EDITOR", "VIEWER"]
    }
  }
}
```

**Success Response (200):**
```json
{
  "type": "object",
  "required": ["status", "message", "data"],
  "properties": {
    "status": { "type": "string", "const": "success" },
    "message": { "type": "string" },
    "data": {
      "type": "object",
      "required": ["_id", "role"],
      "properties": {
        "_id": { "type": "string" },
        "role": { "type": "string" }
      }
    }
  }
}
```

---

### **PATCH /api/v1/users/:id/status - Update User Status**

**Request Schema:**
```json
{
  "type": "object",
  "required": ["isActive"],
  "properties": {
    "isActive": {
      "type": "boolean"
    }
  }
}
```

**Success Response (200):**
```json
{
  "type": "object",
  "required": ["status", "message"],
  "properties": {
    "status": { "type": "string", "const": "success" },
    "message": { "type": "string" }
  }
}
```

---

## **Bulk Operations Endpoints**

### **POST /api/v1/bulk-operations - Start Bulk Operation**

**Request Schema:**
```json
{
  "type": "object",
  "required": ["operation", "itemIds"],
  "properties": {
    "operation": {
      "type": "string",
      "enum": ["delete", "activate", "deactivate", "update_category"]
    },
    "itemIds": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1
    },
    "payload": {
      "type": "object"
    }
  }
}
```

**Success Response (201):**
```json
{
  "type": "object",
  "required": ["status", "job_id", "job_status", "job_progress", "total_items"],
  "properties": {
    "status": { "type": "string", "const": "success" },
    "job_id": { "type": "string" },
    "job_status": { "type": "string", "enum": ["pending", "processing", "completed", "failed"] },
    "job_progress": { "type": "integer", "minimum": 0, "maximum": 100 },
    "total_items": { "type": "integer" }
  }
}
```

---

### **GET /api/v1/bulk-operations/:jobId - Get Bulk Job Status**

**Success Response (200):**
```json
{
  "type": "object",
  "required": ["status", "data"],
  "properties": {
    "status": { "type": "string", "const": "success" },
    "data": {
      "type": "object",
      "required": ["job_id", "status", "progress", "summary"],
      "properties": {
        "job_id": { "type": "string" },
        "status": { "type": "string", "enum": ["pending", "processing", "completed", "failed"] },
        "progress": { "type": "integer", "minimum": 0, "maximum": 100 },
        "summary": {
          "type": "object",
          "required": ["total", "success", "failed"],
          "properties": {
            "total": { "type": "integer" },
            "success": { "type": "integer" },
            "failed": { "type": "integer" }
          }
        },
        "skippedIds": { "type": "array", "items": { "type": "string" } },
        "failures": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "error": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
```

---

## **Activity Logs Endpoints**

### **GET /api/v1/activities - Get Activity Logs**

**Query Parameters:**
- `page` (integer, optional, default: 1)
- `limit` (integer, optional, default: 20)
- `action` (string, optional): Filter by action type
- `userId` (string, optional): Filter by user ID

**Success Response (200):**
```json
{
  "type": "object",
  "required": ["status", "data", "pagination"],
  "properties": {
    "status": { "type": "string", "const": "success" },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["_id", "action", "userId", "timestamp"],
        "properties": {
          "_id": { "type": "string" },
          "action": {
            "type": "string",
            "enum": ["USER_LOGIN", "ITEM_CREATE", "ITEM_UPDATE", "ITEM_DELETE", "BULK_START", "USER_ROLE_CHANGE"]
          },
          "userId": { "type": "string" },
          "resourceType": { "type": "string" },
          "resourceId": { "type": "string" },
          "details": { "type": "object" },
          "timestamp": { "type": "string", "format": "date-time" }
        }
      }
    },
    "pagination": {
      "type": "object",
      "required": ["page", "limit", "total", "pages"],
      "properties": {
        "page": { "type": "integer" },
        "limit": { "type": "integer" },
        "total": { "type": "integer" },
        "pages": { "type": "integer" }
      }
    }
  }
}
```

---

## **Field Validation Rules Summary**

### **Item Fields:**
- `name`: 3-100 chars, alphanumeric + spaces/hyphens/underscores
- `description`: 10-500 chars
- `price`: 0.01 - 999,999.99, 2 decimal places
- `category`: 1-50 chars
- `tags`: Max 10 tags, each 1-30 chars, unique
- `weight` (PHYSICAL): > 0.01
- `length/width/height` (PHYSICAL): > 0.01
- `download_url` (DIGITAL): Valid URL
- `file_size` (DIGITAL): > 0
- `duration_hours` (SERVICE): >= 1

### **User Fields:**
- `role`: ADMIN, EDITOR, or VIEWER
- `isActive`: boolean

### **Bulk Operation Fields:**
- `operation`: delete, activate, deactivate, update_category
- `itemIds`: Array of strings, min 1 item

---

**Note:** All schemas use JSON Schema Draft 07. Use these for automated validation in your testing framework.






