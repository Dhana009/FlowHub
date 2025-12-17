# Flow 1: Authentication - API Endpoints Reference

**Version:** 1.0  
**Date:** December 2024  
**Base URL:** `http://localhost:3000/api/v1`  
**Production URL:** `https://api.flowhub.com/api/v1`

---

## Table of Contents

1. [Base Configuration](#base-configuration)
2. [Endpoints](#endpoints)
   - [2.1 Login](#21-login)
   - [2.2 Sign-Up Request OTP](#22-sign-up-request-otp)
   - [2.3 Sign-Up Verify OTP](#23-sign-up-verify-otp)
   - [2.4 Sign-Up](#24-sign-up)
   - [2.5 Forgot Password Request OTP](#25-forgot-password-request-otp)
   - [2.6 Forgot Password Verify OTP](#26-forgot-password-verify-otp)
   - [2.7 Forgot Password Reset](#27-forgot-password-reset)
   - [2.8 Logout](#28-logout)
   - [2.9 Refresh Token](#29-refresh-token)
3. [HTTP Status Codes](#http-status-codes)
4. [Error Response Format](#error-response-format)

---

## Base Configuration

### Request Headers

**Standard Headers:**
```
Content-Type: application/json
```

**Protected Endpoints (Require Authentication):**
```
Authorization: Bearer <jwt-token>
```

**Refresh Token Endpoint:**
```
Cookie: refreshToken=refresh-token-string
```

### Response Format

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message"  // Optional
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"  // Optional
}
```

---

## Endpoints

### 2.1 Login

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Authenticate user with email and password.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body Schema:**
```json
{
  "email": "string (required, valid email format, lowercase)",
  "password": "string (required)",
  "rememberMe": "boolean (optional, default: false)"
}
```

**Request Body Example:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "rememberMe": false
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-string",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Response Headers:**
```
Set-Cookie: refreshToken=refresh-token-string; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Error Responses:**

| Status Code | Error Response |
|------------|----------------|
| 400 Bad Request | `{ "error": "Email and password are required" }` |
| 401 Unauthorized | `{ "error": "Invalid email or password" }` |
| 429 Too Many Requests | `{ "error": "Too many failed attempts. Account locked for 15 minutes." }` |
| 500 Internal Server Error | `{ "error": "Something went wrong. Please try again." }` |

---

### 2.2 Sign-Up Request OTP

**Endpoint:** `POST /api/v1/auth/signup/request-otp`

**Description:** Request OTP for user sign-up verification.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body Schema:**
```json
{
  "email": "string (required, valid email format, lowercase)"
}
```

**Request Body Example:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "OTP has been generated. Please check database for OTP.",
  "expiresIn": 600
}
```

**Error Responses:**

| Status Code | Error Response |
|------------|----------------|
| 400 Bad Request | `{ "error": "Email is required" }` |
| 422 Unprocessable Entity | `{ "error": "Invalid email format" }` |
| 409 Conflict | `{ "error": "This email is already registered" }` |
| 429 Too Many Requests | `{ "error": "Too many OTP requests. Please try again after 15 minutes." }` |

---

### 2.3 Sign-Up Verify OTP

**Endpoint:** `POST /api/v1/auth/signup/verify-otp`

**Description:** Verify OTP for sign-up process.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body Schema:**
```json
{
  "email": "string (required, valid email format, lowercase)",
  "otp": "string (required, 6 digits)"
}
```

**Request Body Example:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200 OK):**
```json
{
  "message": "OTP verified successfully",
  "verified": true
}
```

**Error Responses:**

| Status Code | Error Response |
|------------|----------------|
| 400 Bad Request | `{ "error": "Email and OTP are required" }` |
| 401 Unauthorized | `{ "error": "Invalid or expired OTP. Please try again." }` |
| 404 Not Found | `{ "error": "OTP not found" }` |

---

### 2.4 Sign-Up

**Endpoint:** `POST /api/v1/auth/signup`

**Description:** Create a new user account after OTP verification.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body Schema:**
```json
{
  "firstName": "string (required, 2-50 characters, letters only)",
  "lastName": "string (required, 2-50 characters, letters only)",
  "email": "string (required, valid email format, lowercase, unique)",
  "password": "string (required, min 8 chars, uppercase, lowercase, number, special char)",
  "otp": "string (required, 6 digits)"
}
```

**Request Body Example:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "Password123!",
  "otp": "123456"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

**Success Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-string",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Response Headers:**
```
Set-Cookie: refreshToken=refresh-token-string; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Error Responses:**

| Status Code | Error Response |
|------------|----------------|
| 400 Bad Request | `{ "error": "All fields are required" }` |
| 422 Unprocessable Entity | `{ "error": "Password does not meet strength requirements" }` |
| 409 Conflict | `{ "error": "This email is already registered" }` |
| 401 Unauthorized | `{ "error": "Invalid or expired OTP" }` |

---

### 2.5 Forgot Password Request OTP

**Endpoint:** `POST /api/v1/auth/forgot-password/request-otp`

**Description:** Request OTP for password reset.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body Schema:**
```json
{
  "email": "string (required, valid email format, lowercase)"
}
```

**Request Body Example:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "If this email exists, OTP has been sent.",
  "expiresIn": 600
}
```

**Note:** Response is the same whether email exists or not (security best practice - prevents email enumeration).

**Error Responses:**

| Status Code | Error Response |
|------------|----------------|
| 400 Bad Request | `{ "error": "Email is required" }` |
| 422 Unprocessable Entity | `{ "error": "Invalid email format" }` |
| 429 Too Many Requests | `{ "error": "Too many password reset requests. Please try again after 15 minutes." }` |

---

### 2.6 Forgot Password Verify OTP

**Endpoint:** `POST /api/v1/auth/forgot-password/verify-otp`

**Description:** Verify OTP for password reset process.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body Schema:**
```json
{
  "email": "string (required, valid email format, lowercase)",
  "otp": "string (required, 6 digits)"
}
```

**Request Body Example:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200 OK):**
```json
{
  "message": "OTP verified successfully",
  "verified": true
}
```

**Error Responses:**

| Status Code | Error Response |
|------------|----------------|
| 400 Bad Request | `{ "error": "Email and OTP are required" }` |
| 401 Unauthorized | `{ "error": "Invalid or expired OTP. Please try again." }` |

---

### 2.7 Forgot Password Reset

**Endpoint:** `POST /api/v1/auth/forgot-password/reset`

**Description:** Reset user password after OTP verification.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body Schema:**
```json
{
  "email": "string (required, valid email format, lowercase)",
  "otp": "string (required, 6 digits)",
  "newPassword": "string (required, min 8 chars, uppercase, lowercase, number, special char)"
}
```

**Request Body Example:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

**Success Response (200 OK):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**

| Status Code | Error Response |
|------------|----------------|
| 400 Bad Request | `{ "error": "Email, OTP, and new password are required" }` |
| 401 Unauthorized | `{ "error": "Invalid or expired OTP" }` |
| 422 Unprocessable Entity | `{ "error": "Password does not meet strength requirements" }` |

---

### 2.8 Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Description:** Log out the authenticated user and invalidate tokens.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Response Headers:**
```
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

**Error Responses:**

| Status Code | Error Response |
|------------|----------------|
| 401 Unauthorized | `{ "error": "Unauthorized" }` |

---

### 2.9 Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Description:** Refresh JWT access token using refresh token (optional - for auto-refresh functionality).

**Request Headers:**
```
Cookie: refreshToken=refresh-token-string
```

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new-refresh-token-string"
}
```

**Response Headers:**
```
Set-Cookie: refreshToken=new-refresh-token-string; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Error Responses:**

| Status Code | Error Response |
|------------|----------------|
| 401 Unauthorized | `{ "error": "Invalid or expired refresh token" }` |

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 OK | Request successful | GET, POST, PUT operations |
| 201 Created | Resource created successfully | POST (signup) |
| 400 Bad Request | Invalid request data | Validation errors, missing fields |
| 401 Unauthorized | Authentication required or failed | Invalid credentials, expired tokens |
| 404 Not Found | Resource not found | OTP not found, user not found |
| 409 Conflict | Resource conflict | Email already exists |
| 422 Unprocessable Entity | Validation error | Invalid email format, weak password |
| 429 Too Many Requests | Rate limit exceeded | Too many login attempts, OTP requests |
| 500 Internal Server Error | Server error | Unexpected server errors |

---

## Error Response Format

All error responses follow this standard format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",  // Optional, for programmatic handling
  "details": {            // Optional, additional error details
    "field": "email",
    "reason": "Invalid format"
  }
}
```

**Example Error Responses:**

```json
// Simple error
{
  "error": "Email and password are required"
}

// Error with code
{
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}

// Error with details
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "password",
    "reason": "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
  }
}
```

---

## Rate Limiting

### Login Attempts
- **Limit:** 5 failed attempts per 15 minutes per email
- **Action:** Account locked for 15 minutes after 5 failed attempts
- **Error:** `429 Too Many Requests` with message "Too many failed attempts. Account locked for 15 minutes."

### OTP Requests
- **Limit:** 3 requests per 15 minutes per email
- **Applies to:** Sign-up OTP and Password Reset OTP
- **Error:** `429 Too Many Requests` with message "Too many OTP requests. Please try again after 15 minutes."

---

## Token Information

### JWT Access Token
- **Lifetime:** 15 minutes
- **Storage:** Memory (React state) - NOT localStorage
- **Usage:** Sent in `Authorization: Bearer <token>` header
- **Payload:** `{ sub: userId, email, type: 'access' }`

### Refresh Token
- **Lifetime:** 
  - 7 days (default)
  - 30 days (if `rememberMe: true` on login)
- **Storage:** HttpOnly cookie (secure, not accessible via JavaScript)
- **Usage:** Sent automatically in Cookie header
- **Payload:** `{ sub: userId, email, type: 'refresh' }`

---

## OTP Information

### OTP Format
- **Length:** 6 digits
- **Range:** 100000 - 999999
- **Expiration:** 10 minutes from generation
- **Storage:** Hashed in database (bcrypt)
- **Usage:** One-time use only (marked as used after verification)

### OTP Types
- `signup` - For user registration
- `password-reset` - For password reset

---

## Validation Rules

### Email
- **Format:** Valid email format (regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`)
- **Case:** Automatically converted to lowercase
- **Max Length:** 100 characters
- **Required:** Yes

### Password
- **Min Length:** 8 characters
- **Requirements:**
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (!@#$%^&*)
- **Storage:** Hashed with bcrypt (12 salt rounds)

### Name Fields (firstName, lastName)
- **Min Length:** 2 characters
- **Max Length:** 50 characters
- **Format:** Letters and spaces only (no numbers, special characters)
- **Required:** Yes

---

## Testing Notes

### OTP Testing
- OTPs are stored in the database (MongoDB) for testing purposes
- No email/SMS integration in this version
- Check the `otps` collection to retrieve OTP values for testing

### Test Credentials
- Create test users via sign-up endpoint
- Use valid email format and strong passwords
- Remember OTP is case-sensitive and expires in 10 minutes

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Maintained By:** SDET Team



