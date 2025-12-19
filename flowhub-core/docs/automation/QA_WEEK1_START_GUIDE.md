# **QA Week 1: API Testing Start Guide**

**Purpose:** Complete reference for starting API automation testing  
**Base URL:** `http://localhost:3000/api/v1` (Development)  
**API Version:** v1

---

## **1. Complete API Endpoint Inventory**

### **Authentication Endpoints** (`/api/v1/auth`)

| Method | Endpoint | Auth Required | Rate Limit | Description |
|--------|----------|---------------|------------|-------------|
| `POST` | `/auth/login` | ❌ No | ✅ Yes (5/min) | User login |
| `POST` | `/auth/refresh` | ❌ No | ❌ No | Refresh access token |
| `POST` | `/auth/signup/request-otp` | ❌ No | ✅ Yes (3/15min) | Request signup OTP |
| `POST` | `/auth/signup/verify-otp` | ❌ No | ❌ No | Verify signup OTP |
| `POST` | `/auth/signup` | ❌ No | ❌ No | Complete signup |
| `POST` | `/auth/forgot-password/request-otp` | ❌ No | ✅ Yes (3/15min) | Request password reset OTP |
| `POST` | `/auth/forgot-password/verify-otp` | ❌ No | ❌ No | Verify password reset OTP |
| `POST` | `/auth/forgot-password/reset` | ❌ No | ❌ No | Reset password |
| `POST` | `/auth/logout` | ✅ Yes | ❌ No | Logout user |

### **Item Management Endpoints** (`/api/v1/items`)

| Method | Endpoint | Auth Required | Roles Allowed | Description |
|--------|----------|---------------|---------------|-------------|
| `POST` | `/items` | ✅ Yes | ADMIN, EDITOR | Create item (multipart/form-data) |
| `GET` | `/items` | ✅ Yes | ADMIN, EDITOR, VIEWER | List items (search, filter, paginate) |
| `GET` | `/items/:id` | ✅ Yes | ADMIN, EDITOR, VIEWER | Get item by ID |
| `PUT` | `/items/:id` | ✅ Yes | ADMIN, EDITOR* | Update item (requires version) |
| `DELETE` | `/items/:id` | ✅ Yes | ADMIN, EDITOR* | Soft delete item |
| `PATCH` | `/items/:id/activate` | ✅ Yes | ADMIN, EDITOR* | Restore deleted item |

*EDITOR can only modify items they created (ownership check)

### **Bulk Operations** (`/api/v1/bulk-operations`)

| Method | Endpoint | Auth Required | Roles | Description |
|--------|----------|---------------|-------|-------------|
| `POST` | `/bulk-operations` | ✅ Yes | ADMIN, EDITOR | Start bulk operation |
| `GET` | `/bulk-operations/:jobId` | ✅ Yes | ADMIN, EDITOR | Get bulk job status |

### **User Management** (`/api/v1/users`)

| Method | Endpoint | Auth Required | Roles | Description |
|--------|----------|---------------|-------|-------------|
| `GET` | `/users` | ✅ Yes | ADMIN | List all users |
| `PATCH` | `/users/:id/role` | ✅ Yes | ADMIN | Change user role |
| `PATCH` | `/users/:id/status` | ✅ Yes | ADMIN | Activate/deactivate user |
| `DELETE` | `/users/:id` | ✅ Yes | ADMIN | Deactivate user |

### **Activity Logs** (`/api/v1/activities`)

| Method | Endpoint | Auth Required | Roles | Description |
|--------|----------|---------------|-------|-------------|
| `GET` | `/activities` | ✅ Yes | ADMIN, EDITOR | Get activity logs |

### **Internal/Testing Endpoints** (`/api/v1/internal`)

| Method | Endpoint | Auth Required | Header Required | Description |
|--------|----------|---------------|-----------------|-------------|
| `POST` | `/internal/reset` | ❌ No | ✅ `X-Internal-Key` | Reset database (testing only) |
| `GET` | `/internal/otp?email={email}` | ❌ No | ✅ `X-Internal-Key` | Get OTP for testing |
| `POST` | `/internal/seed` | ❌ No | ✅ `X-Internal-Key` | Seed test data |

**Internal Key:** `flowhub-secret-automation-key-2025`

---

## **2. Authentication & Authorization**

### **Authentication Type:** JWT (JSON Web Token)

### **Token Structure:**
- **Access Token:** JWT in `Authorization: Bearer {token}` header
- **Refresh Token:** Stored in httpOnly cookie (not accessible via JavaScript)
- **Token Expiry:** Access token expires in 15 minutes
- **Refresh Token Expiry:** 7 days (default) or 30 days (if `rememberMe: true`)

### **Authentication Flow:**

1. **Login** → Get access token
   ```http
   POST /api/v1/auth/login
   Content-Type: application/json
   
   {
     "email": "user@example.com",
     "password": "SecurePass123!",
     "rememberMe": false
   }
   ```
   
   **Response:**
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "_id": "...",
       "email": "user@example.com",
       "role": "EDITOR"
     }
   }
   ```

2. **Use Token** in subsequent requests:
   ```http
   GET /api/v1/items
   Authorization: Bearer {token}
   ```

3. **Refresh Token** (automatic via cookie):
   ```http
   POST /api/v1/auth/refresh
   ```
   (No body needed, uses httpOnly cookie)

### **User Roles & Permissions:**

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access to all endpoints, can manage users |
| **EDITOR** | Can create/edit/delete own items, view all items |
| **VIEWER** | Read-only access to items, cannot create/edit/delete |

### **Test Credentials:**

**Service Account (for parallel testing):**
- Create test users via signup endpoint or use internal seed endpoint
- Recommended: Create multiple test users with different roles

**Admin Account:**
- Use signup with `role: "ADMIN"` or use internal seed endpoint

---

## **3. Environment Configuration**

### **Base URLs:**

| Environment | Base URL | Notes |
|------------|----------|-------|
| **Development** | `http://localhost:3000/api/v1` | Local development |
| **Staging** | `{staging-url}/api/v1` | TBD |
| **Production** | `{production-url}/api/v1` | TBD |

### **Headers:**

**Required for Authenticated Requests:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Required for Internal Endpoints:**
```
X-Internal-Key: flowhub-secret-automation-key-2025
```

**CORS:**
- Allowed Origins: `http://localhost:5173`, `http://localhost:3000`
- Credentials: Enabled (for cookies)

---

## **4. Error Response Format**

### **Standard Error Response:**
```json
{
  "status": "error",
  "error_code": 400,
  "error_type": "Bad Request",
  "message": "Error description",
  "timestamp": "2025-01-XXT...",
  "path": "/api/v1/items"
}
```

### **Error Code Reference:**

| HTTP Code | error_code | error_type | Scenario |
|-----------|------------|------------|----------|
| `400` | `400` | `Bad Request` | Missing required fields, invalid input |
| `401` | `401` | `Unauthorized` | Invalid credentials, expired token |
| `403` | `403` | `Forbidden` | Insufficient permissions (RBAC) |
| `404` | `404` | `Not Found` | Resource doesn't exist |
| `409` | `409` | `CONFLICT_ERROR` | Duplicate resource, version conflict |
| `422` | `422` | `Unprocessable Entity` | Validation failed |
| `429` | `429` | `Too Many Requests` | Rate limit exceeded |
| `500` | `500` | `Internal Server Error` | Server error |

### **Specific Error Codes:**

| error_code_detail | HTTP Code | Description |
|-------------------|-----------|-------------|
| `VERSION_CONFLICT` | `409` | Optimistic locking conflict (PUT /items/:id) |
| `CONFLICT_ERROR` | `409` | Duplicate item name |
| `Forbidden - Insufficient Permissions` | `403` | Role-based access denied |

**Testing Note:** Assert on `error_code` and `error_type`, NOT on `message` (messages may change).

---

## **5. Rate Limiting**

| Endpoint | Limit | Window | Headers |
|----------|-------|--------|---------|
| `/auth/login` | 5 requests | 15 minutes | Not exposed |
| `/auth/signup/request-otp` | 3 requests | 15 minutes | Not exposed |
| `/auth/forgot-password/request-otp` | 3 requests | 15 minutes | Not exposed |
| All other endpoints | No limit | - | - |

**Note:** Rate limiting is enforced server-side. Exceeding limits returns `429 Too Many Requests`.

---

## **6. Request/Response Schemas**

### **Auth Endpoints** (Complete schemas available in `auth-flow-schemas.md`)

**Key Fields:**
- `email`: String, valid email format, required
- `password`: String, min 8 chars, must contain: uppercase, lowercase, number, special char (!@#$%^&*)
- `otp`: String, exactly 6 digits
- `role`: String, one of: `"ADMIN"`, `"EDITOR"`, `"VIEWER"` (default: `"EDITOR"`)

### **Item Endpoints**

**Create Item (POST /items):**
- Content-Type: `multipart/form-data`
- Required: `name`, `description`, `item_type`, `price`, `category`
- Conditional (based on `item_type`):
  - `PHYSICAL`: `weight`, `length`, `width`, `height`
  - `DIGITAL`: `download_url`, `file_size`
  - `SERVICE`: `duration_hours`

**List Items (GET /items):**
- Query params: `search`, `status`, `category`, `page`, `limit`, `sort_by`, `sort_order`

**Update Item (PUT /items/:id):**
- Required: `version` (for optimistic locking)
- All other fields optional

---

## **7. Testing Utilities**

### **Internal Endpoints (Testing Only):**

**Reset Database:**
```http
POST /api/v1/internal/reset
X-Internal-Key: flowhub-secret-automation-key-2025
```

**Get OTP (for testing):**
```http
GET /api/v1/internal/otp?email=user@example.com
X-Internal-Key: flowhub-secret-automation-key-2025
```
Response: `{ "otp": "123456" }`

**Seed Test Data:**
```http
POST /api/v1/internal/seed
X-Internal-Key: flowhub-secret-automation-key-2025
Content-Type: application/json

{
  "userId": "user_id_here",
  "count": 50
}
```

---

## **8. Quick Start Checklist**

- [ ] Base URL configured: `http://localhost:3000/api/v1`
- [ ] Test user created (via signup or seed endpoint)
- [ ] Access token obtained (via login endpoint)
- [ ] Token stored for authenticated requests
- [ ] Internal key configured: `flowhub-secret-automation-key-2025`
- [ ] Error assertions use `error_code` not `message`
- [ ] Rate limits understood (login: 5/min, OTP: 3/15min)

---

**Ready to start testing!** All endpoints, authentication, and error formats are documented above.



