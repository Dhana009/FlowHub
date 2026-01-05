# Item APIs
## Complete Request/Response Schemas

**Base Path:** `/api/v1/items`  
**Source:** Extracted from `flowhub-core/backend/src/controllers/itemController.js`  
**Last Updated:** 2025-01-27

---

## POST /items (Create Item)

**Auth:** Required  
**Roles:** ADMIN, EDITOR  
**Content-Type:** `multipart/form-data` (supports file upload) or `application/json`

### Request

**Required Fields:**
- `name` (String, 3-100 chars, alphanumeric + spaces/hyphens/underscores)
- `description` (String, 10-500 chars)
- `item_type` (Enum: `PHYSICAL` | `DIGITAL` | `SERVICE`)
- `price` (Number, 0.01-999999.99)
- `category` (String, 1-50 chars)

**Conditional Fields (based on `item_type`):**

**PHYSICAL:**
- `weight` (Number, > 0, required)
- `dimensions` (Object, required):
  - `length` (Number, > 0)
  - `width` (Number, > 0)
  - `height` (Number, > 0)

**DIGITAL:**
- `download_url` (String, valid URL, required)
- `file_size` (Number, >= 1, required)

**SERVICE:**
- `duration_hours` (Number, >= 1, required)

**Optional Fields:**
- `tags` (Array of strings, max 10, each 1-30 chars, unique)
- `embed_url` (String, valid HTTP/HTTPS URL)
- `file` (File, multipart/form-data)

### Request Example (JSON)

```json
{
  "name": "Test Item",
  "description": "This is a test item description that meets the minimum length requirement of 10 characters.",
  "item_type": "DIGITAL",
  "price": 10.00,
  "category": "Electronics",
  "download_url": "https://example.com/file.zip",
  "file_size": 1024,
  "tags": ["test", "seed"],
  "embed_url": "https://example.com/embed"
}
```

### Response (201)

```json
{
  "status": "success",
  "message": "Item created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Test Item",
    "description": "This is a test item description...",
    "item_type": "DIGITAL",
    "price": 99.99,
    "category": "Electronics",
    "tags": ["test", "seed"],
    "is_active": true,
    "version": 1,
    "created_by": "user_id",
    "createdAt": "2024-12-17T10:30:00Z",
    "updatedAt": "2024-12-17T10:30:00Z",
    "deleted_at": null,
    "download_url": "https://example.com/file.zip",
    "file_size": 1024,
    "embed_url": "https://example.com/embed",
    "file_path": "/uploads/items/file.jpg",
    "file_metadata": {
      "original_name": "file.jpg",
      "content_type": "image/jpeg",
      "size": 1024,
      "uploaded_at": "2024-12-17T10:30:00Z"
    }
  },
  "item_id": "507f1f77bcf86cd799439011"
}
```

**Note:** Internal fields (`normalizedName`, `normalizedCategory`, `normalizedNamePrefix`, `__v`) are NOT returned

### Error Responses

- **400:** Missing required fields
- **401:** Not authenticated
- **403:** Insufficient role (not ADMIN or EDITOR)
- **409:** Duplicate item (same name + category + user)
- **422:** Validation errors

---

## GET /items (List Items)

**Auth:** Required  
**Roles:** ADMIN, EDITOR, VIEWER

### Query Parameters

- `search` (String, optional) - Searches `name` (normalized) and `description` (case-insensitive, partial match)
- `status` (Enum: `active` | `inactive`, optional) - Filters by `is_active`
- `category` (String, optional) - Filters by normalized category
- `sort_by` (String or Array, optional) - Fields: `name`, `category`, `price`, `createdAt`. Default: `['createdAt']`
- `sort_order` (String or Array, optional) - Values: `asc` | `desc`. Default: `['desc']`
- `page` (Number, optional) - Default: `1`, min: `1`
- `limit` (Number, optional) - Default: `20`, min: `1`, max: `100`

### Default Behavior

- If params missing: Uses defaults (page=1, limit=20, sort_by=['createdAt'], sort_order=['desc'])
- If invalid: Returns `422` with error message
- If page > total_pages: Redirects to last valid page

### Response (200)

```json
{
  "status": "success",
  "items": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Item Name",
      "description": "Item description",
      "item_type": "DIGITAL",
      "price": 99.99,
      "category": "Electronics",
      "is_active": true,
      "created_by": "user_id",
      "createdAt": "2024-12-17T10:30:00Z",
      "updatedAt": "2024-12-17T10:30:00Z",
      "deleted_at": null,
      "version": 1,
      "tags": [],
      "embed_url": null,
      "file_path": null
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

### RBAC Filtering

- **ADMIN:** Sees all items
- **VIEWER:** Sees all items (read-only)
- **EDITOR:** Sees only own items (`created_by = userId`)

### Error Responses

- **401:** Not authenticated
- **422:** Invalid query parameters

---

## GET /items/:id (Get Single Item)

**Auth:** Required  
**Roles:** ADMIN, EDITOR, VIEWER  
**Purpose:** Get single item by ID (Flow 4 - Item Details)

### Request

None (itemId in URL)

### Response (200)

```json
{
  "status": "success",
  "message": "Item retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Item Name",
    "description": "Item description",
    "item_type": "DIGITAL",
    "price": 99.99,
    "category": "Electronics",
    "is_active": true,
    "created_by": "user_id",
    "createdAt": "2024-12-17T10:30:00Z",
    "updatedAt": "2024-12-17T10:30:00Z",
    "deleted_at": null,
    "version": 1,
    "tags": [],
    "embed_url": null,
    "file_path": null,
    "file_metadata": null
  }
}
```

**Note:** Includes inactive items (for View button functionality)

### Error Responses

- **401:** Not authenticated
- **422:** Invalid ID format
- **404:** Item not found
- **500:** Internal server error

---

## PUT /items/:id (Update Item)

**Auth:** Required  
**Roles:** ADMIN, EDITOR (ownership check)  
**Content-Type:** `multipart/form-data` (supports file upload) or `application/json`

### Request

**Required Fields:**
- `version` (Number, **REQUIRED** - for optimistic locking)

**Optional Fields (all fields from POST are optional for update):**
- `name`, `description`, `item_type`, `price`, `category`
- `tags`
- Conditional fields (based on new `item_type`)
- `embed_url`
- `file` (multipart/form-data, replaces existing file)

### Request Example

```json
{
  "version": 1,
  "name": "Updated Item Name",
  "description": "Updated description",
  "price": 199.99
}
```

### Response (200)

```json
{
  "status": "success",
  "message": "Item updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Item Name",
    "description": "Updated description",
    "item_type": "DIGITAL",
    "price": 199.99,
    "category": "Electronics",
    "is_active": true,
    "version": 2,
    "created_by": "user_id",
    "createdAt": "2024-12-17T10:30:00Z",
    "updatedAt": "2024-12-17T11:00:00Z",
    "deleted_at": null
  }
}
```

**Note:** Version incremented automatically

### Error Responses

- **400:** Invalid ID format
- **401:** Not authenticated
- **403:** Insufficient role
- **404:** Item not found or not owned
- **409:** Version conflict
  ```json
  {
    "status": "error",
    "error_code": 409,
    "error_type": "Conflict - Version Conflict",
    "error_code_detail": "VERSION_CONFLICT",
    "message": "Item was modified by another user",
    "current_version": 2,
    "provided_version": 1,
    "timestamp": "2024-12-17T10:30:00Z",
    "path": "/api/v1/items/507f1f77bcf86cd799439011"
  }
  ```
- **422:** Validation errors

---

## DELETE /items/:id (Soft Delete)

**Auth:** Required  
**Roles:** ADMIN, EDITOR (ownership check)  
**Purpose:** Soft delete item (Flow 6)

### Request

None (itemId in URL)

### Action

- Sets `is_active = false`
- Sets `deleted_at = timestamp`

### Response (200)

```json
{
  "status": "success",
  "message": "Item deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Item Name",
    "description": "Item description",
    "item_type": "DIGITAL",
    "price": 99.99,
    "category": "Electronics",
    "is_active": false,
    "version": 1,
    "created_by": "user_id",
    "createdAt": "2024-12-17T10:30:00Z",
    "updatedAt": "2024-12-17T11:00:00Z",
    "deleted_at": "2024-12-17T11:00:00Z"
  }
}
```

### Error Responses

- **400:** Invalid ID format
- **401:** Not authenticated
- **403:** Insufficient role
- **404:** Item not found or not owned
- **409:** Item already deleted
  ```json
  {
    "status": "error",
    "error_code": 409,
    "error_type": "Conflict - Item Already Deleted",
    "error_code_detail": "ITEM_ALREADY_DELETED",
    "message": "Item is already deleted",
    "timestamp": "2024-12-17T10:30:00Z",
    "path": "/api/v1/items/507f1f77bcf86cd799439011"
  }
  ```
- **500:** Internal server error

---

## PATCH /items/:id/activate (Activate Item)

**Auth:** Required  
**Roles:** ADMIN, EDITOR (ownership check)  
**Purpose:** Restore soft-deleted item (Flow 6 extension)

### Request

None (itemId in URL)

### Action

- Sets `is_active = true`
- Clears `deleted_at = null`

### Response (200)

```json
{
  "status": "success",
  "message": "Item activated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Item Name",
    "description": "Item description",
    "item_type": "DIGITAL",
    "price": 99.99,
    "category": "Electronics",
    "is_active": true,
    "version": 1,
    "created_by": "user_id",
    "createdAt": "2024-12-17T10:30:00Z",
    "updatedAt": "2024-12-17T11:00:00Z",
    "deleted_at": null
  }
}
```

### Error Responses

- **400:** Invalid ID format
- **401:** Not authenticated
- **403:** Insufficient role
- **404:** Item not found or not owned
- **409:** Item already active
  ```json
  {
    "status": "error",
    "error_code": 409,
    "error_type": "Conflict - Item Already Active",
    "error_code_detail": "ITEM_ALREADY_ACTIVE",
    "message": "Item is already active",
    "timestamp": "2024-12-17T10:30:00Z",
    "path": "/api/v1/items/507f1f77bcf86cd799439011/activate"
  }
  ```
- **500:** Internal server error

---

## POST /items/batch (Batch Create Items)

**Auth:** Required  
**Roles:** ADMIN, EDITOR  
**Content-Type:** `application/json`  
**Purpose:** Create multiple items in a single request (for seed data management)

### Request

```json
{
  "items": [
    {
      "name": "Test Item 1",
      "description": "This is a test item description that meets the minimum length requirement of 10 characters.",
      "item_type": "DIGITAL",
      "price": 10.00,
      "category": "Electronics",
      "download_url": "https://example.com/file.zip",
      "file_size": 1024,
      "tags": ["seed", "v1.0"]
    },
    {
      "name": "Test Item 2",
      "description": "This is another test item description that meets the minimum length requirement of 10 characters.",
      "item_type": "PHYSICAL",
      "price": 20.00,
      "category": "Electronics",
      "weight": 1.0,
      "dimensions": {
        "length": 10.0,
        "width": 5.0,
        "height": 2.0
      },
      "tags": ["seed", "v1.0"]
    }
  ],
  "skip_existing": true
}
```

**Request Fields:**
- `items` (Array, required, 1-50 items) - Array of item objects (same schema as POST /items)
- `skip_existing` (Boolean, optional, default: false) - If true, skip items that already exist (idempotent)

**Item Schema:** Same as POST /items (all required/conditional fields apply)

### Response (200)

```json
{
  "status": "success",
  "created": 2,
  "skipped": 0,
  "failed": 0,
  "results": [
    {
      "item": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Test Item 1",
        "description": "...",
        "item_type": "DIGITAL",
        "price": 10.00,
        "category": "Electronics",
        "is_active": true,
        "version": 1,
        "created_by": "user_id",
        "createdAt": "2024-12-17T10:30:00Z",
        "updatedAt": "2024-12-17T10:30:00Z"
      },
      "status": "created"
    },
    {
      "item": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Test Item 2",
        "description": "...",
        "item_type": "PHYSICAL",
        "price": 20.00,
        "category": "Electronics",
        "is_active": true,
        "version": 1,
        "created_by": "user_id",
        "createdAt": "2024-12-17T10:30:00Z",
        "updatedAt": "2024-12-17T10:30:00Z"
      },
      "status": "created"
    }
  ],
  "errors": []
}
```

**Response Fields:**
- `created` (Number) - Count of items successfully created
- `skipped` (Number) - Count of items skipped (if `skip_existing: true` and item already exists)
- `failed` (Number) - Count of items that failed to create
- `results` (Array) - Array of result objects with `item` and `status` ("created" | "skipped" | "failed")
- `errors` (Array) - Array of error objects for failed items

### Error Responses

- **400:** Missing `items` array or invalid format
- **401:** Not authenticated
- **403:** Insufficient role (not ADMIN or EDITOR)
- **422:** 
  - Array length > 50
  - Validation errors for individual items
- **409:** Duplicate item (only if `skip_existing: false`)

**Note:** File uploads are NOT supported in batch endpoint. Use individual POST /items for file uploads.

---

## GET /items/count (Get Item Count)

**Auth:** Required  
**Roles:** ADMIN, EDITOR, VIEWER  
**Purpose:** Get count of items without fetching item data (for performance)

### Query Parameters

- `search` (String, optional) - Searches `name` and `description` (case-insensitive, partial match)
- `status` (Enum: `active` | `inactive`, optional) - Filters by `is_active`
- `category` (String, optional) - Filters by normalized category

### Response (200)

```json
{
  "status": "success",
  "count": 25,
  "filters": {
    "search": "laptop",
    "status": "active",
    "category": "Electronics"
  }
}
```

### RBAC Filtering

- **ADMIN:** Counts all items (no `created_by` filter)
- **VIEWER:** Counts all items (no `created_by` filter)
- **EDITOR:** Counts only own items (`created_by = userId`)

### Error Responses

- **401:** Not authenticated
- **422:** Invalid query parameters

---

## POST /items/check-exists (Check Item Existence)

**Auth:** Required  
**Roles:** ADMIN, EDITOR, VIEWER  
**Content-Type:** `application/json`  
**Purpose:** Batch check if multiple items exist by name and category

### Request

```json
{
  "items": [
    {
      "name": "Item One",
      "category": "Electronics"
    },
    {
      "name": "Item Two",
      "category": "Books"
    }
  ]
}
```

**Request Fields:**
- `items` (Array, required, 1-100 items) - Array of objects with `name` and `category`

### Response (200)

```json
{
  "status": "success",
  "results": [
    {
      "name": "Item One",
      "category": "Electronics",
      "exists": true,
      "item_id": "507f1f77bcf86cd799439011"
    },
    {
      "name": "Item Two",
      "category": "Books",
      "exists": false,
      "item_id": null
    }
  ]
}
```

**Matching Logic:**
- Uses normalized name (case-insensitive, trimmed)
- Uses normalized category (Title Case)
- Only checks active items (`is_active: true`)

### RBAC Filtering

- **ADMIN:** Can check any user's items
- **VIEWER:** Can check any user's items
- **EDITOR:** Can only check their own items

### Error Responses

- **400:** Missing `items` array or invalid format
- **401:** Not authenticated
- **422:** 
  - Array length > 100
  - Missing `name` or `category` in item objects

---

## GET /items/seed-status/:userId (Get Seed Data Status)

**Auth:** Required  
**Roles:** ADMIN, EDITOR, VIEWER  
**Purpose:** Check if user has all required seed items (for test data verification)

### Path Parameters

- `userId` (String, required) - User ID (ObjectId format)

### Query Parameters

- `seed_version` (String, optional) - Filter by seed version tag (e.g., "v1.0")

### Response (200)

```json
{
  "status": "success",
  "seed_complete": true,
  "total_items": 11,
  "required_count": 11,
  "missing_items": [],
  "seed_version": null
}
```

**Response Fields:**
- `seed_complete` (Boolean) - True if user has required seed items
- `total_items` (Number) - Count of seed items found (items with "seed" tag)
- `required_count` (Number) - Required count (default: 11, or based on seed_version)
- `missing_items` (Array) - Array of missing item names (if incomplete)
- `seed_version` (String | null) - Seed version if specified in query

**How it works:**
1. Identifies seed items by `tags` field containing `"seed"`
2. Optionally filters by version tag (e.g., `seed_version=v1.0` requires both `"seed"` and `"v1.0"` tags)
3. Counts items matching criteria for the specified user
4. Returns completion status (true if count >= required_count)

**Performance:** Single database count query (fast even with 10,000+ items)

### RBAC Filtering

- **ADMIN:** Can check any user's seed status
- **VIEWER:** Can check any user's seed status
- **EDITOR:** Can only check their own seed status (userId must match authenticated user)

### Error Responses

- **400:** Invalid `userId` format
- **401:** Not authenticated
- **403:** EDITOR trying to check another user's seed status
- **404:** User not found

---

## Ownership & Authorization

### Ownership Field

- **Field Name:** `created_by` (ObjectId reference to User)
- **Auto-set:** From authenticated user on item creation

### Visibility Rules

| Created By | Admin Can See | Same Editor Can See | Other Editor Can See | Viewer Can See |
|------------|---------------|---------------------|----------------------|----------------|
| Admin      | ✅ Yes        | ❌ No               | ❌ No                | ✅ Yes         |
| Editor     | ✅ Yes        | ✅ Yes              | ❌ No                | ✅ Yes         |

### Enforcement Logic

```javascript
// In itemService.getItems()
if (userId && role !== 'ADMIN' && role !== 'VIEWER') {
  query.created_by = userId; // EDITOR restriction
}
// ADMIN and VIEWER see all items
```

### Unauthorized Access Behavior

- **Role Violation** → `403 Forbidden`
- **Ownership Violation** → `404 Not Found` (prevents ID guessing)

---

**End of Item APIs**
