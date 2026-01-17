# P0 Endpoints - Critical Business Flows
## API Automation Testing Reference

**Priority:** P0 (Critical - Must Test)  
**Last Updated:** 2025-01-05  
**Purpose:** Core business endpoints required for application functionality

---

## Quick Reference

| Endpoint | Method | Purpose | Auth | Roles |
|----------|--------|---------|------|-------|
| `/api/v1/auth/login` | POST | User authentication | No | - |
| `/api/v1/auth/me` | GET | Checkpoint validation | Yes | All |
| `/api/v1/items` | POST | Create item | Yes | ADMIN, EDITOR |
| `/api/v1/items` | GET | List items (search/filter/sort/paginate) | Yes | All |
| `/api/v1/items/:id` | GET | Get single item | Yes | All |
| `/api/v1/items/:id` | PUT | Update item | Yes | ADMIN, EDITOR |
| `/api/v1/items/:id` | DELETE | Delete item (soft delete) | Yes | ADMIN, EDITOR |

---

## POST /api/v1/auth/login

**Purpose:** Authenticate user and get access token

### Request Schema

```json
{
  "email": "string (required, valid email format)",
  "password": "string (required, min 8 chars)",
  "rememberMe": "boolean (optional, default: false)"
}
```

### Response Schema (200)

```json
{
  "token": "string (JWT access token, 15 min expiry)",
  "user": {
    "_id": "string (ObjectId)",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string (enum: ADMIN | EDITOR | VIEWER)",
    "isActive": "boolean"
  }
}
```

**Note:** Refresh token set as httpOnly cookie (`refreshToken`)

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Email and password are required" |
| 401 | 401 | "Invalid email or password" / "Account is locked" / "Account deactivated" |
| 422 | 422 | "Email must be a string" / "Password must be a string" / "Password must be at least 8 characters long" / "Invalid email format" |
| 429 | 429 | Rate limit exceeded (account locked) |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Valid login | `{email: "user@example.com", password: "Password123"}` | 200, token + user object |
| Login with rememberMe | `{email: "user@example.com", password: "Password123", rememberMe: true}` | 200, token + user, refresh token expires in 30 days |
| Login without rememberMe | `{email: "user@example.com", password: "Password123", rememberMe: false}` | 200, token + user, refresh token expires in 7 days |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Missing email | `{password: "Password123"}` | 400, "Email and password are required" |
| Missing password | `{email: "user@example.com"}` | 400, "Email and password are required" |
| Invalid email format | `{email: "invalid", password: "Password123"}` | 422, "Invalid email format" |
| Password too short | `{email: "user@example.com", password: "Pass1"}` | 422, "Password must be at least 8 characters long" |
| Wrong password | `{email: "user@example.com", password: "WrongPass123"}` | 401, "Invalid email or password" |
| Non-existent email | `{email: "nonexistent@example.com", password: "Password123"}` | 401, "Invalid email or password" |
| Deactivated account | `{email: "deactivated@example.com", password: "Password123"}` | 401, "Account deactivated" |
| Invalid data type (email) | `{email: 123, password: "Password123"}` | 422, "Email must be a string" |
| Invalid data type (password) | `{email: "user@example.com", password: 123}` | 422, "Password must be a string" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Min password length | `{email: "user@example.com", password: "Pass1234"}` | 200, success (8 chars) |
| Empty password string | `{email: "user@example.com", password: ""}` | 400, "Password cannot be empty" |
| Email with special chars | `{email: "user+test@example.com", password: "Password123"}` | 200, success (valid email) |
| RememberMe as string | `{email: "user@example.com", password: "Password123", rememberMe: "true"}` | 200, treated as false (type coercion) |

---

## GET /api/v1/auth/me

**Purpose:** Get current authenticated user info (checkpoint validation)

### Request

**Headers:**
```
Authorization: Bearer <access_token>
```

### Response Schema (200)

```json
{
  "status": "success",
  "data": {
    "_id": "string (ObjectId)",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string (enum: ADMIN | EDITOR | VIEWER)",
    "isActive": "boolean",
    "createdAt": "string (ISO 8601 date)",
    "updatedAt": "string (ISO 8601 date)"
  }
}
```

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 401 | 401 | "Not authenticated" / "Invalid token" / "User not found" |
| 403 | 403 | "Account deactivated" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Valid token | `Authorization: Bearer <valid_token>` | 200, user data |
| ADMIN role | Valid ADMIN token | 200, role: "ADMIN" |
| EDITOR role | Valid EDITOR token | 200, role: "EDITOR" |
| VIEWER role | Valid VIEWER token | 200, role: "VIEWER" |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Missing token | No Authorization header | 401, "Not authenticated" |
| Invalid token | `Authorization: Bearer invalid_token` | 401, "Invalid token" |
| Expired token | `Authorization: Bearer <expired_token>` | 401, "Invalid token" |
| Deactivated user | Valid token for deactivated user | 403, "Account deactivated" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Token just expired | Token expired 1 second ago | 401, "Invalid token" |
| Malformed header | `Authorization: <token>` (missing Bearer) | 401, "Not authenticated" |

---

## POST /api/v1/items

**Purpose:** Create a new item

### Request Schema

**Content-Type:** `application/json` or `multipart/form-data`

**Required Fields:**
```json
{
  "name": "string (required, 3-100 chars, pattern: /^[a-zA-Z0-9\s\-_]+$/)",
  "description": "string (required, 10-500 chars)",
  "item_type": "string (required, enum: PHYSICAL | DIGITAL | SERVICE)",
  "price": "number (required, 0.01-999999.99, 2 decimal places)",
  "category": "string (required, 1-50 chars)"
}
```

**Conditional Fields (based on item_type):**

**If item_type = PHYSICAL:**
```json
{
  "weight": "number (required, > 0)",
  "dimensions": {
    "length": "number (required, > 0)",
    "width": "number (required, > 0)",
    "height": "number (required, > 0)"
  }
}
```

**If item_type = DIGITAL:**
```json
{
  "download_url": "string (required, valid URL)",
  "file_size": "number (required, >= 1)"
}
```

**If item_type = SERVICE:**
```json
{
  "duration_hours": "number (required, >= 1, integer)"
}
```

**Optional Fields:**
```json
{
  "tags": "array<string> (optional, max 10 items, each 1-30 chars, unique)",
  "embed_url": "string (optional, valid HTTP/HTTPS URL)",
  "file": "File (optional, multipart/form-data)"
}
```

### Business Rules

**Category-Item Type Compatibility:**
- `Electronics` → must be `PHYSICAL`
- `Software` → must be `DIGITAL`
- `Services` → must be `SERVICE`
- Other categories → any item_type allowed

**Price Ranges by Category:**
- `Electronics`: $10.00 - $50,000.00
- `Books`: $5.00 - $500.00
- `Services`: $25.00 - $10,000.00
- Other categories: $0.01 - $999,999.99

**RBAC:**
- ADMIN: Can create any item
- EDITOR: Can create items (ownership auto-set to creator)
- VIEWER: Cannot create (403 Forbidden)

**Duplicate Prevention:**
- Same `name` + `category` + `created_by` → 409 Conflict
- Case-insensitive name matching
- Category normalized to Title Case

### Response Schema (201)

```json
{
  "status": "success",
  "message": "Item created successfully",
  "data": {
    "_id": "string (ObjectId)",
    "name": "string",
    "description": "string",
    "item_type": "string (PHYSICAL | DIGITAL | SERVICE)",
    "price": "number",
    "category": "string (Title Case normalized)",
    "tags": "array<string>",
    "is_active": "boolean (default: true)",
    "version": "number (default: 1)",
    "created_by": "string (ObjectId)",
    "createdAt": "string (ISO 8601 date)",
    "updatedAt": "string (ISO 8601 date)",
    "deleted_at": "null",
    "weight": "number (if PHYSICAL)",
    "dimensions": {
      "length": "number",
      "width": "number",
      "height": "number"
    },
    "download_url": "string (if DIGITAL)",
    "file_size": "number (if DIGITAL)",
    "duration_hours": "number (if SERVICE)",
    "embed_url": "string | null",
    "file_path": "string | null",
    "file_metadata": {
      "original_name": "string",
      "content_type": "string",
      "size": "number",
      "uploaded_at": "string (ISO 8601 date)"
    } | null
  },
  "item_id": "string (ObjectId)"
}
```

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Electronics category must be Physical item type" / "Software category must be Digital item type" / "Services category must be Service item type" / "Electronics price must be between $10.00 and $50,000.00" / "Books price must be between $5.00 and $500.00" / "Services price must be between $25.00 and $10,000.00" |
| 401 | 401 | "Authentication required" |
| 403 | 403 | "Insufficient role" (VIEWER cannot create) |
| 409 | CONFLICT_ERROR | "Item with same name and category already exists" |
| 422 | 422 | "Name is required" / "Description is required" / "Name must be at least 3 characters" / "Description must be at least 10 characters" / "Weight is required for physical items" / "Download URL is required for digital items" / "Duration hours is required for service items" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Valid PHYSICAL item | `{name: "Laptop", description: "High-performance laptop", item_type: "PHYSICAL", category: "Electronics", price: 999.99, weight: 2.5, dimensions: {length: 35, width: 25, height: 2}}` | 201, item created |
| Valid DIGITAL item | `{name: "Software", description: "Digital software product", item_type: "DIGITAL", category: "Software", price: 99.99, download_url: "https://example.com/file.zip", file_size: 1024}` | 201, item created |
| Valid SERVICE item | `{name: "Consulting", description: "Professional consulting service", item_type: "SERVICE", category: "Services", price: 100.00, duration_hours: 2}` | 201, item created |
| With optional tags | `{...valid_item, tags: ["test", "seed"]}` | 201, item created with tags |
| With optional embed_url | `{...valid_item, embed_url: "https://example.com/embed"}` | 201, item created with embed_url |
| Min price (0.01) | `{...valid_item, price: 0.01}` | 201, success |
| Max price (999999.99) | `{...valid_item, price: 999999.99}` | 201, success |
| Min name length (3) | `{name: "ABC", ...valid_item}` | 201, success |
| Max name length (100) | `{name: "A".repeat(100), ...valid_item}` | 201, success |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Missing name | `{description: "...", item_type: "DIGITAL", ...}` | 422, "Name is required" |
| Missing description | `{name: "Item", item_type: "DIGITAL", ...}` | 422, "Description is required" |
| Missing item_type | `{name: "Item", description: "...", ...}` | 422, "Item type is required" |
| Missing price | `{name: "Item", description: "...", item_type: "DIGITAL", ...}` | 422, "Price is required" |
| Missing category | `{name: "Item", description: "...", item_type: "DIGITAL", price: 10, ...}` | 422, "Category is required" |
| Name too short | `{name: "AB", ...valid_item}` | 422, "Name must be at least 3 characters" |
| Name too long | `{name: "A".repeat(101), ...valid_item}` | 422, "Name must not exceed 100 characters" |
| Description too short | `{description: "Short", ...valid_item}` | 422, "Description must be at least 10 characters" |
| Description too long | `{description: "A".repeat(501), ...valid_item}` | 422, "Description must not exceed 500 characters" |
| Invalid item_type | `{item_type: "INVALID", ...valid_item}` | 422, "Item type must be PHYSICAL, DIGITAL, or SERVICE" |
| Price too low | `{price: 0.00, ...valid_item}` | 422, "Price must be at least $0.01" |
| Price too high | `{price: 1000000.00, ...valid_item}` | 422, "Price must not exceed $999,999.99" |
| PHYSICAL missing weight | `{item_type: "PHYSICAL", ...valid_item}` (no weight) | 422, "Weight is required for physical items" |
| PHYSICAL missing dimensions | `{item_type: "PHYSICAL", weight: 1, ...valid_item}` (no dimensions) | 422, "Length is required for physical items" |
| DIGITAL missing download_url | `{item_type: "DIGITAL", ...valid_item}` (no download_url) | 422, "Download URL is required for digital items" |
| DIGITAL missing file_size | `{item_type: "DIGITAL", download_url: "https://example.com/file.zip", ...valid_item}` (no file_size) | 422, "File size is required for digital items" |
| SERVICE missing duration_hours | `{item_type: "SERVICE", ...valid_item}` (no duration_hours) | 422, "Duration hours is required for service items" |
| Invalid category-item_type (Electronics + DIGITAL) | `{item_type: "DIGITAL", category: "Electronics", ...valid_item}` | 400, "Electronics category must be Physical item type" |
| Invalid category-item_type (Software + PHYSICAL) | `{item_type: "PHYSICAL", category: "Software", ...valid_item}` | 400, "Software category must be Digital item type" |
| Invalid category-item_type (Services + DIGITAL) | `{item_type: "DIGITAL", category: "Services", ...valid_item}` | 400, "Services category must be Service item type" |
| Electronics price too low | `{category: "Electronics", price: 9.99, ...valid_item}` | 400, "Electronics price must be between $10.00 and $50,000.00" |
| Electronics price too high | `{category: "Electronics", price: 50001.00, ...valid_item}` | 400, "Electronics price must be between $10.00 and $50,000.00" |
| Duplicate item | Same name + category + user | 409, "Item with same name and category already exists" |
| No authentication | No Authorization header | 401, "Authentication required" |
| VIEWER role | Valid VIEWER token | 403, "Insufficient role" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Price at min boundary (0.01) | `{price: 0.01, ...valid_item}` | 201, success |
| Price at max boundary (999999.99) | `{price: 999999.99, ...valid_item}` | 201, success |
| Price just below min (0.00) | `{price: 0.00, ...valid_item}` | 422, validation error |
| Price just above max (1000000.00) | `{price: 1000000.00, ...valid_item}` | 422, validation error |
| Name at min boundary (3 chars) | `{name: "ABC", ...valid_item}` | 201, success |
| Name at max boundary (100 chars) | `{name: "A".repeat(100), ...valid_item}` | 201, success |
| Description at min boundary (10 chars) | `{description: "1234567890", ...valid_item}` | 201, success |
| Description at max boundary (500 chars) | `{description: "A".repeat(500), ...valid_item}` | 201, success |
| Category case variations | `{category: "electronics", ...valid_item}` | 201, normalized to "Electronics" |
| Tags max count (10) | `{tags: ["1","2","3","4","5","6","7","8","9","10"], ...valid_item}` | 201, success |
| Tags over max (11) | `{tags: ["1","2","3","4","5","6","7","8","9","10","11"], ...valid_item}` | 422, "Tags must be unique, max 10 tags" |
| Duplicate tags | `{tags: ["test", "test"], ...valid_item}` | 422, "Tags must be unique" |
| Empty tags array | `{tags: [], ...valid_item}` | 201, success (default) |
| Invalid URL format | `{download_url: "not-a-url", ...valid_item}` | 422, "Download URL is required for digital items and must be a valid URL" |
| Weight at boundary (0.01) | `{weight: 0.01, ...valid_item}` | 201, success |
| Weight at zero | `{weight: 0, ...valid_item}` | 422, "Weight must be greater than 0" |
| Duration hours at boundary (1) | `{duration_hours: 1, ...valid_item}` | 201, success |
| Duration hours below boundary (0) | `{duration_hours: 0, ...valid_item}` | 422, "Duration hours is required for service items and must be at least 1" |

---

## GET /api/v1/items

**Purpose:** List items with search, filter, sort, and pagination

### Request

**Query Parameters:**

| Parameter | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| `search` | string | No | - | Searches name and description (case-insensitive, partial match) |
| `status` | string | No | `active` | Enum: `active` \| `inactive` |
| `category` | string | No | - | Filters by normalized category (case-insensitive) |
| `sort_by` | string or array | No | `['createdAt']` | Fields: `name`, `category`, `price`, `createdAt` |
| `sort_order` | string or array | No | `['desc']` | Values: `asc` \| `desc` |
| `page` | number | No | `1` | Min: `1` |
| `limit` | number | No | `20` | Min: `1`, Max: `100` |

### Response Schema (200)

```json
{
  "status": "success",
  "items": [
    {
      "_id": "string (ObjectId)",
      "name": "string",
      "description": "string",
      "item_type": "string",
      "price": "number",
      "category": "string",
      "tags": "array<string>",
      "is_active": "boolean",
      "version": "number",
      "created_by": "string (ObjectId)",
      "createdAt": "string (ISO 8601 date)",
      "updatedAt": "string (ISO 8601 date)",
      "deleted_at": "string | null",
      "weight": "number (if PHYSICAL)",
      "dimensions": {
        "length": "number",
        "width": "number",
        "height": "number"
      },
      "download_url": "string (if DIGITAL)",
      "file_size": "number (if DIGITAL)",
      "duration_hours": "number (if SERVICE)",
      "embed_url": "string | null",
      "file_path": "string | null"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "total_pages": "number",
    "has_next": "boolean",
    "has_prev": "boolean"
  }
}
```

### Business Rules

**RBAC Filtering:**
- ADMIN: Sees all items (no `created_by` filter)
- VIEWER: Sees all items (no `created_by` filter)
- EDITOR: Sees only own items (`created_by = userId`)

**Default Behavior:**
- If no params: `page=1`, `limit=20`, `sort_by=['createdAt']`, `sort_order=['desc']`
- If `page > total_pages`: Redirects to last valid page

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 401 | 401 | "Authentication required" |
| 422 | 422 | "Invalid query parameters" / "Invalid sort_by field" / "Invalid sort_order value" / "Page must be at least 1" / "Limit must be between 1 and 100" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| No parameters | `GET /api/v1/items` | 200, default pagination (page=1, limit=20) |
| With search | `?search=laptop` | 200, items matching "laptop" in name/description |
| With category filter | `?category=Electronics` | 200, items with category "Electronics" |
| With status filter | `?status=inactive` | 200, inactive items only |
| With pagination | `?page=2&limit=10` | 200, page 2 with 10 items per page |
| With sort | `?sort_by=price&sort_order=asc` | 200, items sorted by price ascending |
| Multiple sort fields | `?sort_by=["name","price"]&sort_order=["asc","desc"]` | 200, multi-field sort |
| ADMIN sees all | ADMIN token, no filter | 200, all items from all users |
| EDITOR sees own | EDITOR token, no filter | 200, only items where created_by = userId |
| VIEWER sees all | VIEWER token, no filter | 200, all items from all users |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| No authentication | No Authorization header | 401, "Authentication required" |
| Invalid page (0) | `?page=0` | 422, "Page must be at least 1" |
| Invalid page (negative) | `?page=-1` | 422, "Page must be at least 1" |
| Invalid limit (0) | `?limit=0` | 422, "Limit must be between 1 and 100" |
| Invalid limit (over max) | `?limit=101` | 422, "Limit must be between 1 and 100" |
| Invalid sort_by field | `?sort_by=invalid_field` | 422, "Invalid sort_by field" |
| Invalid sort_order | `?sort_by=name&sort_order=invalid` | 422, "Invalid sort_order value" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Page beyond total | `?page=9999` | 200, redirects to last valid page |
| Min limit (1) | `?limit=1` | 200, 1 item per page |
| Max limit (100) | `?limit=100` | 200, 100 items per page |
| Empty results | Search for non-existent term | 200, empty items array, total=0 |
| Case-insensitive search | `?search=LAPTOP` | 200, matches "laptop", "Laptop", "LAPTOP" |
| Category case variations | `?category=electronics` | 200, matches "Electronics" (normalized) |
| Special characters in search | `?search=item-name_123` | 200, matches items with special chars |

---

## GET /api/v1/items/:id

**Purpose:** Get single item by ID

### Request

**Path Parameter:**
- `id` (string, required) - Item ID (ObjectId format, 24 hex chars)

**Headers:**
```
Authorization: Bearer <access_token>
```

### Response Schema (200)

```json
{
  "status": "success",
  "message": "Item retrieved successfully",
  "data": {
    "_id": "string (ObjectId)",
    "name": "string",
    "description": "string",
    "item_type": "string",
    "price": "number",
    "category": "string",
    "tags": "array<string>",
    "is_active": "boolean",
    "version": "number",
    "created_by": "string (ObjectId)",
    "createdAt": "string (ISO 8601 date)",
    "updatedAt": "string (ISO 8601 date)",
    "deleted_at": "string | null",
    "weight": "number (if PHYSICAL)",
    "dimensions": {
      "length": "number",
      "width": "number",
      "height": "number"
    },
    "download_url": "string (if DIGITAL)",
    "file_size": "number (if DIGITAL)",
    "duration_hours": "number (if SERVICE)",
    "embed_url": "string | null",
    "file_path": "string | null",
    "file_metadata": {
      "original_name": "string",
      "content_type": "string",
      "size": "number",
      "uploaded_at": "string (ISO 8601 date)"
    } | null
  }
}
```

**Note:** Includes inactive/deleted items (for View button functionality)

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 401 | 401 | "Authentication required" |
| 422 | 422 | "Invalid item ID format. Expected 24-character hexadecimal string." |
| 404 | 404 | "Item not found" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Valid item ID | `GET /api/v1/items/507f1f77bcf86cd799439011` | 200, item data |
| Active item | Valid ID for active item | 200, is_active: true |
| Inactive item | Valid ID for inactive item | 200, is_active: false, deleted_at set |
| ADMIN access | ADMIN token, any item | 200, item data |
| EDITOR own item | EDITOR token, own item | 200, item data |
| VIEWER any item | VIEWER token, any item | 200, item data |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Invalid ID format | `GET /api/v1/items/invalid-id` | 422, "Invalid item ID format" |
| Non-existent ID | `GET /api/v1/items/507f1f77bcf86cd799439999` | 404, "Item not found" |
| No authentication | No Authorization header | 401, "Authentication required" |
| EDITOR other's item | EDITOR token, other user's item | 404, "Item not found" (security: doesn't reveal ownership) |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| ID too short (23 chars) | `GET /api/v1/items/507f1f77bcf86cd79943901` | 422, "Invalid item ID format" |
| ID too long (25 chars) | `GET /api/v1/items/507f1f77bcf86cd7994390111` | 422, "Invalid item ID format" |
| ID with invalid chars | `GET /api/v1/items/507f1f77bcf86cd79943901g` | 422, "Invalid item ID format" |
| Soft-deleted item | Valid ID for soft-deleted item | 200, is_active: false, deleted_at set |

---

## PUT /api/v1/items/:id

**Purpose:** Update an existing item

### Request Schema

**Path Parameter:**
- `id` (string, required) - Item ID (ObjectId format)

**Required Fields:**
```json
{
  "version": "number (required, for optimistic locking)"
}
```

**Optional Fields (all fields from POST are optional for update):**
```json
{
  "name": "string (3-100 chars)",
  "description": "string (10-500 chars)",
  "item_type": "string (enum: PHYSICAL | DIGITAL | SERVICE)",
  "price": "number (0.01-999999.99)",
  "category": "string (1-50 chars)",
  "tags": "array<string>",
  "weight": "number (if PHYSICAL)",
  "dimensions": {
    "length": "number",
    "width": "number",
    "height": "number"
  },
  "download_url": "string (if DIGITAL)",
  "file_size": "number (if DIGITAL)",
  "duration_hours": "number (if SERVICE)",
  "embed_url": "string",
  "file": "File (multipart/form-data, replaces existing file)"
}
```

### Business Rules

**Ownership:**
- ADMIN: Can update any item (bypasses ownership check)
- EDITOR: Can update only own items (`created_by = userId`)
- VIEWER: Cannot update (403 Forbidden)

**Optimistic Locking:**
- Must provide current `version` number
- If version mismatch → 409 Conflict
- Version auto-incremented on successful update

**Item Type Change:**
- Can change `item_type` (e.g., PHYSICAL → DIGITAL)
- Conditional fields must match new `item_type`
- Old conditional fields cleared automatically

### Response Schema (200)

```json
{
  "status": "success",
  "message": "Item updated successfully",
  "data": {
    "_id": "string (ObjectId)",
    "name": "string",
    "description": "string",
    "item_type": "string",
    "price": "number",
    "category": "string",
    "tags": "array<string>",
    "is_active": "boolean",
    "version": "number (incremented)",
    "created_by": "string (ObjectId)",
    "createdAt": "string (ISO 8601 date)",
    "updatedAt": "string (ISO 8601 date, updated)",
    "deleted_at": "string | null"
  }
}
```

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Invalid item ID format" |
| 401 | 401 | "Authentication required" |
| 403 | 403 | "Insufficient role" (VIEWER) |
| 404 | 404 | "Item not found" / "Item with ID ... not found" |
| 409 | CONFLICT_ERROR | "Item was modified by another user" (version conflict) |
| 422 | 422 | Validation errors (same as POST) |

**Version Conflict Response (409):**
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

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Update name | `{version: 1, name: "Updated Name"}` | 200, name updated, version=2 |
| Update price | `{version: 1, price: 199.99}` | 200, price updated, version=2 |
| Update multiple fields | `{version: 1, name: "New", price: 299.99}` | 200, both updated, version=2 |
| Change item_type | `{version: 1, item_type: "DIGITAL", download_url: "...", file_size: 1024}` | 200, type changed, conditional fields updated |
| ADMIN updates any item | ADMIN token, any item ID | 200, success |
| EDITOR updates own item | EDITOR token, own item ID | 200, success |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Missing version | `{name: "Updated"}` | 422, "Version is required" |
| Invalid version | `{version: "one"}` | 422, validation error |
| Version mismatch | `{version: 1}` (item is at version 2) | 409, "Item was modified by another user" |
| Invalid ID format | `PUT /api/v1/items/invalid` | 400, "Invalid item ID format" |
| Non-existent item | Valid format, non-existent ID | 404, "Item not found" |
| No authentication | No Authorization header | 401, "Authentication required" |
| VIEWER role | VIEWER token | 403, "Insufficient role" |
| EDITOR other's item | EDITOR token, other user's item | 404, "Item not found" (security) |
| Update deleted item | Valid ID, item is soft-deleted | 404, "Item not found" |
| Invalid field values | `{version: 1, name: "AB"}` | 422, "Name must be at least 3 characters" |
| Invalid category-item_type | `{version: 1, item_type: "DIGITAL", category: "Electronics"}` | 400, "Electronics category must be Physical item type" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Version at boundary (1) | `{version: 1}` (item at version 1) | 200, success |
| Version just below | `{version: 0}` | 422, validation error |
| Concurrent updates | Two requests with same version | One succeeds (200), one fails (409) |
| Update to same value | `{version: 1, name: "Same Name"}` (name unchanged) | 200, success, version incremented |
| Change type clears old fields | PHYSICAL → DIGITAL (weight/dimensions cleared) | 200, old fields undefined |

---

## DELETE /api/v1/items/:id

**Purpose:** Soft delete an item (sets is_active=false, deleted_at=timestamp)

### Request

**Path Parameter:**
- `id` (string, required) - Item ID (ObjectId format)

**Headers:**
```
Authorization: Bearer <access_token>
```

### Business Rules

**Ownership:**
- ADMIN: Can delete any item
- EDITOR: Can delete only own items
- VIEWER: Cannot delete (403 Forbidden)

**Soft Delete:**
- Sets `is_active = false`
- Sets `deleted_at = current timestamp`
- Item remains in database
- Can be restored via PATCH /items/:id/activate

### Response Schema (200)

```json
{
  "status": "success",
  "message": "Item deleted successfully",
  "data": {
    "_id": "string (ObjectId)",
    "name": "string",
    "description": "string",
    "item_type": "string",
    "price": "number",
    "category": "string",
    "is_active": "boolean (false)",
    "version": "number",
    "created_by": "string (ObjectId)",
    "createdAt": "string (ISO 8601 date)",
    "updatedAt": "string (ISO 8601 date, updated)",
    "deleted_at": "string (ISO 8601 date, set)"
  }
}
```

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Invalid item ID format" |
| 401 | 401 | "Authentication required" |
| 403 | 403 | "Insufficient role" (VIEWER) |
| 404 | 404 | "Item not found" / "Item with ID ... not found" |
| 409 | CONFLICT_ERROR | "Item is already deleted" |
| 500 | 500 | Internal server error |

**Already Deleted Response (409):**
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

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Delete active item | `DELETE /api/v1/items/507f1f77bcf86cd799439011` | 200, is_active: false, deleted_at set |
| ADMIN deletes any item | ADMIN token, any item ID | 200, success |
| EDITOR deletes own item | EDITOR token, own item ID | 200, success |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Invalid ID format | `DELETE /api/v1/items/invalid` | 400, "Invalid item ID format" |
| Non-existent item | Valid format, non-existent ID | 404, "Item not found" |
| No authentication | No Authorization header | 401, "Authentication required" |
| VIEWER role | VIEWER token | 403, "Insufficient role" |
| EDITOR other's item | EDITOR token, other user's item | 404, "Item not found" (security) |
| Already deleted | Delete same item twice | 409, "Item is already deleted" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Delete immediately after create | Create → Delete | 200, success |
| Delete then try to get | Delete → GET | 200, is_active: false (GET includes inactive) |
| Delete then try to update | Delete → PUT | 404, "Item not found" (cannot update deleted) |

---

## Global Error Response Format

All error responses follow this structure:

```json
{
  "status": "error",
  "error_code": 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500,
  "error_type": "Error Type String",
  "message": "Human-readable error message",
  "timestamp": "2024-12-17T10:30:00Z",
  "path": "/api/v1/items"
}
```

**Special Error Fields (for specific errors):**
- Version conflict: `current_version`, `provided_version`
- Duplicate: `error_code_detail: "DUPLICATE"`

---

## Authentication Requirements

**Access Token:**
- Type: JWT
- Expiry: 15 minutes
- Header: `Authorization: Bearer <token>`
- Storage: React state (memory), NOT localStorage

**Refresh Token:**
- Type: JWT
- Storage: httpOnly cookie (`refreshToken`)
- Expiry: 7 days (default) or 30 days (if rememberMe=true)

**Token Lifecycle:**
- Access token expires → Frontend auto-refreshes via `/api/v1/auth/refresh`
- Refresh token expires → User must re-login

---

## RBAC Summary

| Role | Create | Read (Own) | Read (All) | Update (Own) | Update (All) | Delete (Own) | Delete (All) |
|------|--------|------------|------------|--------------|--------------|--------------|--------------|
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **EDITOR** | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| **VIEWER** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Note:** "Own" means `created_by = userId`. ADMIN bypasses ownership checks.

---

**End of P0 Endpoints**
