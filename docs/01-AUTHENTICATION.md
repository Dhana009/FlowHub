# Authentication APIs
## Complete Request/Response Schemas

**Base Path:** `/api/v1/auth`  
**Source:** Extracted from `flowhub-core/backend/src/controllers/authController.js`

---

## POST /auth/login

**Auth:** No  
**Rate Limit:** Yes (`loginRateLimiter`)

### Request

```json
{
  "email": "string (required)",
  "password": "string (required, min 8 chars)",
  "rememberMe": "boolean (optional)"
}
```

### Response (200)

```json
{
  "token": "JWT access token string",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN | EDITOR | VIEWER",
    "isActive": true
  }
}
```

### Error Responses

- **400:** Email/password missing
- **401:** Invalid email or password, account locked, account deactivated
- **422:** Invalid email format, password < 8 chars
- **429:** Account locked (rate limiter)

**Note:** Refresh token automatically set as httpOnly cookie (`refreshToken`)

---

## POST /auth/refresh

**Auth:** No (uses httpOnly cookie)  
**Purpose:** Get new access token using refresh token

### Request

None (refresh token sent via httpOnly cookie)

### Response (200)

```json
{
  "token": "new JWT access token",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN | EDITOR | VIEWER",
    "isActive": true
  }
}
```

### Error Responses

- **401:** Refresh token not found, expired, or invalid

---

## GET /auth/me

**Auth:** Required  
**Purpose:** Get current authenticated user info (checkpoint endpoint)

### Request

None (access token sent via `Authorization: Bearer <token>` header)

### Response (200)

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN | EDITOR | VIEWER",
    "isActive": true,
    "createdAt": "2024-12-17T10:30:00Z",
    "updatedAt": "2024-12-17T10:30:00Z"
  }
}
```

### Error Responses

- **401:** Not authenticated, invalid token, user not found
- **403:** Account deactivated

**Use Case:** Checkpoint validation - verify authentication state before proceeding with tests

---

## POST /auth/logout

**Auth:** Required  
**Purpose:** Logout user and clear refresh token cookie

### Request

None

### Response (200)

```json
{
  "message": "Logged out successfully"
}
```

### Error Responses

- **401:** Not authenticated

---

## POST /auth/signup/request-otp

**Auth:** No  
**Rate Limit:** Yes (`otpRateLimiter`)

### Request

```json
{
  "email": "string (required, valid email format)"
}
```

### Response (200)

```json
{
  "message": "OTP sent successfully",
  "expiresIn": 10
}
```

**Development Mode Only:**
```json
{
  "message": "OTP sent successfully",
  "expiresIn": 10,
  "otp": "123456"
}
```

### Error Responses

- **400:** Email missing
- **422:** Invalid email format
- **429:** Too many OTP requests (15 minute cooldown)

---

## POST /auth/signup/verify-otp

**Auth:** No

### Request

```json
{
  "email": "string (required, valid email format)",
  "otp": "string (required, 6 digits)"
}
```

### Response (200)

```json
{
  "message": "OTP verified successfully",
  "verified": true
}
```

### Error Responses

- **400:** Email or OTP missing
- **422:** Invalid email format, invalid OTP format
- **404:** OTP not found or expired
- **401:** Invalid OTP

---

## POST /auth/signup

**Auth:** No

### Request

```json
{
  "firstName": "string (required, 1-50 chars, letters/spaces/hyphens)",
  "lastName": "string (required, 1-50 chars, letters/spaces/hyphens)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 8 chars, must contain uppercase, lowercase, number, special char)",
  "otp": "string (required, 6 digits)",
  "role": "ADMIN | EDITOR | VIEWER (optional, default: EDITOR)"
}
```

### Response (201)

```json
{
  "token": "JWT access token string",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EDITOR",
    "isActive": true,
    "createdAt": "2024-12-17T10:30:00Z"
  }
}
```

**Note:** Refresh token automatically set as httpOnly cookie

### Error Responses

- **400:** Missing required fields
- **409:** Email already registered
- **422:** 
  - Invalid email format
  - Invalid name format
  - Invalid OTP format
  - Password < 8 chars
  - Password doesn't meet strength requirements
  - Invalid role enum value

---

## POST /auth/forgot-password/request-otp

**Auth:** No  
**Rate Limit:** Yes (`otpRateLimiter`)

### Request

```json
{
  "email": "string (required, valid email format)"
}
```

### Response (200)

```json
{
  "message": "If this email exists, OTP has been sent.",
  "expiresIn": 10
}
```

**Note:** Response is generic (doesn't reveal if email exists)

### Error Responses

- **400:** Email missing
- **422:** Invalid email format
- **429:** Too many OTP requests (15 minute cooldown)

---

## POST /auth/forgot-password/verify-otp

**Auth:** No

### Request

```json
{
  "email": "string (required, valid email format)",
  "otp": "string (required, 6 digits)"
}
```

### Response (200)

```json
{
  "message": "OTP verified successfully",
  "verified": true
}
```

### Error Responses

- **400:** Email or OTP missing
- **422:** Invalid email format, invalid OTP format
- **404:** OTP not found or expired
- **401:** Invalid OTP

---

## POST /auth/forgot-password/reset

**Auth:** No

### Request

```json
{
  "email": "string (required, valid email format)",
  "otp": "string (required, 6 digits)",
  "newPassword": "string (required, min 8 chars, must contain uppercase, lowercase, number, special char)"
}
```

### Response (200)

```json
{
  "message": "Password reset successfully"
}
```

### Error Responses

- **400:** Email, OTP, or newPassword missing
- **422:** 
  - Invalid email format
  - Invalid OTP format
  - Password < 8 chars
  - Password doesn't meet strength requirements
- **404:** OTP not found or expired
- **401:** Invalid OTP

---

## Authentication Model

### Token Details

- **Access Token:**
  - Type: JWT
  - Expiry: **15 minutes** (`ACCESS_TOKEN_EXPIRY = '15m'`)
  - Header: `Authorization: Bearer <token>`
  - Storage: React state (memory), **NOT localStorage**

- **Refresh Token:**
  - Type: JWT
  - Storage: httpOnly cookie
  - Cookie name: `refreshToken`
  - Expiry:
    - **7 days** (default)
    - **30 days** if `rememberMe = true`

### Token Lifecycle

**Access Token Expiry:**
- API returns `401 Unauthorized`
- Frontend interceptor automatically calls `/api/v1/auth/refresh`
- New token obtained using refresh token cookie

**Refresh Token Expiry:**
- API returns `401`
- Cookie cleared automatically
- User must re-login

---

## Error Response Format

All error responses follow this format:

```json
{
  "status": "error",
  "error_code": 400 | 401 | 422 | 429 | 409,
  "error_type": "Bad Request | Unauthorized | Unprocessable Entity | Too Many Requests | Conflict",
  "message": "Human-readable error message",
  "timestamp": "2024-12-17T10:30:00Z",
  "path": "/api/v1/auth/login"
}
```

---

**End of Authentication APIs**
