# **Backend Architecture - Flow 1: Authentication**

**Version:** 1.0  
**Date:** December 2024  
**Technology:** Node.js + Express + MongoDB

---

## **1. Folder Structure**

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
│   │   └── OTP.js                  # OTP model (MongoDB schema)
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
├── .env                              # Environment variables
├── package.json
└── README.md
```

---

## **2. Layer Separation**

### **Controller Layer** (`controllers/authController.js`)
- Handles HTTP requests/responses
- Validates request format
- Calls service layer
- Returns HTTP responses
- **No business logic**

### **Service Layer** (`services/authService.js`)
- Contains business logic
- Calls model layer for database operations
- Handles business rules (account lockout, OTP validation)
- Returns business objects (not HTTP responses)
- **No HTTP concerns**

### **Model Layer** (`models/User.js`, `models/OTP.js`)
- MongoDB schema definitions
- Database operations (CRUD)
- Data validation at database level
- **No business logic**

### **Middleware Layer**
- Authentication middleware (JWT validation)
- Rate limiting middleware
- Error handling middleware

---

## **3. Key Components**

### **3.1 Auth Service** (`services/authService.js`)

**Purpose:** Contains all business logic for authentication flows.

**Required Functions:**

1. **`login(email, password, rememberMe)`**
   - **Input:** email (lowercase), password (plain text), rememberMe (boolean)
   - **Process:**
     - Check if account is locked (check `loginAttempts.lockedUntil`)
     - Find user by email in database
     - Verify password using bcrypt.compare()
     - If invalid: increment failed attempts, check if lockout needed
     - If valid: generate JWT + Refresh token, update lastLogin, reset login attempts
   - **Output:** { token, refreshToken, user } or throw error

2. **`signup(firstName, lastName, email, password, otp)`**
   - **Input:** firstName, lastName, email, password, otp
   - **Process:**
     - Verify OTP is valid and not expired
     - Check email uniqueness (throw error if exists)
     - Validate password strength
     - Hash password with bcrypt (12 rounds)
     - Create user in database
     - Generate tokens
   - **Output:** { token, refreshToken, user } or throw error

3. **`requestOTP(email, type)`**
   - **Input:** email, type ("signup" or "password-reset")
   - **Process:**
     - Check rate limiting (max 3 per 15 minutes)
     - Generate 6-digit random OTP
     - Hash OTP with bcrypt
     - Store in OTPs collection with 10-minute expiration
   - **Output:** { message, expiresIn } or throw error

4. **`verifyOTP(email, otp, type)`**
   - **Input:** email, otp (6 digits), type
   - **Process:**
     - Find OTP record in database (not used, not expired)
     - Verify OTP hash using bcrypt.compare()
     - If invalid: increment attempts, throw error
     - If valid: mark OTP as used
   - **Output:** boolean or throw error

5. **`resetPassword(email, otp, newPassword)`**
   - **Input:** email, otp, newPassword
   - **Process:**
     - Verify OTP
     - Validate password strength
     - Hash new password
     - Update user password in database
   - **Output:** success message or throw error

6. **`checkAccountLockout(email)`**
   - **Input:** email
   - **Process:**
     - Find user by email
     - Check if `loginAttempts.lockedUntil` exists and is in future
   - **Output:** boolean (true if locked)

7. **`incrementFailedAttempts(email)`**
   - **Input:** email
   - **Process:**
     - Find user
     - Increment `loginAttempts.count`
     - If count >= 5: set `lockedUntil` to 15 minutes from now
     - Save user
   - **Output:** void

---

### **3.2 Token Service** (`services/tokenService.js`)

**Purpose:** Handles JWT token generation and validation.

**Required Functions:**

1. **`generateJWT(userId, email)`**
   - **Input:** userId (string), email (string)
   - **Process:** Sign JWT with payload { sub: userId, email, type: 'access' }
   - **Expiration:** 15 minutes
   - **Secret:** `process.env.JWT_SECRET`
   - **Output:** JWT token string

2. **`generateRefreshToken(userId, email, rememberMe)`**
   - **Input:** userId, email, rememberMe (boolean)
   - **Process:** Sign JWT with payload { sub: userId, email, type: 'refresh' }
   - **Expiration:** 30 days if rememberMe=true, else 7 days
   - **Secret:** `process.env.JWT_REFRESH_SECRET`
   - **Output:** Refresh token string

3. **`verifyJWT(token)`**
   - **Input:** JWT token string
   - **Process:** Verify token signature and expiration
   - **Secret:** `process.env.JWT_SECRET`
   - **Output:** Decoded payload or throw error

4. **`verifyRefreshToken(token)`**
   - **Input:** Refresh token string
   - **Process:** Verify token signature and expiration
   - **Secret:** `process.env.JWT_REFRESH_SECRET`
   - **Output:** Decoded payload or throw error

---

### **3.3 OTP Service** (`services/otpService.js`)

**Purpose:** Handles OTP generation, storage, and verification.

**Required Functions:**

1. **`generateOTP()`**
   - **Process:** Generate random 6-digit number (100000-999999)
   - **Output:** 6-digit string

2. **`storeOTP(email, otp, type)`**
   - **Input:** email (lowercase), otp (6 digits), type ("signup" or "password-reset")
   - **Process:**
     - Hash OTP with bcrypt (10 rounds)
     - Calculate expiration (10 minutes from now)
     - Create document in OTPs collection
   - **Output:** OTP document

3. **`verifyOTP(email, otp, type)`**
   - **Input:** email, otp, type
   - **Process:**
     - Find OTP record (not used, not expired, matching type)
     - Compare OTP hash using bcrypt.compare()
     - If invalid: increment attempts, throw error
     - If valid: mark as used
   - **Output:** boolean or throw error

4. **`checkOTPRateLimit(email, type)`**
   - **Input:** email, type
   - **Process:** Count OTP requests in last 15 minutes
   - **Limit:** Max 3 requests per 15 minutes per email
   - **Output:** boolean (true if allowed)

---

### **3.4 Password Utility** (`utils/password.js`)

**Purpose:** Password hashing and validation utilities.

**Required Functions:**

1. **`hashPassword(password)`**
   - **Input:** Plain text password
   - **Process:** Hash using bcrypt with 12 salt rounds
   - **Output:** Hashed password string

2. **`verifyPassword(password, hash)`**
   - **Input:** Plain text password, hashed password
   - **Process:** Compare using bcrypt.compare()
   - **Output:** boolean

3. **`validatePasswordStrength(password)`**
   - **Input:** Plain text password
   - **Validation Rules:**
     - Minimum 8 characters
     - At least one uppercase letter (A-Z)
     - At least one lowercase letter (a-z)
     - At least one number (0-9)
     - At least one special character (!@#$%^&*)
   - **Output:** { valid: boolean, error: string } (error only if invalid)

---

### **3.5 Auth Middleware** (`middleware/authMiddleware.js`)

**Purpose:** Protect routes by verifying JWT tokens.

**Function:** `verifyToken(req, res, next)`

**Process:**
1. Extract token from `Authorization: Bearer <token>` header
2. If no token: return 401 Unauthorized
3. Verify token using tokenService.verifyJWT()
4. If valid: attach user info to `req.user = { id, email }`
5. If invalid: return 401 Unauthorized
6. Call next() to continue to route handler

**Usage:** Apply to protected routes (e.g., `/items`, `/auth/logout`)

---

### **3.6 Rate Limiter Middleware** (`middleware/rateLimiter.js`)

**Purpose:** Prevent brute force attacks and abuse.

**Functions:**

1. **`loginRateLimiter(req, res, next)`**
   - **Process:**
     - Extract email from request body
     - Check if account is locked (check `user.loginAttempts.lockedUntil`)
     - If locked: return 429 with lockout message
     - If not locked: continue
   - **Usage:** Apply to `/auth/login` endpoint

2. **`otpRateLimiter(req, res, next)`**
   - **Process:**
     - Extract email and type from request body
     - Check OTP rate limit (max 3 per 15 minutes)
     - If exceeded: return 429 error
     - If allowed: continue
   - **Usage:** Apply to OTP request endpoints

---

### **3.7 Auth Controller** (`controllers/authController.js`)

**Purpose:** Handle HTTP requests/responses for auth endpoints.

**Required Endpoint Handlers:**

1. **`POST /auth/login`** - `login(req, res, next)`
   - **Input Validation:** Check email and password exist
   - **Business Logic:** Call `authService.login()`
   - **Response:** 
     - Set httpOnly cookie with refreshToken
     - Return 200 with { token, user }
   - **Error Handling:** Catch errors, pass to error handler

2. **`POST /auth/signup/request-otp`** - `requestSignupOTP(req, res, next)`
   - **Input Validation:** Check email exists
   - **Business Logic:** Call `authService.requestOTP(email, 'signup')`
   - **Response:** Return 200 with { message, expiresIn }

3. **`POST /auth/signup/verify-otp`** - `verifySignupOTP(req, res, next)`
   - **Input Validation:** Check email and OTP exist
   - **Business Logic:** Call `authService.verifyOTP()`
   - **Response:** Return 200 with { message, verified }

4. **`POST /auth/signup`** - `signup(req, res, next)`
   - **Input Validation:** Check all required fields
   - **Business Logic:** Call `authService.signup()`
   - **Response:** Set cookie, return 201 with { token, refreshToken, user }

5. **`POST /auth/forgot-password/request-otp`** - `requestPasswordResetOTP(req, res, next)`
   - Similar to signup OTP request

6. **`POST /auth/forgot-password/reset`** - `resetPassword(req, res, next)`
   - **Business Logic:** Call `authService.resetPassword()`
   - **Response:** Return 200 with success message

7. **`POST /auth/logout`** - `logout(req, res, next)`
   - **Process:** Clear refreshToken cookie
   - **Response:** Return 200 with success message

---

## **4. Environment Variables**

**`.env` file:**
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/flowhub

# JWT
JWT_SECRET=your-super-secure-secret-key-256-bits-minimum
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-256-bits-minimum

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## **5. Dependencies**

**`package.json` dependencies:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-validator": "^7.0.1",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## **6. Implementation Order**

1. **Setup:** Database connection, Express app, middleware
2. **Models:** User model, OTP model
3. **Utils:** Password hashing, validation helpers
4. **Services:** Token service, OTP service, Auth service
5. **Middleware:** Auth middleware, rate limiter, error handler
6. **Controllers:** Auth controller
7. **Routes:** Auth routes
8. **Testing:** Manual testing, then automated tests

---

**Next:** See `04-frontend-architecture.md` for frontend implementation structure.

