# **FlowHub — Architecture Design: Flow 1 - Authentication**

**Version:** 1.0  
**Date:** November 30, 2024  
**Author:** Software Architect  
**Status:** Draft  
**Based on:** FS Version 1.0

---

## **1. Overview**

This document defines the system architecture for FlowHub Authentication flow, including database schema, API contract, backend architecture, and frontend architecture.

**Flow Name:** Authentication  
**Flow ID:** FLOW-001  
**Technology Stack:** React (Frontend), Node.js/Express (Backend), MongoDB (Database), Tailwind CSS (Styling)

---

## **2. Database Schema (MongoDB)**

### **2.1 Users Collection**

**Collection Name:** `users`

**Schema:**
```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated
  firstName: String,                // Required, 2-50 chars, letters and spaces only
  lastName: String,                 // Required, 2-50 chars, letters and spaces only
  email: String,                     // Required, unique, lowercase, valid email format
  password: String,                 // Required, hashed (bcrypt), never returned in queries
  createdAt: Date,                   // Auto-generated on creation
  updatedAt: Date                    // Auto-updated on modification
}
```

**Indexes:**
- `email` (unique index, for fast lookup and uniqueness constraint)
- `createdAt` (index, for sorting/filtering)

**Validation Rules:**
- `firstName`: Required, min 2, max 50, pattern: `^[a-zA-Z\s]+$`
- `lastName`: Required, min 2, max 50, pattern: `^[a-zA-Z\s]+$`
- `email`: Required, unique, lowercase, pattern: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- `password`: Required, hashed before storage

---

### **2.2 OTPs Collection**

**Collection Name:** `otps`

**Schema:**
```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated
  email: String,                     // Required, lowercase, indexed
  otp: String,                       // Required, 6 digits
  type: String,                      // Required, enum: ["signup", "password-reset"]
  expiresAt: Date,                   // Required, 10 minutes from creation, TTL index
  createdAt: Date                   // Auto-generated on creation
}
```

**Indexes:**
- `email` + `type` (compound index, for fast lookup)
- `expiresAt` (TTL index, auto-delete expired documents after expiration)

**Validation Rules:**
- `email`: Required, lowercase, valid email format
- `otp`: Required, exactly 6 digits, pattern: `^[0-9]{6}$`
- `type`: Required, must be "signup" or "password-reset"
- `expiresAt`: Required, must be 10 minutes from `createdAt`

---

### **2.3 Account Lockouts Collection**

**Collection Name:** `account_lockouts`

**Schema:**
```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated
  email: String,                     // Required, lowercase, indexed
  lockedUntil: Date,                // Required, 15 minutes from first failed attempt
  failedAttempts: Number,           // Default: 0, increments on failed login
  createdAt: Date,                  // Auto-generated on creation
  updatedAt: Date                   // Auto-updated on modification
}
```

**Indexes:**
- `email` (index, for fast lookup)
- `lockedUntil` (TTL index, auto-cleanup after unlock)

**Validation Rules:**
- `email`: Required, lowercase, valid email format
- `lockedUntil`: Required, must be 15 minutes from first failed attempt
- `failedAttempts`: Default 0, increments on failed login, resets on successful login

---

## **3. API Contract**

### **3.1 Base URL**

**Development:** `http://localhost:3000`  
**API Prefix:** `/api/v1`

**Full Base URL:** `http://localhost:3000/api/v1`

---

### **3.2 Authentication Endpoints**

#### **Endpoint 1: Login**

**URL:** `POST /api/v1/auth/login`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "rememberMe": false
}
```

**Response (200 OK):**
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
Set-Cookie: refreshToken=refresh-token-string; HttpOnly; Secure; SameSite=Strict; Max-Age=604800 (7 days) or 2592000 (30 days if rememberMe=true)
```

**Error Responses:**
- **400 Bad Request:** `{ "error": "Email and password are required" }`
- **401 Unauthorized:** `{ "error": "Invalid email or password" }`
- **429 Too Many Requests:** `{ "error": "Too many failed attempts. Account locked for 15 minutes." }`
- **500 Internal Server Error:** `{ "error": "Something went wrong. Please try again." }`

---

#### **Endpoint 2: Sign-Up Request OTP**

**URL:** `POST /api/v1/auth/signup/request-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "OTP has been generated. Please check MongoDB for OTP.",
  "expiresIn": 600
}
```

**Error Responses:**
- **400 Bad Request:** `{ "error": "Email is required" }`
- **422 Unprocessable Entity:** `{ "error": "Invalid email format" }`
- **409 Conflict:** `{ "error": "This email is already registered" }`
- **429 Too Many Requests:** `{ "error": "Too many OTP requests. Please try again after 15 minutes." }`

---

#### **Endpoint 3: Sign-Up Verify OTP**

**URL:** `POST /api/v1/auth/signup/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
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

#### **Endpoint 4: Sign-Up**

**URL:** `POST /api/v1/auth/signup`

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

**Response (201 Created):**
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

#### **Endpoint 5: Forgot Password Request OTP**

**URL:** `POST /api/v1/auth/forgot-password/request-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
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

#### **Endpoint 6: Forgot Password Verify OTP**

**URL:** `POST /api/v1/auth/forgot-password/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
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

#### **Endpoint 7: Forgot Password Reset**

**URL:** `POST /api/v1/auth/forgot-password/reset`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123!"
}
```

**Response (200 OK):**
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

#### **Endpoint 8: Logout**

**URL:** `POST /api/v1/auth/logout`

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Response Headers:**
```
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0 (clear cookie)
```

**Error Responses:**
- **401 Unauthorized:** `{ "error": "Unauthorized" }`

---

#### **Endpoint 9: Refresh Token (Optional - for auto-refresh)**

**URL:** `POST /api/v1/auth/refresh`

**Request Headers:**
```
Cookie: refreshToken=refresh-token-string
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new-refresh-token-string"
}
```

**Error Responses:**
- **401 Unauthorized:** `{ "error": "Invalid or expired refresh token" }`

---

## **4. Backend Architecture (Node.js/Express)**

### **4.1 Folder Structure**

```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.js       # Auth endpoints handlers
│   ├── services/
│   │   ├── authService.js          # Business logic (login, signup, password reset)
│   │   ├── tokenService.js         # JWT token generation/validation
│   │   └── otpService.js           # OTP generation/validation
│   ├── models/
│   │   ├── User.js                 # User model (MongoDB schema)
│   │   ├── OTP.js                  # OTP model (MongoDB schema)
│   │   └── AccountLockout.js        # Account lockout model
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT token validation
│   │   ├── rateLimiter.js          # Rate limiting middleware
│   │   └── errorHandler.js         # Error handling middleware
│   ├── utils/
│   │   ├── validation.js            # Input validation helpers
│   │   ├── password.js             # Password hashing/validation
│   │   └── logger.js               # Logging utility
│   ├── routes/
│   │   └── authRoutes.js           # Auth route definitions
│   ├── config/
│   │   ├── database.js              # MongoDB connection
│   │   └── jwt.js                   # JWT configuration
│   └── app.js                       # Express app setup
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env                              # Environment variables
├── package.json
└── README.md
```

---

### **4.2 Layer Separation**

**Controller Layer (`controllers/authController.js`):**
- Handles HTTP requests/responses
- Validates request format
- Calls service layer
- Returns HTTP responses

**Service Layer (`services/authService.js`):**
- Contains business logic
- Calls model layer for database operations
- Handles business rules (account lockout, OTP validation)
- Returns business objects (not HTTP responses)

**Model Layer (`models/User.js`, etc.):**
- MongoDB schema definitions
- Database operations (CRUD)
- Data validation at database level

**Middleware Layer:**
- Authentication middleware (JWT validation)
- Rate limiting middleware
- Error handling middleware

---

### **4.3 Key Components**

**authService.js:**
- `login(email, password, rememberMe)` - Login logic
- `signup(firstName, lastName, email, password, otp)` - Sign-up logic
- `requestOTP(email, type)` - OTP generation
- `verifyOTP(email, otp, type)` - OTP verification
- `resetPassword(email, otp, newPassword)` - Password reset logic
- `checkAccountLockout(email)` - Check if account is locked
- `incrementFailedAttempts(email)` - Increment failed login attempts

**tokenService.js:**
- `generateJWT(userId, email)` - Generate JWT token (15 min expiry)
- `generateRefreshToken(userId, email)` - Generate refresh token
- `verifyJWT(token)` - Verify JWT token
- `verifyRefreshToken(token)` - Verify refresh token

**otpService.js:**
- `generateOTP()` - Generate 6-digit OTP
- `storeOTP(email, otp, type)` - Store OTP in MongoDB
- `verifyOTP(email, otp, type)` - Verify OTP from MongoDB
- `checkRateLimit(email, type)` - Check OTP rate limiting

---

## **5. Frontend Architecture (React)**

### **5.1 Folder Structure**

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx           # Login page
│   │   ├── SignUpPage.jsx          # Sign-up page
│   │   └── ForgotPasswordPage.jsx  # Password reset page
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx       # Login form component
│   │   │   ├── SignUpForm.jsx      # Sign-up form component
│   │   │   └── ForgotPasswordForm.jsx # Password reset form
│   │   ├── common/
│   │   │   ├── Input.jsx           # Reusable input component
│   │   │   ├── Button.jsx          # Reusable button component
│   │   │   └── ErrorMessage.jsx   # Error message component
│   ├── services/
│   │   ├── api.js                  # API client (axios/fetch wrapper)
│   │   └── authService.js          # Auth API calls
│   ├── utils/
│   │   ├── validation.js            # Client-side validation
│   │   ├── token.js                # Token management (memory storage)
│   │   └── constants.js             # Constants (API URLs, etc.)
│   ├── hooks/
│   │   ├── useAuth.js              # Auth hook (login, logout, token management)
│   │   └── useForm.js               # Form handling hook
│   ├── context/
│   │   └── AuthContext.jsx         # Auth context (user state, token)
│   ├── routes/
│   │   └── AppRoutes.jsx           # Route definitions (protected routes)
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── README.md
```

---

### **5.2 Component Structure**

**Pages:**
- `LoginPage.jsx` - Login page (uses LoginForm component)
- `SignUpPage.jsx` - Sign-up page (uses SignUpForm component)
- `ForgotPasswordPage.jsx` - Password reset page (uses ForgotPasswordForm component)

**Components:**
- `LoginForm.jsx` - Login form with email, password, remember me, submit button
- `SignUpForm.jsx` - Sign-up form with all fields, OTP input, submit button
- `ForgotPasswordForm.jsx` - Password reset form with email, OTP, new password
- `Input.jsx` - Reusable input component (with validation display, semantic attributes)
- `Button.jsx` - Reusable button component (with loading state, semantic attributes)

**Services:**
- `api.js` - Base API client (handles requests, errors, token injection)
- `authService.js` - Auth-specific API calls (login, signup, password reset, logout)

**Hooks:**
- `useAuth.js` - Auth hook (login, logout, check auth status, token management)
- `useForm.js` - Form handling hook (validation, error handling, submission)

**Context:**
- `AuthContext.jsx` - Global auth state (user, token, login, logout functions)

---

### **5.3 State Management**

**Auth State (AuthContext):**
- `user` - Current user object (null if not logged in)
- `token` - JWT token (stored in memory, not localStorage)
- `isAuthenticated` - Boolean (computed from token)
- `login(user, token, refreshToken)` - Login function
- `logout()` - Logout function
- `checkAuth()` - Check if user is authenticated

**Form State (useForm hook):**
- Form data (field values)
- Validation errors
- Loading state
- Submit handler

**Token Storage:**
- JWT token: Stored in React state (memory) - not localStorage
- Refresh token: Stored in httpOnly cookie (handled by browser)

---

### **5.4 Routing & Protected Routes**

**Route Structure:**
- `/login` - Login page (public)
- `/signup` - Sign-up page (public)
- `/forgot-password` - Password reset page (public)
- `/items` - Item list page (protected - requires auth)
- All other routes - Protected (redirect to login if not authenticated)

**Protected Route Logic:**
- Check if JWT token exists in memory
- If no token: Redirect to `/login`
- If token exists: Allow access
- If token expired: Try refresh token, if fails redirect to login

---

## **6. Data Flow**

### **6.1 Login Flow**

```
User → Frontend (LoginForm)
  → Enter email, password
  → Click "Sign In"
  → Frontend validates (client-side)
  → Frontend calls API: POST /auth/login
  → Backend (authController)
    → Validates request
    → Calls authService.login()
    → authService checks account lockout
    → authService validates credentials (checks database)
    → authService generates tokens (tokenService)
    → authService returns user + tokens
  → Controller returns HTTP response
  → Frontend receives response
  → Frontend stores JWT in memory
  → Frontend stores refresh token in cookie (httpOnly)
  → Frontend redirects to /items
```

### **6.2 Sign-Up Flow**

```
User → Frontend (SignUpForm)
  → Enter all fields
  → Click "Sign Up"
  → Frontend validates
  → Frontend calls API: POST /auth/signup/request-otp
  → Backend generates OTP, stores in MongoDB
  → Frontend shows OTP input
  → User enters OTP from MongoDB
  → Frontend calls API: POST /auth/signup/verify-otp
  → Backend verifies OTP
  → Frontend calls API: POST /auth/signup
  → Backend creates user, generates tokens
  → Frontend stores tokens, redirects to /items
```

---

## **7. Security Architecture**

### **7.1 Authentication**

- **JWT Token:** Short-lived (15 minutes), stored in memory
- **Refresh Token:** Long-lived (7 or 30 days), stored in httpOnly cookie
- **Token Validation:** Middleware validates JWT on protected routes
- **Auto-Refresh:** Frontend automatically refreshes JWT when expired (using refresh token)

### **7.2 Password Security**

- **Hashing:** bcrypt (salt rounds: 10)
- **Never Returned:** Passwords never returned in API responses
- **Strength Requirements:** Enforced on sign-up and password reset

### **7.3 Rate Limiting**

- **Login Attempts:** 5 per 15 minutes per email
- **OTP Requests:** 3 per 15 minutes per email
- **Implementation:** Express rate-limiter middleware
- **Storage:** In-memory or Redis (for production)

### **7.4 Input Validation**

- **Backend:** All inputs validated (never trust frontend)
- **Frontend:** Client-side validation for UX (but backend is source of truth)
- **Sanitization:** XSS prevention, SQL injection prevention (MongoDB handles)

---

## **8. Error Handling**

### **8.1 Backend Error Handling**

- **Middleware:** Centralized error handler
- **Error Format:** Consistent JSON format: `{ "error": "Error message" }`
- **Status Codes:** Proper HTTP status codes (400, 401, 404, 409, 422, 429, 500)
- **Logging:** All errors logged (for debugging)

### **8.2 Frontend Error Handling**

- **API Errors:** Caught and displayed to user
- **Network Errors:** Handled gracefully
- **Error Display:** Error messages shown below form fields or below buttons
- **Error Recovery:** User can retry (form data preserved)

---

## **9. Technology Choices**

### **9.1 Backend**

- **Framework:** Express.js (Node.js)
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken library)
- **Password Hashing:** bcrypt
- **Validation:** express-validator or custom validation
- **Rate Limiting:** express-rate-limit

### **9.2 Frontend**

- **Framework:** React (with Vite or Create React App)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios or Fetch API
- **Routing:** React Router
- **State Management:** React Context API (for auth state)

---

## **10. Dependencies**

### **10.1 Backend Dependencies**

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT token generation/validation
- `bcrypt` - Password hashing
- `express-validator` - Input validation
- `express-rate-limit` - Rate limiting
- `cookie-parser` - Cookie parsing
- `dotenv` - Environment variables

### **10.2 Frontend Dependencies**

- `react` - UI framework
- `react-dom` - DOM rendering
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - CSS framework

---

**Document Version:** 1.0  
**Status:** Draft - Ready for Review  
**Next:** Detailed Specifications

