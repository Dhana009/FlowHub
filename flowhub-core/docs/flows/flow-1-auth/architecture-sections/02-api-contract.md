# **API Contract - Flow 1: Authentication**

**Version:** 1.0  
**Date:** December 2024  
**Base URL:** `http://localhost:3000/api/v1`

---

## **1. Base Configuration**

### **API Prefix**
- **Development:** `http://localhost:3000/api/v1`
- **Production:** `https://api.flowhub.com/api/v1`

### **Request Headers**
```javascript
Content-Type: application/json
Authorization: Bearer <jwt-token>  // For protected endpoints
```

### **Response Format**
```javascript
// Success Response
{
  "data": { ... },
  "message": "Success message"  // Optional
}

// Error Response
{
  "error": "Error message",
  "code": "ERROR_CODE"  // Optional
}
```

---

## **2. Authentication Endpoints**

### **2.1 Login**

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
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
- **400 Bad Request:** `{ "error": "Email and password are required" }`
- **401 Unauthorized:** `{ "error": "Invalid email or password" }`
- **429 Too Many Requests:** `{ "error": "Too many failed attempts. Account locked for 15 minutes." }`
- **500 Internal Server Error:** `{ "error": "Something went wrong. Please try again." }`

---

### **2.2 Sign-Up Request OTP**

**Endpoint:** `POST /api/v1/auth/signup/request-otp`

**Request Body:**
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
- **400 Bad Request:** `{ "error": "Email is required" }`
- **422 Unprocessable Entity:** `{ "error": "Invalid email format" }`
- **409 Conflict:** `{ "error": "This email is already registered" }`
- **429 Too Many Requests:** `{ "error": "Too many OTP requests. Please try again after 15 minutes." }`

---

### **2.3 Sign-Up Verify OTP**

**Endpoint:** `POST /api/v1/auth/signup/verify-otp`

**Request Body:**
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
- **400 Bad Request:** `{ "error": "Email and OTP are required" }`
- **401 Unauthorized:** `{ "error": "Invalid or expired OTP. Please try again." }`
- **404 Not Found:** `{ "error": "OTP not found" }`

---

### **2.4 Sign-Up**

**Endpoint:** `POST /api/v1/auth/signup`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "Password123!",
  "otp": "123456"
}
```

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

**Error Responses:**
- **400 Bad Request:** `{ "error": "All fields are required" }`
- **422 Unprocessable Entity:** `{ "error": "Password does not meet strength requirements" }`
- **409 Conflict:** `{ "error": "This email is already registered" }`
- **401 Unauthorized:** `{ "error": "Invalid or expired OTP" }`

---

### **2.5 Forgot Password Request OTP**

**Endpoint:** `POST /api/v1/auth/forgot-password/request-otp`

**Request Body:**
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

**Note:** Response is same whether email exists or not (security)

**Error Responses:**
- **400 Bad Request:** `{ "error": "Email is required" }`
- **422 Unprocessable Entity:** `{ "error": "Invalid email format" }`
- **429 Too Many Requests:** `{ "error": "Too many password reset requests. Please try again after 15 minutes." }`

---

### **2.6 Forgot Password Verify OTP**

**Endpoint:** `POST /api/v1/auth/forgot-password/verify-otp`

**Request Body:**
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
- **400 Bad Request:** `{ "error": "Email and OTP are required" }`
- **401 Unauthorized:** `{ "error": "Invalid or expired OTP. Please try again." }`

---

### **2.7 Forgot Password Reset**

**Endpoint:** `POST /api/v1/auth/forgot-password/reset`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**
- **400 Bad Request:** `{ "error": "Email, OTP, and new password are required" }`
- **401 Unauthorized:** `{ "error": "Invalid or expired OTP" }`
- **422 Unprocessable Entity:** `{ "error": "Password does not meet strength requirements" }`

---

### **2.8 Logout**

**Endpoint:** `POST /api/v1/auth/logout`

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

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
- **401 Unauthorized:** `{ "error": "Unauthorized" }`

---

### **2.9 Refresh Token (Optional - for auto-refresh)**

**Endpoint:** `POST /api/v1/auth/refresh`

**Request Headers:**
```
Cookie: refreshToken=refresh-token-string
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new-refresh-token-string"
}
```

**Error Responses:**
- **401 Unauthorized:** `{ "error": "Invalid or expired refresh token" }`

---

## **3. HTTP Status Codes**

- **200 OK** - Success
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required or failed
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource conflict (e.g., email already exists)
- **422 Unprocessable Entity** - Validation error
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

---

## **4. Error Response Format**

All error responses follow this format:

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

---

**Next:** See `03-backend-architecture.md` for backend implementation structure.

