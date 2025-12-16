# **Coding Sequence Plan - Flow 1: Authentication**

**Version:** 1.0  
**Date:** December 2024  
**Flow:** Flow 1 - Authentication/Login  
**Status:** Ready for Implementation

---

## **1. Implementation Order Overview**

**Phase 1: Foundation Setup** → **Phase 2: Backend Core** → **Phase 3: Backend Auth** → **Phase 4: Frontend Core** → **Phase 5: Frontend Auth** → **Phase 6: Integration & Testing**

---

## **2. Phase 1: Foundation Setup**

### **2.1 Project Structure Creation**

**Order:**
1. Create root folders: `backend/`, `frontend/`
2. Create `backend/src/` subfolders: `controllers/`, `services/`, `models/`, `middleware/`, `utils/`, `routes/`, `config/`
3. Create `frontend/src/` subfolders: `pages/`, `components/auth/`, `components/common/`, `services/`, `hooks/`, `context/`, `utils/`, `routes/`

**Files to Create:**
- `backend/package.json` (with dependencies)
- `backend/.env` (template with placeholders)
- `backend/.gitignore`
- `frontend/package.json` (with dependencies)
- `frontend/.env` (template)
- `frontend/.gitignore`
- `backend/README.md` (setup instructions)
- `frontend/README.md` (setup instructions)

**Naming Convention:**
- Folders: lowercase, kebab-case (e.g., `auth-controller.js` → NO, use `authController.js` in `controllers/` folder)
- Files: camelCase for JS files (e.g., `authService.js`, `userModel.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `JWT_SECRET`, `MAX_LOGIN_ATTEMPTS`)

---

## **3. Phase 2: Backend Core (No Auth Logic Yet)**

### **3.1 Database Connection**

**File:** `backend/src/config/database.js`

**What to Build:**
- MongoDB connection using Mongoose
- Connection event handlers (connected, error, disconnected)
- Export connection function

**Dependencies:** None (foundation)

**Testability Rules:**
- Connection string from environment variable
- Graceful error handling
- Log connection status (for debugging)

---

### **3.2 Express App Setup**

**File:** `backend/src/app.js`

**What to Build:**
- Express app initialization
- Basic middleware: `express.json()`, `express.urlencoded()`, `cookie-parser()`, `cors()`
- Error handling middleware (basic structure)
- Export app

**Dependencies:** Database connection (import but don't require it to be connected yet)

**Testability Rules:**
- Environment-based CORS configuration
- Port from environment variable
- Error handler catches all errors

---

### **3.3 Server Entry Point**

**File:** `backend/server.js` (root level)

**What to Build:**
- Import `dotenv` to load `.env`
- Import database connection
- Import Express app
- Start server on PORT
- Handle uncaught errors

**Dependencies:** All Phase 2 files

---

## **4. Phase 3: Backend Auth Implementation**

### **4.1 Models (Database Schemas)**

**Order:**
1. `backend/src/models/User.js`
2. `backend/src/models/OTP.js`

**File 1: User Model**

**What to Build:**
- Mongoose schema for User collection
- Fields: firstName, lastName, email, passwordHash, loginAttempts (object), createdAt, updatedAt, lastLogin
- Validation rules (as per architecture)
- Indexes: email (unique)
- Methods: None (keep it simple)
- Export model

**Dependencies:** Mongoose

**Testability Rules:**
- Schema validation must throw errors for invalid data
- Email must be lowercase automatically
- passwordHash must be required (but never returned in queries)

---

**File 2: OTP Model**

**What to Build:**
- Mongoose schema for OTP collection
- Fields: email, otp (hashed), type, expiresAt, attempts, isUsed, createdAt
- Validation rules (as per architecture)
- Indexes: compound (email + type), TTL (expiresAt)
- Export model

**Dependencies:** Mongoose

**Testability Rules:**
- TTL index must auto-delete expired documents
- Type must be enum: ["signup", "password-reset"]

---

### **4.2 Utilities**

**Order:**
1. `backend/src/utils/password.js`
2. `backend/src/utils/validation.js`
3. `backend/src/utils/logger.js` (optional, simple console.log wrapper)

**File 1: Password Utility**

**What to Build:**
- `hashPassword(password)` - bcrypt hash with 12 rounds
- `verifyPassword(password, hash)` - bcrypt compare
- `validatePasswordStrength(password)` - returns { valid: boolean, error?: string }

**Dependencies:** bcryptjs

**Testability Rules:**
- Password strength validation must match exact rules (8 chars, uppercase, lowercase, number, special char)
- Hash must be deterministic (same input = same hash, but different salt = different hash)

---

**File 2: Validation Utility**

**What to Build:**
- `validateEmail(email)` - returns boolean or error message
- `validateName(name)` - returns boolean or error message
- Reusable validation helpers

**Dependencies:** None (pure functions)

**Testability Rules:**
- All validators must be pure functions (no side effects)
- Return consistent format: string (error) or null (valid)

---

### **4.3 Services (Business Logic)**

**Order:**
1. `backend/src/services/tokenService.js`
2. `backend/src/services/otpService.js`
3. `backend/src/services/authService.js`

**File 1: Token Service**

**What to Build:**
- `generateJWT(userId, email)` - returns JWT token (15 min expiry)
- `generateRefreshToken(userId, email, rememberMe)` - returns refresh token (7 or 30 days)
- `verifyJWT(token)` - returns decoded payload or throws error
- `verifyRefreshToken(token)` - returns decoded payload or throws error

**Dependencies:** jsonwebtoken

**Testability Rules:**
- Tokens must be verifiable (signature check)
- Expiration must be enforced
- Secrets from environment variables

---

**File 2: OTP Service**

**What to Build:**
- `generateOTP()` - returns 6-digit random number (string)
- `storeOTP(email, otp, type)` - hash OTP, save to DB, return document
- `verifyOTP(email, otp, type)` - find OTP, verify hash, mark as used
- `checkOTPRateLimit(email, type)` - returns boolean (true if allowed)

**Dependencies:** OTP Model, bcryptjs

**Testability Rules:**
- OTP must be hashed before storage
- Rate limit: max 3 requests per 15 minutes per email
- OTP must expire after 10 minutes
- Verification attempts must be tracked

---

**File 3: Auth Service**

**What to Build:**
- `login(email, password, rememberMe)` - main login logic
- `signup(firstName, lastName, email, password, otp)` - signup logic
- `requestOTP(email, type)` - request OTP for signup/password reset
- `verifyOTP(email, otp, type)` - verify OTP (wrapper around otpService)
- `resetPassword(email, otp, newPassword)` - password reset logic
- `checkAccountLockout(email)` - returns boolean
- `incrementFailedAttempts(email)` - increment and lock if needed

**Dependencies:** User Model, OTP Service, Token Service, Password Utility

**Testability Rules:**
- All business logic here (no HTTP concerns)
- Must throw errors (not return error objects)
- Account lockout: 5 failed attempts = 15 min lockout
- Successful login must reset failed attempts

---

### **4.4 Middleware**

**Order:**
1. `backend/src/middleware/errorHandler.js`
2. `backend/src/middleware/rateLimiter.js`
3. `backend/src/middleware/authMiddleware.js`

**File 1: Error Handler**

**What to Build:**
- Centralized error handling middleware
- Format errors consistently
- Return appropriate HTTP status codes
- Log errors (for debugging)

**Dependencies:** None (Express middleware)

**Testability Rules:**
- Must catch all errors from routes
- Must return JSON response
- Must not expose internal errors in production

---

**File 2: Rate Limiter**

**What to Build:**
- `loginRateLimiter(req, res, next)` - check account lockout
- `otpRateLimiter(req, res, next)` - check OTP rate limit

**Dependencies:** Auth Service (for lockout check), OTP Service (for rate limit check)

**Testability Rules:**
- Must return 429 status on rate limit exceeded
- Must include clear error message

---

**File 3: Auth Middleware**

**What to Build:**
- `verifyToken(req, res, next)` - verify JWT token from Authorization header
- Attach user info to `req.user = { id, email }`
- Return 401 if invalid/missing token

**Dependencies:** Token Service

**Testability Rules:**
- Must extract token from `Authorization: Bearer <token>` header
- Must verify token signature and expiration
- Must call next() on success

---

### **4.5 Controllers**

**File:** `backend/src/controllers/authController.js`

**What to Build:**
- `login(req, res, next)` - POST /auth/login handler
- `requestSignupOTP(req, res, next)` - POST /auth/signup/request-otp
- `verifySignupOTP(req, res, next)` - POST /auth/signup/verify-otp
- `signup(req, res, next)` - POST /auth/signup
- `requestPasswordResetOTP(req, res, next)` - POST /auth/forgot-password/request-otp
- `resetPassword(req, res, next)` - POST /auth/forgot-password/reset
- `logout(req, res, next)` - POST /auth/logout

**Dependencies:** Auth Service, Error Handler

**Testability Rules:**
- No business logic (call service layer)
- Validate request body format
- Set httpOnly cookie for refreshToken (login, signup)
- Return consistent response format
- Handle errors via next(error)

---

### **4.6 Routes**

**File:** `backend/src/routes/authRoutes.js`

**What to Build:**
- Define all auth routes
- Apply middleware (rate limiter, error handler)
- Connect routes to controller functions
- Export router

**Dependencies:** Auth Controller, Middleware

**Testability Rules:**
- Routes must match API contract exactly
- Protected routes must use authMiddleware
- Rate limiters must be applied to appropriate routes

---

### **4.7 Wire Backend Together**

**File:** `backend/src/app.js` (update)

**What to Build:**
- Import auth routes
- Mount routes: `app.use('/api/v1/auth', authRoutes)`
- Apply error handler middleware (last)

**Dependencies:** All Phase 3 files

---

## **5. Phase 4: Frontend Core (No Auth Logic Yet)**

### **5.1 React App Setup**

**Order:**
1. Initialize React app (Vite)
2. Install Tailwind CSS
3. Setup routing (React Router)

**Files:**
- `frontend/vite.config.js`
- `frontend/tailwind.config.js`
- `frontend/src/main.jsx`
- `frontend/src/App.jsx`

**Dependencies:** None (foundation)

**Testability Rules:**
- App must start without errors
- Routing must work (even if routes are empty)

---

### **5.2 API Client**

**File:** `frontend/src/services/api.js`

**What to Build:**
- Axios instance with base URL
- Request interceptor (add JWT token to headers)
- Response interceptor (handle 401, refresh token logic)
- Error handling (convert to user-friendly messages)

**Dependencies:** axios

**Testability Rules:**
- Base URL from environment variable
- `withCredentials: true` (for httpOnly cookies)
- Token from memory (React state), NOT localStorage

---

### **5.3 Common Components**

**Order:**
1. `frontend/src/components/common/Input.jsx`
2. `frontend/src/components/common/Button.jsx`
3. `frontend/src/components/common/ErrorMessage.jsx`

**File 1: Input Component**

**What to Build:**
- Reusable input with label
- Error display
- Semantic attributes (role, aria-label, data-testid, aria-invalid)
- Password toggle support (optional prop)

**Testability Rules:**
- Must have all semantic attributes
- Must display errors with role="alert"
- Must be accessible (keyboard navigation)

---

**File 2: Button Component**

**What to Build:**
- Reusable button with loading state
- Semantic attributes (role, aria-label, data-testid, aria-busy)
- Disabled state

**Testability Rules:**
- Must show spinner when loading
- Must be disabled when loading
- Must have semantic attributes

---

**File 3: Error Message Component**

**What to Build:**
- Display error message
- Semantic attributes (role="alert", aria-live)

**Testability Rules:**
- Must have role="alert"
- Must have aria-live="polite" or "assertive"

---

### **5.4 Validation Utilities**

**File:** `frontend/src/utils/validation.js`

**What to Build:**
- `email(value)` - returns error string or empty string
- `password(value)` - returns error string or empty string
- `passwordStrength(value)` - returns error string or empty string
- `firstName(value)` - returns error string or empty string
- `lastName(value)` - returns error string or empty string
- `confirmPassword(value, password)` - returns error string or empty string

**Dependencies:** None (pure functions)

**Testability Rules:**
- All validators must be pure functions
- Return empty string if valid, error message if invalid

---

### **5.5 Form Hook**

**File:** `frontend/src/hooks/useForm.js`

**What to Build:**
- Form state management (values, errors, touched)
- `handleChange(name, value)` - update value, clear error
- `handleBlur(name)` - mark touched, validate field
- `validateField(name, value)` - validate single field
- `validateAll()` - validate all fields

**Dependencies:** Validation utilities

**Testability Rules:**
- Must be reusable (accept initial values and validation rules)
- Must track touched state
- Must validate on blur and submit

---

## **6. Phase 5: Frontend Auth Implementation**

### **6.1 Auth Context**

**File:** `frontend/src/context/AuthContext.jsx`

**What to Build:**
- AuthContext provider
- State: user, token
- Functions: login, logout, isAuthenticated
- Token stored in React state (memory), NOT localStorage

**Dependencies:** Auth Service (will be created next)

**Testability Rules:**
- Token must be in memory only
- Must provide user state globally
- Must handle login/logout

---

### **6.2 Auth Service**

**File:** `frontend/src/services/authService.js`

**What to Build:**
- `login(email, password, rememberMe)` - POST /auth/login
- `signupRequestOTP(email)` - POST /auth/signup/request-otp
- `signupVerifyOTP(email, otp)` - POST /auth/signup/verify-otp
- `signup(userData, otp)` - POST /auth/signup
- `forgotPasswordRequestOTP(email)` - POST /auth/forgot-password/request-otp
- `forgotPasswordReset(email, otp, newPassword)` - POST /auth/forgot-password/reset
- `logout()` - POST /auth/logout

**Dependencies:** API client

**Testability Rules:**
- All functions must use API client
- Email must be converted to lowercase
- Must return consistent data format

---

### **6.3 Auth Hook**

**File:** `frontend/src/hooks/useAuth.js`

**What to Build:**
- Custom hook that uses AuthContext
- Returns: { user, token, login, logout, isAuthenticated }
- Wrapper around context for convenience

**Dependencies:** AuthContext

**Testability Rules:**
- Must throw error if used outside AuthContext provider

---

### **6.4 Auth Forms**

**Order:**
1. `frontend/src/components/auth/LoginForm.jsx`
2. `frontend/src/components/auth/SignUpForm.jsx`
3. `frontend/src/components/auth/ForgotPasswordForm.jsx`

**File 1: Login Form**

**What to Build:**
- Email input (data-testid="login-email")
- Password input (data-testid="login-password")
- Remember Me checkbox (data-testid="login-remember-me")
- Submit button (data-testid="login-submit")
- Error message (data-testid="login-error")
- Use useForm hook
- Call authService.login on submit

**Dependencies:** useForm, useAuth, Input, Button, ErrorMessage components

**Testability Rules:**
- All inputs must have data-testid
- Must validate on blur and submit
- Must show loading state during API call
- Must display errors clearly

---

**File 2: Sign Up Form**

**What to Build:**
- First Name, Last Name, Email, Password, Confirm Password inputs
- OTP input (shown after requesting OTP)
- Request OTP button, Verify OTP button, Sign Up button
- Multi-step flow: Form → Request OTP → Verify OTP → Sign Up
- All with semantic attributes and data-testid

**Dependencies:** useForm, useAuth, Input, Button, ErrorMessage components

**Testability Rules:**
- Must handle multi-step flow
- Must validate password strength
- Must show OTP input only after requesting OTP

---

**File 3: Forgot Password Form**

**What to Build:**
- Email input, OTP input, New Password, Confirm Password inputs
- Request OTP button, Reset Password button
- Multi-step flow: Email → Request OTP → Verify OTP → Reset Password
- All with semantic attributes and data-testid

**Dependencies:** useForm, useAuth, Input, Button, ErrorMessage components

**Testability Rules:**
- Must handle multi-step flow
- Must validate new password strength

---

### **6.5 Auth Pages**

**Order:**
1. `frontend/src/pages/LoginPage.jsx`
2. `frontend/src/pages/SignUpPage.jsx`
3. `frontend/src/pages/ForgotPasswordPage.jsx`

**What to Build:**
- Container pages with centered layout
- Render corresponding form component
- No business logic (just layout)

**Dependencies:** Auth form components

**Testability Rules:**
- Must be responsive (Tailwind CSS)
- Must have clean, centered layout

---

### **6.6 Protected Routes**

**File:** `frontend/src/routes/AppRoutes.jsx`

**What to Build:**
- Define public routes: /login, /signup, /forgot-password
- Define protected routes: /items (placeholder for now)
- ProtectedRoute component (redirects to /login if not authenticated)
- Wrap app with AuthContext provider

**Dependencies:** AuthContext, useAuth, React Router

**Testability Rules:**
- Must redirect unauthenticated users to /login
- Must preserve intended destination (redirect after login)

---

### **6.7 Wire Frontend Together**

**File:** `frontend/src/App.jsx` (update)

**What to Build:**
- Wrap app with AuthContext provider
- Include AppRoutes
- Setup global error boundary (optional)

**Dependencies:** All Phase 5 files

---

## **7. Phase 6: Integration & Testing**

### **7.1 Environment Configuration**

**Files:**
- `backend/.env` (fill in real values)
- `frontend/.env` (fill in API URL)

**What to Build:**
- MongoDB connection string
- JWT secrets (generate secure random strings)
- CORS origins
- API URL

---

### **7.2 Manual Testing Checklist**

**Backend:**
- [ ] Server starts without errors
- [ ] Database connects successfully
- [ ] All endpoints respond (even if errors)
- [ ] Login works with valid credentials
- [ ] Signup flow works (request OTP → verify OTP → signup)
- [ ] Password reset flow works
- [ ] Account lockout works (5 failed attempts)
- [ ] Rate limiting works (OTP requests)
- [ ] JWT tokens work (protected routes)

**Frontend:**
- [ ] App starts without errors
- [ ] Login page renders
- [ ] Signup page renders
- [ ] Forgot password page renders
- [ ] Login form works (submit, validation, errors)
- [ ] Signup form works (multi-step flow)
- [ ] Password reset form works
- [ ] Protected routes redirect to login
- [ ] After login, redirects to protected route
- [ ] Logout works

**Integration:**
- [ ] Frontend can call backend APIs
- [ ] CORS works
- [ ] Cookies are set (refreshToken)
- [ ] JWT token is sent in Authorization header
- [ ] Token refresh works (if implemented)

---

### **7.3 Code Quality Checks**

- [ ] No console.log in production code (use logger)
- [ ] All environment variables are in .env (not hardcoded)
- [ ] All semantic attributes are present (data-testid, aria-*)
- [ ] Error handling is consistent
- [ ] Code is modular (no giant files)
- [ ] Naming conventions are followed

---

## **8. Naming Conventions**

### **8.1 Files**
- **Backend:** camelCase (e.g., `authService.js`, `userModel.js`)
- **Frontend:** PascalCase for components (e.g., `LoginForm.jsx`), camelCase for utilities (e.g., `validation.js`)

### **8.2 Variables & Functions**
- **camelCase** for variables and functions (e.g., `userEmail`, `handleLogin`)
- **UPPER_SNAKE_CASE** for constants (e.g., `JWT_SECRET`, `MAX_LOGIN_ATTEMPTS`)
- **PascalCase** for React components (e.g., `LoginForm`)

### **8.3 Database**
- **Collections:** lowercase, plural (e.g., `users`, `otps`)
- **Fields:** camelCase (e.g., `firstName`, `passwordHash`)

### **8.4 API Endpoints**
- **kebab-case** (e.g., `/auth/login`, `/auth/signup/request-otp`)

---

## **9. Testability Rules**

### **9.1 Deterministic Behavior**
- No random behavior in business logic (except OTP generation, which is acceptable)
- All dates/timestamps must be predictable (use Date.now() or Date objects, not random)
- Database operations must be idempotent where possible

### **9.2 Semantic Locators**
- All interactive elements must have `data-testid` attributes
- All form inputs must have `aria-label` and `role` attributes
- All error messages must have `role="alert"` and `aria-live`

### **9.3 Error Handling**
- All errors must be caught and handled gracefully
- Error messages must be user-friendly (not technical)
- Backend errors must return consistent JSON format: `{ error: string, statusCode: number }`

### **9.4 State Management**
- Frontend state must be predictable (no hidden state)
- Token must be in memory (React state), NOT localStorage
- All API calls must be traceable (log requests/responses in development)

### **9.5 Validation**
- Validation must happen on both frontend (UX) and backend (security)
- Validation rules must match between frontend and backend
- Invalid input must return clear error messages

---

## **10. Minimalism Constraints**

### **10.1 No Over-Engineering**
- **No complex state management** (use React Context, not Redux)
- **No unnecessary abstractions** (keep it simple)
- **No premature optimization** (build it first, optimize later)
- **No unnecessary dependencies** (use only what's needed)

### **10.2 Keep It Simple**
- **Monolithic backend** (no microservices)
- **Simple folder structure** (no complex nesting)
- **Direct imports** (no barrel exports unless necessary)
- **Minimal configuration** (use defaults where possible)

### **10.3 YAGNI Principle**
- **Don't build features not in requirements** (no "nice to have")
- **Don't add patterns "just in case"** (add when needed)
- **Don't optimize prematurely** (optimize when there's a problem)

---

## **11. Dependencies Summary**

### **11.1 Backend Dependencies**
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "cookie-parser": "^1.4.6",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5"
}
```

### **11.2 Frontend Dependencies**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.16.0",
  "axios": "^1.5.0",
  "tailwindcss": "^3.3.0"
}
```

---

## **12. Validation Checklist Before Implementation**

- [ ] All architecture documents reviewed
- [ ] All dependencies identified
- [ ] Implementation order understood
- [ ] Naming conventions clear
- [ ] Testability rules understood
- [ ] Minimalism constraints clear

---

## **13. Next Steps**

1. **Review this plan** - Ensure all steps are clear
2. **Start Phase 1** - Foundation setup
3. **Follow order strictly** - Don't skip phases
4. **Test after each phase** - Don't wait until the end
5. **Commit after each phase** - Keep git history clean

---

**Status:** ✅ Ready for Implementation  
**Next Action:** Begin Phase 1 - Foundation Setup

