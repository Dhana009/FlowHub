# **FlowHub — Detailed Specifications: Flow 1 - Authentication**

**Version:** 1.0  
**Date:** November 30, 2024  
**Author:** Senior Developer / Business Analyst  
**Status:** Draft  
**Based on:** FS Version 1.0 + Architecture Version 1.0

---

## **1. Overview**

This document provides detailed implementation specifications for FlowHub Authentication flow, including exact validation rules, business logic, UI/UX behavior, and error handling.

**Flow Name:** Authentication  
**Flow ID:** FLOW-001  
**Purpose:** Provide exact specifications for developers to implement

---

## **2. Validation Specifications**

### **2.1 Email Validation**

**Field:** Email (Login, Sign-Up, Password Reset)

**Validation Rules:**
- **Required:** Yes
- **Type:** String
- **Format:** Valid email format (regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`)
- **Length:** 1-100 characters
- **Case:** Converted to lowercase automatically (on input, before validation)

**When to Validate:**
- **Frontend (Login):** On blur (when user leaves field), on submit
- **Frontend (Sign-Up):** On blur, on submit
- **Frontend (Password Reset):** On blur, on submit
- **Backend:** Always (on every API request)

**Error Messages:**
- Empty: `"Email is required"`
- Invalid format: `"Please enter a valid email address"`
- Too long (>100 chars): `"Email must be 100 characters or less"`

**Implementation:**
- Frontend: Real-time validation on blur, clear error on change
- Backend: Validate on every request, return 422 if invalid

---

### **2.2 Password Validation (Login)**

**Field:** Password (Login only)

**Validation Rules:**
- **Required:** Yes
- **Type:** String
- **Length:** No minimum/maximum (any length accepted for login)
- **Format:** No format validation (password strength not checked on login)

**When to Validate:**
- **Frontend:** On submit only (not on blur)
- **Backend:** Always (on every API request)

**Error Messages:**
- Empty: `"Password is required"`

**Implementation:**
- Frontend: Validate only on submit, clear error on change
- Backend: Validate on every request, return 422 if empty

---

### **2.3 Password Validation (Sign-Up & Password Reset)**

**Field:** Password (Sign-Up, Password Reset)

**Validation Rules:**
- **Required:** Yes
- **Type:** String
- **Length:** Minimum 8 characters, maximum 100 characters
- **Format Requirements:**
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (!@#$%^&*)
- **Regex Pattern:** `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,100}$`

**When to Validate:**
- **Frontend:** Real-time (while typing), on submit
- **Backend:** Always (on every API request)

**Error Messages:**
- Empty: `"Password is required"`
- Too short (<8 chars): `"Password must be at least 8 characters"`
- Too long (>100 chars): `"Password must be 100 characters or less"`
- Missing uppercase: `"Password must contain at least one uppercase letter"`
- Missing lowercase: `"Password must contain at least one lowercase letter"`
- Missing number: `"Password must contain at least one number"`
- Missing special char: `"Password must contain at least one special character (!@#$%^&*)"`
- Combined (if multiple missing): `"Password must be at least 8 characters with uppercase, lowercase, number, and special character"`

**Implementation:**
- Frontend: Real-time strength indicator, show specific error messages
- Backend: Validate on every request, return 422 if invalid

---

### **2.4 First Name Validation**

**Field:** First Name (Sign-Up)

**Validation Rules:**
- **Required:** Yes
- **Type:** String
- **Length:** 2-50 characters
- **Format:** Letters and spaces only (no numbers, no special characters)
- **Regex Pattern:** `^[a-zA-Z\s]{2,50}$`

**When to Validate:**
- **Frontend:** On blur, on submit
- **Backend:** Always (on every API request)

**Error Messages:**
- Empty: `"First name is required"`
- Too short (<2 chars): `"First name must be at least 2 characters"`
- Too long (>50 chars): `"First name must be 50 characters or less"`
- Invalid format: `"First name must contain only letters and spaces"`

**Implementation:**
- Frontend: Validate on blur, clear error on change
- Backend: Validate on every request, return 422 if invalid

---

### **2.5 Last Name Validation**

**Field:** Last Name (Sign-Up)

**Validation Rules:**
- **Required:** Yes
- **Type:** String
- **Length:** 2-50 characters
- **Format:** Letters and spaces only
- **Regex Pattern:** `^[a-zA-Z\s]{2,50}$`

**When to Validate:**
- **Frontend:** On blur, on submit
- **Backend:** Always (on every API request)

**Error Messages:**
- Empty: `"Last name is required"`
- Too short (<2 chars): `"Last name must be at least 2 characters"`
- Too long (>50 chars): `"Last name must be 50 characters or less"`
- Invalid format: `"Last name must contain only letters and spaces"`

**Implementation:**
- Frontend: Validate on blur, clear error on change
- Backend: Validate on every request, return 422 if invalid

---

### **2.6 Confirm Password Validation**

**Field:** Confirm Password (Sign-Up, Password Reset)

**Validation Rules:**
- **Required:** Yes
- **Type:** String
- **Must Match:** Must exactly match password field

**When to Validate:**
- **Frontend:** On submit only (not on blur, not while typing)
- **Backend:** Always (on every API request)

**Error Messages:**
- Empty: `"Please confirm your password"`
- Doesn't match: `"Passwords do not match"`

**Implementation:**
- Frontend: Validate only on submit
- Backend: Validate on every request, return 422 if doesn't match

---

### **2.7 OTP Validation**

**Field:** OTP (Sign-Up, Password Reset)

**Validation Rules:**
- **Required:** Yes
- **Type:** String
- **Length:** Exactly 6 digits
- **Format:** Numbers only (0-9)
- **Regex Pattern:** `^[0-9]{6}$`

**When to Validate:**
- **Frontend:** On submit only
- **Backend:** Always (on every API request)

**Error Messages:**
- Empty: `"OTP is required"`
- Invalid format: `"OTP must be 6 digits"`
- Invalid/Expired: `"Invalid or expired OTP. Please try again."`

**Implementation:**
- Frontend: Validate format on submit
- Backend: Validate format, then check against MongoDB

---

## **3. Business Logic Specifications**

### **3.1 Login Business Logic**

**Function:** `authService.login(email, password, rememberMe)`

**Steps:**
1. **Normalize Email:** Convert email to lowercase
2. **Check Account Lockout:**
   - Query `account_lockouts` collection by email
   - If exists and `lockedUntil > current time`: Return error "Account locked"
   - If exists and `lockedUntil <= current time`: Delete lockout record (auto-unlocked)
3. **Validate Credentials:**
   - Query `users` collection by email (lowercase)
   - If user not found: Return error "Invalid email or password" (generic)
   - Compare password hash (bcrypt.compare)
   - If password doesn't match: Return error "Invalid email or password" (generic)
4. **Handle Failed Attempts:**
   - If credentials invalid:
     - Increment failed attempts in `account_lockouts` collection
     - If failed attempts >= 5: Set `lockedUntil` to 15 minutes from now
     - Return error "Invalid email or password"
5. **Generate Tokens:**
   - Generate JWT token (expires in 15 minutes)
   - Generate refresh token (expires in 7 days or 30 days if rememberMe=true)
6. **Reset Failed Attempts:**
   - If credentials valid: Delete or reset `account_lockouts` record
7. **Return Success:**
   - Return user object (without password) + tokens

---

### **3.2 Sign-Up Business Logic**

**Function:** `authService.signup(firstName, lastName, email, password, otp)`

**Steps:**
1. **Normalize Email:** Convert email to lowercase
2. **Validate OTP:**
   - Query `otps` collection by email + type="signup"
   - Check if OTP matches
   - Check if OTP not expired (expiresAt > current time)
   - If invalid: Return error "Invalid or expired OTP"
3. **Check Email Uniqueness:**
   - Query `users` collection by email (lowercase)
   - If exists: Return error "This email is already registered"
4. **Validate Password Strength:**
   - Check all password requirements
   - If invalid: Return error with specific requirement missing
5. **Hash Password:**
   - Hash password using bcrypt (salt rounds: 10)
6. **Create User:**
   - Insert into `users` collection:
     - firstName, lastName, email (lowercase), password (hashed)
     - createdAt, updatedAt (current timestamp)
7. **Delete OTP:**
   - Delete OTP from `otps` collection (one-time use)
8. **Generate Tokens:**
   - Generate JWT token (expires in 15 minutes)
   - Generate refresh token (expires in 7 days)
9. **Return Success:**
   - Return user object (without password) + tokens

---

### **3.3 Password Reset Business Logic**

**Function:** `authService.resetPassword(email, otp, newPassword)`

**Steps:**
1. **Normalize Email:** Convert email to lowercase
2. **Validate OTP:**
   - Query `otps` collection by email + type="password-reset"
   - Check if OTP matches
   - Check if OTP not expired
   - If invalid: Return error "Invalid or expired OTP"
3. **Check User Exists:**
   - Query `users` collection by email (lowercase)
   - If not found: Return error "User not found" (but this shouldn't happen if OTP is valid)
4. **Validate New Password Strength:**
   - Check all password requirements
   - If invalid: Return error with specific requirement missing
5. **Hash New Password:**
   - Hash new password using bcrypt
6. **Update User:**
   - Update `users` collection:
     - Set password to new hashed password
     - Update `updatedAt` to current timestamp
7. **Delete OTP:**
   - Delete OTP from `otps` collection (one-time use)
8. **Return Success:**
   - Return success message

---

### **3.4 OTP Generation Business Logic**

**Function:** `otpService.generateAndStoreOTP(email, type)`

**Steps:**
1. **Check Rate Limiting:**
   - Query `otps` collection by email + type
   - Count OTPs created in last 15 minutes
   - If count >= 3: Return error "Too many OTP requests"
2. **Generate OTP:**
   - Generate random 6-digit number (000000-999999)
   - Ensure it's exactly 6 digits (pad with zeros if needed)
3. **Store OTP:**
   - Insert into `otps` collection:
     - email (lowercase), otp (6 digits), type, expiresAt (10 minutes from now)
     - createdAt (current timestamp)
4. **Return OTP:**
   - Return OTP (for testing - in production, would send via email/SMS)

---

### **3.5 Account Lockout Business Logic**

**Function:** `authService.checkAccountLockout(email)`

**Steps:**
1. **Query Lockout:**
   - Query `account_lockouts` collection by email (lowercase)
2. **Check Lock Status:**
   - If no record: Account not locked, return false
   - If record exists and `lockedUntil > current time`: Account locked, return true
   - If record exists and `lockedUntil <= current time`: Account unlocked (auto), delete record, return false
3. **Return Status:**
   - Return boolean (true = locked, false = not locked)

**Function:** `authService.incrementFailedAttempts(email)`

**Steps:**
1. **Query or Create:**
   - Query `account_lockouts` collection by email
   - If exists: Increment `failedAttempts`
   - If not exists: Create new record with `failedAttempts = 1`
2. **Check Lock Threshold:**
   - If `failedAttempts >= 5`:
     - Set `lockedUntil` to 15 minutes from now
     - Set `failedAttempts = 5` (don't increment beyond 5)
3. **Update Record:**
   - Update or insert `account_lockouts` collection

---

## **4. UI/UX Specifications**

### **4.1 Login Page**

**Page Component:** `LoginPage.jsx`

**Layout:**
- Centered form on page
- Form container with max-width (responsive)
- Tailwind CSS for styling

**Form Component:** `LoginForm.jsx`

**Fields:**
1. **Email Input:**
   - Label: "Email" (semantic: `aria-label="Email"`)
   - Placeholder: "Enter your email"
   - Type: email
   - Semantic: `role="textbox"`, `data-testid="login-email"`
   - Auto-convert to lowercase on input
   - Validation: On blur, show error below field

2. **Password Input:**
   - Label: "Password" (semantic: `aria-label="Password"`)
   - Placeholder: "Enter your password"
   - Type: password (with show/hide toggle)
   - Semantic: `role="textbox"`, `data-testid="login-password"`
   - Show/Hide toggle: Eye icon button (semantic: `role="button"`, `aria-label="Show password"`)
   - Validation: On submit only, show error below field

3. **Remember Me Checkbox:**
   - Label: "Remember Me"
   - Semantic: `role="checkbox"`, `data-testid="login-remember-me"`
   - Position: Below password field

4. **Sign In Button:**
   - Label: "Sign In"
   - Type: submit
   - Semantic: `role="button"`, `data-testid="login-submit"`
   - Loading state: Spinner when API call in progress
   - Disabled state: When loading or form invalid

5. **Forgot Password Link:**
   - Label: "Forgot Password?"
   - Semantic: `role="link"`, `data-testid="login-forgot-password"`
   - Position: Below Sign In button
   - Action: Navigate to `/forgot-password`

6. **Sign Up Link:**
   - Label: "Don't have an account? Sign Up"
   - Semantic: `role="link"`, `data-testid="login-sign-up"`
   - Position: Below Forgot Password link
   - Action: Navigate to `/signup`

**Error Display:**
- Email error: Below email field, red text, `role="alert"`, `aria-live="polite"`
- Password error: Below password field, red text, `role="alert"`, `aria-live="polite"`
- Login error: Below Sign In button, red text, `role="alert"`, `aria-live="assertive"`

**Loading States:**
- Sign In button: Shows spinner, disabled during API call
- Semantic: `aria-busy="true"` when loading

**Success Behavior:**
- After successful login: Redirect to `/items` (Item List page)
- Store JWT token in React state (memory)
- Store refresh token in httpOnly cookie (handled by backend)

---

### **4.2 Sign-Up Page**

**Page Component:** `SignUpPage.jsx`

**Form Component:** `SignUpForm.jsx`

**Fields:**
1. **First Name Input:**
   - Label: "First Name"
   - Semantic: `role="textbox"`, `data-testid="signup-first-name"`
   - Validation: On blur, show error below field

2. **Last Name Input:**
   - Label: "Last Name"
   - Semantic: `role="textbox"`, `data-testid="signup-last-name"`
   - Validation: On blur, show error below field

3. **Email Input:**
   - Label: "Email"
   - Semantic: `role="textbox"`, `data-testid="signup-email"`
   - Auto-convert to lowercase
   - Validation: On blur (format), on submit (format + uniqueness)

4. **Password Input:**
   - Label: "Password"
   - Semantic: `role="textbox"`, `data-testid="signup-password"`
   - Show/hide toggle
   - Real-time strength indicator (visual feedback)
   - Validation: Real-time (while typing), on submit

5. **Confirm Password Input:**
   - Label: "Confirm Password"
   - Semantic: `role="textbox"`, `data-testid="signup-confirm-password"`
   - Show/hide toggle
   - Validation: On submit only

6. **Sign Up Button:**
   - Label: "Sign Up"
   - Semantic: `role="button"`, `data-testid="signup-submit"`
   - Loading state during API calls

**OTP Section (shown after form submission):**
7. **OTP Input:**
   - Label: "Enter OTP"
   - Semantic: `role="textbox"`, `data-testid="signup-otp"`
   - Max length: 6 digits
   - Numbers only
   - Validation: On submit

8. **Resend OTP Link:**
   - Label: "Resend OTP"
   - Semantic: `role="button"`, `data-testid="signup-resend-otp"`
   - Action: Request new OTP (rate limited)

**Form Flow:**
1. User fills all fields → Clicks "Sign Up"
2. System validates → If invalid, show errors
3. If valid → Call API: `POST /auth/signup/request-otp`
4. Show OTP input field
5. User enters OTP → Clicks "Verify OTP" or submits
6. Call API: `POST /auth/signup/verify-otp`
7. If OTP valid → Call API: `POST /auth/signup`
8. If account created → Redirect to `/items`

---

### **4.3 Forgot Password Page**

**Page Component:** `ForgotPasswordPage.jsx`

**Form Component:** `ForgotPasswordForm.jsx`

**Fields:**
1. **Email Input:**
   - Label: "Email"
   - Semantic: `role="textbox"`, `data-testid="forgot-password-email"`
   - Auto-convert to lowercase

2. **Request OTP Button:**
   - Label: "Request OTP"
   - Semantic: `role="button"`, `data-testid="forgot-password-request-otp"`
   - Action: Call API: `POST /auth/forgot-password/request-otp`

**After OTP Request (shown conditionally):**
3. **OTP Input:**
   - Label: "Enter OTP"
   - Semantic: `role="textbox"`, `data-testid="forgot-password-otp"`
   - Max length: 6 digits

4. **New Password Input:**
   - Label: "New Password"
   - Semantic: `role="textbox"`, `data-testid="forgot-password-new-password"`
   - Show/hide toggle
   - Real-time strength indicator

5. **Confirm Password Input:**
   - Label: "Confirm New Password"
   - Semantic: `role="textbox"`, `data-testid="forgot-password-confirm-password"`
   - Show/hide toggle

6. **Reset Password Button:**
   - Label: "Reset Password"
   - Semantic: `role="button"`, `data-testid="forgot-password-submit"`
   - Action: Call API: `POST /auth/forgot-password/reset`

**Form Flow:**
1. User enters email → Clicks "Request OTP"
2. System shows generic message (doesn't reveal if email exists)
3. If email exists: Show OTP input
4. User enters OTP → System verifies
5. If OTP valid: Show password reset form
6. User enters new password → Clicks "Reset Password"
7. System resets password → Redirect to `/login`

---

### **4.4 Error Message Display**

**Location:**
- Field errors: Below input field
- Form errors: Below submit button
- Network errors: Below submit button

**Styling:**
- Color: Red text
- Font size: Small (text-sm in Tailwind)
- Margin: Top margin (mt-1 or mt-2)

**Semantic Attributes:**
- `role="alert"` - Screen reader announcement
- `aria-live="polite"` - For field errors (non-urgent)
- `aria-live="assertive"` - For form errors (urgent)
- `data-testid="[field-name]-error"` - For automation

**Behavior:**
- Error appears when validation fails
- Error clears when user starts typing (for field errors)
- Error clears when form is successfully submitted

---

### **4.5 Loading States**

**Button Loading:**
- Show spinner icon inside button
- Disable button (`disabled={true}`)
- Semantic: `aria-busy="true"`
- Text: Button label stays, spinner appears next to it

**Form Loading:**
- All inputs disabled during API call
- Submit button shows loading state
- Prevent form submission during loading

**Loading Indicator:**
- Use spinner component (CSS animation or icon)
- Position: Inside button or next to button text

---

### **4.6 Success States**

**After Login:**
- Brief success message (optional toast notification)
- Redirect to `/items` page
- Store tokens (JWT in memory, refresh in cookie)

**After Sign-Up:**
- Brief success message (optional)
- Auto-login (tokens stored)
- Redirect to `/items` page

**After Password Reset:**
- Success message: "Password updated successfully"
- Redirect to `/login` page

---

## **5. Error Handling Specifications**

### **5.1 Backend Error Handling**

**Error Response Format:**
```json
{
  "error": "Error message text"
}
```

**Status Code Mapping:**
- **400 Bad Request:** Missing required fields, invalid request format
- **401 Unauthorized:** Invalid credentials, invalid/expired token, invalid/expired OTP
- **404 Not Found:** Resource not found (OTP not found, user not found)
- **409 Conflict:** Duplicate email, account already exists
- **422 Unprocessable Entity:** Validation errors (password strength, field format)
- **429 Too Many Requests:** Rate limiting (login attempts, OTP requests)
- **500 Internal Server Error:** Server errors, database errors

**Error Messages (Exact Text):**

**Login Errors:**
- Missing email/password: `"Email and password are required"`
- Invalid credentials: `"Invalid email or password"`
- Account locked: `"Too many failed attempts. Account locked for 15 minutes."`
- Server error: `"Something went wrong. Please try again."`

**Sign-Up Errors:**
- Missing fields: `"All fields are required"`
- Invalid email format: `"Please enter a valid email address"`
- Email exists: `"This email is already registered"`
- Weak password: `"Password must be at least 8 characters with uppercase, lowercase, number, and special character"`
- Passwords don't match: `"Passwords do not match"`
- Invalid OTP: `"Invalid or expired OTP. Please try again."`
- OTP rate limited: `"Too many OTP requests. Please try again after 15 minutes."`

**Password Reset Errors:**
- Missing email: `"Email is required"`
- Invalid email format: `"Please enter a valid email address"`
- OTP rate limited: `"Too many password reset requests. Please try again after 15 minutes."`
- Invalid OTP: `"Invalid or expired OTP. Please try again."`
- Weak new password: `"Password must be at least 8 characters with uppercase, lowercase, number, and special character"`
- Passwords don't match: `"Passwords do not match"`

---

### **5.2 Frontend Error Handling**

**Error Display Rules:**
- Field errors: Show below input field, red text
- Form errors: Show below submit button, red text
- Network errors: Show below submit button, red text
- All errors: Clear when user starts typing (for field errors)

**Error Message Mapping:**
- **400:** Display backend error message
- **401:** Display backend error message
- **404:** Display backend error message
- **409:** Display backend error message
- **422:** Display backend error message
- **429:** Display backend error message
- **500:** Display: "Something went wrong. Please try again."
- **Network Error:** Display: "Connection failed. Please check your internet and try again."

**Error Recovery:**
- User can retry (form data preserved)
- User can fix errors and resubmit
- No automatic retry (user must manually retry)

---

## **6. Token Management Specifications**

### **6.1 JWT Token**

**Storage:**
- Location: React state (memory) - NOT localStorage
- Variable: `token` in AuthContext
- Lifetime: 15 minutes

**Usage:**
- Sent in Authorization header: `Authorization: Bearer <token>`
- Used for: Protected route access, API authentication

**Refresh:**
- When expired: Frontend automatically calls `/auth/refresh` endpoint
- Uses refresh token from httpOnly cookie
- Gets new JWT token
- Updates token in React state

---

### **6.2 Refresh Token**

**Storage:**
- Location: httpOnly cookie (set by backend)
- Name: `refreshToken`
- Lifetime: 7 days (or 30 days if rememberMe=true)
- Attributes: HttpOnly, Secure, SameSite=Strict

**Usage:**
- Used for: Refreshing JWT token when expired
- Not accessible via JavaScript (security)

**Clear:**
- On logout: Backend sets cookie with Max-Age=0
- On token expiration: Cookie expires automatically

---

## **7. Protected Route Specifications**

### **7.1 Route Protection Logic**

**Protected Routes:**
- `/items` (Item List)
- `/items/create` (Item Creation)
- `/items/:id` (Item Details)
- `/items/:id/edit` (Item Edit)
- All routes except: `/login`, `/signup`, `/forgot-password`

**Protection Check:**
1. Check if JWT token exists in React state
2. If no token: Redirect to `/login`
3. If token exists: Check if token is valid (not expired)
4. If token expired: Try refresh token
5. If refresh fails: Redirect to `/login`
6. If token valid: Allow access

**Redirect Behavior:**
- Store originally requested URL
- After login: Redirect to originally requested URL (if any)
- If no original URL: Redirect to `/items` (default)

---

## **8. Implementation Notes**

### **8.1 Backend Implementation**

**Password Hashing:**
- Library: bcrypt
- Salt rounds: 10
- Hash before storing in database
- Never return password in API responses

**Token Generation:**
- Library: jsonwebtoken
- JWT secret: From environment variable
- JWT expires: 15 minutes
- Refresh token: Random string, stored in database or signed JWT

**Rate Limiting:**
- Library: express-rate-limit
- Storage: In-memory (for development) or Redis (for production)
- Per email (not per IP)

**Database Operations:**
- Use Mongoose ODM
- Use transactions for multi-step operations (if needed)
- Handle connection errors gracefully

---

### **8.2 Frontend Implementation**

**Form Handling:**
- Use React hooks (useState for form state)
- Use custom hook (useForm) for validation
- Handle async operations (API calls) properly

**API Calls:**
- Use Axios or Fetch API
- Base URL: From environment variable
- Interceptors: Add JWT token to requests, handle 401 errors

**State Management:**
- AuthContext for global auth state
- Local state for form data
- No global state library needed (Context API is enough)

**Semantic HTML:**
- Use proper HTML elements (input, button, form)
- Add ARIA attributes (role, aria-label, aria-live)
- Add data-testid attributes for automation

---

**Document Version:** 1.0  
**Status:** Draft - Ready for Review  
**Next:** Test Strategy (Phase 2)

