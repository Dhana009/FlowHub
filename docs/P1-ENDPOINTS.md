# P1 Endpoints - Important Features
## API Automation Testing Reference

**Priority:** P1 (Important - Should Test)  
**Last Updated:** 2025-01-05  
**Purpose:** Secondary features and supporting endpoints

---

## Quick Reference

| Endpoint | Method | Purpose | Auth | Roles |
|----------|--------|---------|------|-------|
| `/api/v1/auth/refresh` | POST | Refresh access token | No (cookie) | - |
| `/api/v1/auth/signup` | POST | User registration | No | - |
| `/api/v1/auth/signup/request-otp` | POST | Request signup OTP | No | - |
| `/api/v1/auth/signup/verify-otp` | POST | Verify signup OTP | No | - |
| `/api/v1/auth/forgot-password/reset` | POST | Reset password | No | - |
| `/api/v1/items/:id/activate` | PATCH | Activate deleted item | Yes | ADMIN, EDITOR |
| `/api/v1/items/batch` | POST | Batch create items | Yes | ADMIN, EDITOR |
| `/api/v1/items/count` | GET | Get item count | Yes | All |
| `/api/v1/items/check-exists` | POST | Check item existence | Yes | All |

---

## POST /api/v1/auth/refresh

**Purpose:** Get new access token using refresh token cookie

### Request

**Headers:**
- Refresh token sent via httpOnly cookie (`refreshToken`)
- No Authorization header required

### Response Schema (200)

```json
{
  "token": "string (new JWT access token, 15 min expiry)",
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

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 401 | 401 | "Refresh token not found" / "Refresh token expired" / "Invalid refresh token" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Valid refresh token | Valid refresh token cookie | 200, new access token + user |
| Refresh after access token expiry | Access token expired, valid refresh token | 200, new access token |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| No refresh token cookie | No cookie | 401, "Refresh token not found" |
| Expired refresh token | Expired cookie | 401, "Refresh token expired" |
| Invalid refresh token | Invalid token in cookie | 401, "Invalid refresh token" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Refresh token just expired | Token expired 1 second ago | 401, "Refresh token expired" |
| Multiple refresh calls | Call refresh multiple times | 200, new token each time (token rotation) |

---

## POST /api/v1/auth/signup

**Purpose:** Register new user account

### Request Schema

```json
{
  "firstName": "string (required, 1-50 chars, letters/spaces/hyphens only)",
  "lastName": "string (required, 1-50 chars, letters/spaces/hyphens only)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 8 chars, must contain: uppercase, lowercase, number, special char)",
  "otp": "string (required, 6 digits, must be verified via /signup/verify-otp first)",
  "role": "string (optional, enum: ADMIN | EDITOR | VIEWER, default: EDITOR)"
}
```

### Response Schema (201)

```json
{
  "token": "string (JWT access token)",
  "user": {
    "_id": "string (ObjectId)",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string (default: EDITOR)",
    "isActive": "boolean (true)",
    "createdAt": "string (ISO 8601 date)"
  }
}
```

**Note:** Refresh token automatically set as httpOnly cookie

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Missing required fields" |
| 409 | 409 | "Email already registered" |
| 422 | 422 | "Invalid email format" / "Invalid name format" / "Invalid OTP format" / "Password must be at least 8 characters long" / "Password must contain uppercase, lowercase, number, and special character" / "Invalid role enum value" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Valid signup | All required fields with valid OTP | 201, token + user, role=EDITOR |
| Signup with ADMIN role | `{...valid, role: "ADMIN"}` | 201, role=ADMIN |
| Signup with EDITOR role | `{...valid, role: "EDITOR"}` | 201, role=EDITOR |
| Signup with VIEWER role | `{...valid, role: "VIEWER"}` | 201, role=VIEWER |
| Signup without role | `{...valid}` (no role field) | 201, role=EDITOR (default) |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Missing firstName | `{lastName: "...", email: "...", ...}` | 400, "Missing required fields" |
| Missing lastName | `{firstName: "...", email: "...", ...}` | 400, "Missing required fields" |
| Missing email | `{firstName: "...", lastName: "...", ...}` | 400, "Missing required fields" |
| Missing password | `{firstName: "...", lastName: "...", email: "...", ...}` | 400, "Missing required fields" |
| Missing OTP | `{firstName: "...", lastName: "...", email: "...", password: "...", ...}` | 400, "Missing required fields" |
| Invalid email format | `{email: "invalid", ...valid}` | 422, "Invalid email format" |
| Password too short | `{password: "Pass1", ...valid}` | 422, "Password must be at least 8 characters long" |
| Password missing uppercase | `{password: "password123!", ...valid}` | 422, "Password must contain uppercase, lowercase, number, and special character" |
| Password missing lowercase | `{password: "PASSWORD123!", ...valid}` | 422, "Password must contain uppercase, lowercase, number, and special character" |
| Password missing number | `{password: "Password!", ...valid}` | 422, "Password must contain uppercase, lowercase, number, and special character" |
| Password missing special char | `{password: "Password123", ...valid}` | 422, "Password must contain uppercase, lowercase, number, and special character" |
| Invalid OTP format | `{otp: "12345", ...valid}` | 422, "Invalid OTP format" |
| Unverified OTP | Valid format but not verified | 404, "OTP not found or expired" / 401, "Invalid OTP" |
| Email already registered | Existing email | 409, "Email already registered" |
| Invalid role | `{role: "INVALID", ...valid}` | 422, "Invalid role enum value" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Min name length (1 char) | `{firstName: "A", ...valid}` | 201, success |
| Max name length (50 chars) | `{firstName: "A".repeat(50), ...valid}` | 201, success |
| Name with hyphen | `{firstName: "Mary-Jane", ...valid}` | 201, success |
| Password exactly 8 chars | `{password: "Pass123!", ...valid}` | 201, success |
| OTP exactly 6 digits | `{otp: "123456", ...valid}` | 201, success (if verified) |

---

## POST /api/v1/auth/signup/request-otp

**Purpose:** Request OTP for signup verification

### Request Schema

```json
{
  "email": "string (required, valid email format)"
}
```

### Response Schema (200)

```json
{
  "message": "string (OTP sent successfully)",
  "expiresIn": "number (10 minutes)"
}
```

**Development Mode Only:**
```json
{
  "message": "OTP sent successfully",
  "expiresIn": 10,
  "otp": "string (6 digits)"
}
```

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Email is required" |
| 422 | 422 | "Invalid email format" |
| 429 | 429 | "Too many OTP requests" (15 minute cooldown) |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Valid email | `{email: "newuser@example.com"}` | 200, OTP sent |
| New email | Email not registered | 200, OTP sent |
| Existing email | Email already registered | 200, OTP sent (doesn't reveal if exists) |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Missing email | `{}` | 400, "Email is required" |
| Invalid email format | `{email: "invalid"}` | 422, "Invalid email format" |
| Rate limit exceeded | Multiple requests within 15 min | 429, "Too many OTP requests" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Email with plus sign | `{email: "user+test@example.com"}` | 200, success |
| Rate limit boundary | Wait 15 minutes between requests | 200, success |

---

## POST /api/v1/auth/signup/verify-otp

**Purpose:** Verify OTP for signup

### Request Schema

```json
{
  "email": "string (required, valid email format)",
  "otp": "string (required, 6 digits)"
}
```

### Response Schema (200)

```json
{
  "message": "string (OTP verified successfully)",
  "verified": "boolean (true)"
}
```

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Email and OTP are required" |
| 422 | 422 | "Invalid email format" / "Invalid OTP format" |
| 404 | 404 | "OTP not found or expired" |
| 401 | 401 | "Invalid OTP" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Valid OTP | `{email: "user@example.com", otp: "123456"}` (valid OTP) | 200, verified: true |
| OTP just created | Verify immediately after request | 200, verified: true |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Missing email | `{otp: "123456"}` | 400, "Email and OTP are required" |
| Missing OTP | `{email: "user@example.com"}` | 400, "Email and OTP are required" |
| Invalid email format | `{email: "invalid", otp: "123456"}` | 422, "Invalid email format" |
| Invalid OTP format | `{email: "user@example.com", otp: "12345"}` | 422, "Invalid OTP format" |
| Wrong OTP | `{email: "user@example.com", otp: "999999"}` | 401, "Invalid OTP" |
| Expired OTP | OTP older than 10 minutes | 404, "OTP not found or expired" |
| Non-existent OTP | OTP never requested | 404, "OTP not found or expired" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| OTP at expiry boundary | Verify at 10 minutes | 200, success (if within window) |
| OTP just expired | Verify at 10:01 minutes | 404, "OTP not found or expired" |

---

## POST /api/v1/auth/forgot-password/reset

**Purpose:** Reset password using verified OTP

### Request Schema

```json
{
  "email": "string (required, valid email format)",
  "otp": "string (required, 6 digits, must be verified via /forgot-password/verify-otp first)",
  "newPassword": "string (required, min 8 chars, must contain: uppercase, lowercase, number, special char)"
}
```

### Response Schema (200)

```json
{
  "message": "string (Password reset successfully)"
}
```

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Email, OTP, and newPassword are required" |
| 422 | 422 | "Invalid email format" / "Invalid OTP format" / "Password must be at least 8 characters long" / "Password must contain uppercase, lowercase, number, and special character" |
| 404 | 404 | "OTP not found or expired" |
| 401 | 401 | "Invalid OTP" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Valid password reset | All fields with valid verified OTP | 200, "Password reset successfully" |
| Reset with strong password | `{newPassword: "NewPass123!"}` | 200, success |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Missing email | `{otp: "...", newPassword: "..."}` | 400, "Email, OTP, and newPassword are required" |
| Missing OTP | `{email: "...", newPassword: "..."}` | 400, "Email, OTP, and newPassword are required" |
| Missing newPassword | `{email: "...", otp: "..."}` | 400, "Email, OTP, and newPassword are required" |
| Invalid email format | `{email: "invalid", ...valid}` | 422, "Invalid email format" |
| Invalid OTP format | `{otp: "12345", ...valid}` | 422, "Invalid OTP format" |
| Password too short | `{newPassword: "Pass1", ...valid}` | 422, "Password must be at least 8 characters long" |
| Password missing requirements | `{newPassword: "password", ...valid}` | 422, "Password must contain uppercase, lowercase, number, and special character" |
| Unverified OTP | Valid format but not verified | 404, "OTP not found or expired" / 401, "Invalid OTP" |
| Wrong OTP | `{otp: "999999", ...valid}` | 401, "Invalid OTP" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Password exactly 8 chars | `{newPassword: "Pass123!", ...valid}` | 200, success |
| Same password as before | Reset to same password | 200, success (allowed) |

---

## PATCH /api/v1/items/:id/activate

**Purpose:** Activate (restore) a soft-deleted item

### Request

**Path Parameter:**
- `id` (string, required) - Item ID (ObjectId format)

**Headers:**
```
Authorization: Bearer <access_token>
```

### Business Rules

**Ownership:**
- ADMIN: Can activate any item
- EDITOR: Can activate only own items
- VIEWER: Cannot activate (403 Forbidden)

**Action:**
- Sets `is_active = true`
- Clears `deleted_at = null`

### Response Schema (200)

```json
{
  "status": "success",
  "message": "Item activated successfully",
  "data": {
    "_id": "string (ObjectId)",
    "name": "string",
    "description": "string",
    "item_type": "string",
    "price": "number",
    "category": "string",
    "is_active": "boolean (true)",
    "version": "number",
    "created_by": "string (ObjectId)",
    "createdAt": "string (ISO 8601 date)",
    "updatedAt": "string (ISO 8601 date, updated)",
    "deleted_at": "null"
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
| 409 | CONFLICT_ERROR | "Item is already active" |
| 500 | 500 | Internal server error |

**Already Active Response (409):**
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

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Activate deleted item | `PATCH /api/v1/items/:id/activate` (item is soft-deleted) | 200, is_active: true, deleted_at: null |
| ADMIN activates any item | ADMIN token, any item ID | 200, success |
| EDITOR activates own item | EDITOR token, own item ID | 200, success |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Invalid ID format | `PATCH /api/v1/items/invalid/activate` | 400, "Invalid item ID format" |
| Non-existent item | Valid format, non-existent ID | 404, "Item not found" |
| No authentication | No Authorization header | 401, "Authentication required" |
| VIEWER role | VIEWER token | 403, "Insufficient role" |
| EDITOR other's item | EDITOR token, other user's item | 404, "Item not found" (security) |
| Already active | Activate already active item | 409, "Item is already active" |
| Never deleted | Activate item that was never deleted | 409, "Item is already active" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Activate immediately after delete | Delete → Activate | 200, success |
| Activate then try to delete | Activate → Delete | 200, success (can delete again) |

---

## POST /api/v1/items/batch

**Purpose:** Create multiple items in one request

### Request Schema

```json
{
  "items": "array<object> (required, 1-100 items)",
  "skip_existing": "boolean (optional, default: false)"
}
```

Each item in array follows same schema as `POST /api/v1/items` (without file upload support).

### Response Schema (201)

```json
{
  "status": "success",
  "message": "string (Batch creation completed)",
  "created": "number (count of created items)",
  "skipped": "number (count of skipped items, if skip_existing=true)",
  "failed": "number (count of failed items)",
  "results": [
    {
      "index": "number",
      "status": "string (created | skipped | failed)",
      "item": "object (if created)",
      "error": "string (if failed)"
    }
  ]
}
```

### Business Rules

**RBAC:**
- ADMIN: Can create any items
- EDITOR: Can create items (ownership auto-set to creator)
- VIEWER: Cannot create (403 Forbidden)

**Duplicate Handling:**
- If `skip_existing=true`: Skips duplicates (same name + category + user), returns skipped count
- If `skip_existing=false`: Returns 409 for duplicate items

**Limits:**
- Max 100 items per batch
- File uploads not supported (items array only)

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Items array is required" / "Items array must contain 1-100 items" |
| 401 | 401 | "Authentication required" |
| 403 | 403 | "Insufficient role" (VIEWER) |
| 422 | 422 | Validation errors (same as POST /items) |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Valid batch (1 item) | `{items: [{...valid_item}]}` | 201, created: 1 |
| Valid batch (10 items) | `{items: [{...valid_item}, ...]}` (10 items) | 201, created: 10 |
| Valid batch (100 items) | `{items: [{...valid_item}, ...]}` (100 items) | 201, created: 100 |
| Batch with skip_existing | `{items: [...], skip_existing: true}` (some duplicates) | 201, created: X, skipped: Y |
| Mixed item types | `{items: [{...physical}, {...digital}, {...service}]}` | 201, all created |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Missing items array | `{}` | 400, "Items array is required" |
| Empty items array | `{items: []}` | 400, "Items array must contain 1-100 items" |
| Over 100 items | `{items: [...101 items]}` | 400, "Items array must contain 1-100 items" |
| Invalid item in batch | `{items: [{name: "AB", ...}]}` (name too short) | 422, validation error for that item |
| Duplicate without skip | `{items: [{...item1}, {...item1}]}` (same name+category) | 409, conflict error |
| No authentication | No Authorization header | 401, "Authentication required" |
| VIEWER role | VIEWER token | 403, "Insufficient role" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Batch with 1 item | `{items: [{...valid_item}]}` | 201, created: 1 |
| Batch with 100 items | `{items: [{...valid_item}, ...]}` (100 items) | 201, created: 100 |
| Partial success | Some items valid, some invalid | 201, created: X, failed: Y |
| All duplicates with skip | `{items: [{...existing}, {...existing}], skip_existing: true}` | 201, created: 0, skipped: 2 |

---

## GET /api/v1/items/count

**Purpose:** Get count of items without fetching items

### Request

**Query Parameters:**

| Parameter | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| `status` | string | No | `active` | Enum: `active` \| `inactive` |
| `category` | string | No | - | Filters by normalized category |
| `created_by` | string | No | - | Filters by user ID (ObjectId) |

**Headers:**
```
Authorization: Bearer <access_token>
```

### Business Rules

**RBAC Filtering:**
- ADMIN: Can count all items (ignores `created_by` filter if provided)
- VIEWER: Can count all items
- EDITOR: Auto-filtered to own items (`created_by = userId`), `created_by` param ignored

### Response Schema (200)

```json
{
  "status": "success",
  "count": "number (total count matching filters)"
}
```

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 401 | 401 | "Authentication required" |
| 422 | 422 | "Invalid query parameters" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Count all active | `GET /api/v1/items/count` | 200, count: X |
| Count inactive | `?status=inactive` | 200, count: Y |
| Count by category | `?category=Electronics` | 200, count: Z |
| Count by user | `?created_by=507f1f77bcf86cd799439011` | 200, count: W |
| ADMIN counts all | ADMIN token, no filter | 200, count of all items |
| EDITOR counts own | EDITOR token, no filter | 200, count of own items only |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| No authentication | No Authorization header | 401, "Authentication required" |
| Invalid status | `?status=invalid` | 422, "Invalid query parameters" |
| Invalid created_by format | `?created_by=invalid` | 422, "Invalid query parameters" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Zero count | Category with no items | 200, count: 0 |
| Count with multiple filters | `?status=active&category=Electronics&created_by=...` | 200, count matching all filters |

---

## POST /api/v1/items/check-exists

**Purpose:** Check if multiple items exist by name and category

### Request Schema

```json
{
  "items": "array<object> (required, 1-100 items)",
  "created_by": "string (optional, ObjectId, filters by user)"
}
```

Each item in array:
```json
{
  "name": "string (required)",
  "category": "string (required)"
}
```

### Response Schema (200)

```json
{
  "status": "success",
  "results": [
    {
      "name": "string",
      "category": "string",
      "exists": "boolean",
      "item_id": "string (ObjectId, if exists)"
    }
  ]
}
```

### Business Rules

**RBAC Filtering:**
- ADMIN: Can check any items (ignores `created_by` filter)
- VIEWER: Can check any items
- EDITOR: Auto-filtered to own items, `created_by` param ignored

**Matching:**
- Case-insensitive name matching
- Category normalized to Title Case
- Checks `is_active = true` items only

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Items array is required" / "Items array must contain 1-100 items" |
| 401 | 401 | "Authentication required" |
| 422 | 422 | "Invalid item format" / "Name and category are required for each item" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Check single item | `{items: [{name: "Item", category: "Electronics"}]}` | 200, results with exists: true/false |
| Check multiple items | `{items: [{...}, {...}, {...}]}` | 200, results for each |
| Check with created_by | `{items: [...], created_by: "..."}` | 200, filtered by user |
| ADMIN checks all | ADMIN token, no created_by | 200, checks all items |
| EDITOR checks own | EDITOR token, no created_by | 200, checks own items only |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Missing items array | `{}` | 400, "Items array is required" |
| Empty items array | `{items: []}` | 400, "Items array must contain 1-100 items" |
| Over 100 items | `{items: [...101 items]}` | 400, "Items array must contain 1-100 items" |
| Missing name | `{items: [{category: "Electronics"}]}` | 422, "Name and category are required for each item" |
| Missing category | `{items: [{name: "Item"}]}` | 422, "Name and category are required for each item" |
| No authentication | No Authorization header | 401, "Authentication required" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Check 1 item | `{items: [{...}]}` | 200, single result |
| Check 100 items | `{items: [{...}, ...]}` (100 items) | 200, 100 results |
| Case variations | `{name: "ITEM", category: "electronics"}` | 200, matches "Item" + "Electronics" (normalized) |
| Non-existent items | All items don't exist | 200, all exists: false |

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

---

**End of P1 Endpoints**
