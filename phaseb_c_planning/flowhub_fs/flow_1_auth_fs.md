# **FlowHub — Functional Specification: Flow 1 - Authentication**

**Version:** 1.0  
**Date:** November 30, 2024  
**Author:** Business Analyst  
**Status:** Draft  
**Based on:** PRD Version 2.1 (Final)

---

## **1. Overview**

This document defines the detailed functional requirements for FlowHub Authentication flow, including Login, Sign-Up, Password Reset, and Logout functionalities.

**Flow Name:** Authentication  
**Flow ID:** FLOW-001  
**PRD Reference:** flow_1_auth_prd.md (Version 2.1)

---

## **2. User Stories**

### **2.1 Login**

**As a** user  
**I want to** log in to FlowHub with my email and password  
**So that** I can access my items and manage my work securely

### **2.2 Sign-Up**

**As a** new user  
**I want to** create an account with my details and verify with OTP  
**So that** I can start using FlowHub

### **2.3 Password Reset**

**As a** user  
**I want to** reset my password using OTP verification  
**So that** I can regain access if I forget my password

### **2.4 Logout**

**As a** logged-in user  
**I want to** log out of FlowHub  
**So that** I can securely end my session

---

## **3. Functional Requirements**

### **3.1 Login Flow**

#### **FR-1.1: Login Page Display**

**Requirement:** System shall display a login page with the following elements:

- **Email Input Field:**
  - Type: Email input
  - Label: "Email" or placeholder "Enter your email"
  - Required: Yes
  - Auto-convert to lowercase on input
  - Semantic: `role="textbox"`, `aria-label="Email"`, `data-testid="login-email"`

- **Password Input Field:**
  - Type: Password input (with show/hide toggle)
  - Label: "Password" or placeholder "Enter your password"
  - Required: Yes
  - Show/Hide toggle button (eye icon)
  - Semantic: `role="textbox"`, `aria-label="Password"`, `data-testid="login-password"`

- **Sign In Button:**
  - Type: Submit button
  - Label: "Sign In"
  - Semantic: `role="button"`, `aria-label="Sign In"`, `data-testid="login-submit"`

- **Remember Me Checkbox:**
  - Type: Checkbox
  - Label: "Remember Me"
  - Optional: Yes
  - Semantic: `role="checkbox"`, `aria-label="Remember Me"`, `data-testid="login-remember-me"`

- **Forgot Password Link:**
  - Type: Link/Button
  - Label: "Forgot Password?"
  - Semantic: `role="link"`, `aria-label="Forgot Password"`, `data-testid="login-forgot-password"`

- **Sign Up Link:**
  - Type: Link/Button
  - Label: "Don't have an account? Sign Up"
  - Semantic: `role="link"`, `aria-label="Sign Up"`, `data-testid="login-sign-up"`

---

#### **FR-1.2: Email Input Validation**

**Requirement:** System shall validate email input with the following rules:

- **On Blur (when user leaves field):**
  - If empty: Show error "Email is required"
  - If invalid format: Show error "Please enter a valid email address"
  - Error displayed below input field in red text
  - Semantic: `role="alert"`, `aria-live="polite"`, `data-testid="email-error"`

- **On Change (while typing):**
  - Clear error message if field becomes valid
  - Auto-convert to lowercase

- **On Submit:**
  - Validate again (even if validated on blur)
  - Prevent form submission if invalid

**Validation Rules:**
- Required: Yes
- Format: Valid email format (regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`)
- Case: Converted to lowercase automatically
- Max Length: 100 characters

---

#### **FR-1.3: Password Input Validation**

**Requirement:** System shall validate password input with the following rules:

- **On Blur:**
  - No validation on blur (validation only on submit)

- **On Change (while typing):**
  - Clear error message if field has value

- **On Submit:**
  - If empty: Show error "Password is required"
  - Error displayed below input field in red text
  - Semantic: `role="alert"`, `aria-live="polite"`, `data-testid="password-error"`

**Validation Rules:**
- Required: Yes
- No format validation (password strength not checked on login)

---

#### **FR-1.4: Sign In Button Behavior**

**Requirement:** System shall handle Sign In button click with the following behavior:

- **On Click:**
  1. Validate all fields (email and password)
  2. If any field invalid: Show errors, prevent submission
  3. If all fields valid:
     - Disable button
     - Show loading spinner
     - Call API: `POST /auth/login`
     - Request body: `{ "email": "user@example.com", "password": "password123" }`

- **During API Call:**
  - Button shows loading state (spinner, disabled)
  - Semantic: `aria-busy="true"`, `disabled="true"`

- **On Success (200 OK):**
  - Response: `{ "token": "jwt-token", "refreshToken": "refresh-token" }`
  - Store JWT token in memory (React state)
  - Store refresh token in httpOnly cookie
  - Redirect to Item List page (or originally requested page)
  - Show success message (optional, brief toast)

- **On Error:**
  - **401 Unauthorized:** Show error "Invalid email or password" below button
  - **429 Too Many Requests:** Show error "Too many failed attempts. Account locked for [X] minutes."
  - **500 Server Error:** Show error "Something went wrong. Please try again."
  - **Network Error:** Show error "Connection failed. Please check your internet and try again."
  - Re-enable button
  - Clear loading state
  - Semantic: `role="alert"`, `aria-live="assertive"`, `data-testid="login-error"`

---

#### **FR-1.5: Remember Me Checkbox**

**Requirement:** System shall handle Remember Me checkbox:

- **If Checked:**
  - Refresh token expiration: 30 days
  - Session persists across browser restarts

- **If Unchecked:**
  - Refresh token expiration: 7 days
  - Session persists until logout or expiration

- **Behavior:**
  - Checkbox state stored in form state
  - Sent to backend with login request (optional field)
  - Backend sets cookie expiration based on this value

---

### **3.2 Sign-Up Flow**

#### **FR-2.1: Sign-Up Page Display**

**Requirement:** System shall display a sign-up page with the following elements:

- **First Name Input:**
  - Type: Text input
  - Label: "First Name"
  - Required: Yes
  - Semantic: `role="textbox"`, `aria-label="First Name"`, `data-testid="signup-first-name"`

- **Last Name Input:**
  - Type: Text input
  - Label: "Last Name"
  - Required: Yes
  - Semantic: `role="textbox"`, `aria-label="Last Name"`, `data-testid="signup-last-name"`

- **Email Input:**
  - Type: Email input
  - Label: "Email"
  - Required: Yes
  - Auto-convert to lowercase
  - Semantic: `role="textbox"`, `aria-label="Email"`, `data-testid="signup-email"`

- **Password Input:**
  - Type: Password input (with show/hide toggle)
  - Label: "Password"
  - Required: Yes
  - Real-time password strength indicator
  - Semantic: `role="textbox"`, `aria-label="Password"`, `data-testid="signup-password"`

- **Confirm Password Input:**
  - Type: Password input (with show/hide toggle)
  - Label: "Confirm Password"
  - Required: Yes
  - Semantic: `role="textbox"`, `aria-label="Confirm Password"`, `data-testid="signup-confirm-password"`

- **Sign Up Button:**
  - Type: Submit button
  - Label: "Sign Up"
  - Semantic: `role="button"`, `aria-label="Sign Up"`, `data-testid="signup-submit"`

- **OTP Input Field (shown after form submission):**
  - Type: Text input (numbers only)
  - Label: "Enter OTP"
  - Required: Yes
  - Max length: 6 digits
  - Semantic: `role="textbox"`, `aria-label="Enter OTP"`, `data-testid="signup-otp"`

- **Resend OTP Link:**
  - Type: Link/Button
  - Label: "Resend OTP"
  - Semantic: `role="button"`, `aria-label="Resend OTP"`, `data-testid="signup-resend-otp"`

---

#### **FR-2.2: Sign-Up Form Validation**

**Requirement:** System shall validate sign-up form fields:

**First Name:**
- Required: Yes
- Min length: 2 characters
- Max length: 50 characters
- Format: Letters and spaces only (no numbers, special characters)
- Validation: On blur and on submit
- Error: "First name must be 2-50 characters and contain only letters"

**Last Name:**
- Required: Yes
- Min length: 2 characters
- Max length: 50 characters
- Format: Letters and spaces only
- Validation: On blur and on submit
- Error: "Last name must be 2-50 characters and contain only letters"

**Email:**
- Required: Yes
- Format: Valid email format
- Uniqueness: Must not exist in database
- Validation: On blur (format), on submit (format + uniqueness)
- Error (format): "Please enter a valid email address"
- Error (exists): "This email is already registered"

**Password:**
- Required: Yes
- Strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (!@#$%^&*)
- Real-time validation: Show strength indicator while typing
- Validation: On change (real-time), on submit
- Error: "Password must be at least 8 characters with uppercase, lowercase, number, and special character"

**Confirm Password:**
- Required: Yes
- Must match password exactly
- Validation: On submit only
- Error: "Passwords do not match"

---

#### **FR-2.3: Sign-Up Process**

**Requirement:** System shall handle sign-up process:

1. **Form Submission:**
   - User fills all fields
   - User clicks "Sign Up" button
   - System validates all fields
   - If invalid: Show errors, prevent submission
   - If valid: Proceed to step 2

2. **OTP Generation:**
   - System calls API: `POST /auth/signup/request-otp`
   - Request body: `{ "email": "user@example.com" }`
   - System generates 6-digit OTP
   - System stores OTP in MongoDB:
     - Collection: `otps`
     - Document: `{ email: "user@example.com", otp: "123456", expiresAt: Date, type: "signup" }`
     - Expiration: 10 minutes from generation
   - System shows OTP input field
   - System shows message: "OTP has been generated. Please check MongoDB for OTP."

3. **OTP Verification:**
   - User enters 6-digit OTP
   - User clicks "Verify OTP" or submits form
   - System calls API: `POST /auth/signup/verify-otp`
   - Request body: `{ "email": "user@example.com", "otp": "123456" }`
   - System validates OTP:
     - Check if OTP exists in MongoDB
     - Check if OTP matches
     - Check if OTP not expired
   - If invalid: Show error "Invalid or expired OTP. Please try again."
   - If valid: Proceed to step 4

4. **Account Creation:**
   - System calls API: `POST /auth/signup`
   - Request body: `{ "firstName": "John", "lastName": "Doe", "email": "user@example.com", "password": "Password123!" }`
   - System creates user account in database:
     - Collection: `users`
     - Document: `{ firstName, lastName, email (lowercase), password (hashed), createdAt, updatedAt }`
   - System generates JWT token + Refresh token
   - System stores tokens (JWT in memory, Refresh in httpOnly cookie)
   - System automatically logs in user
   - System redirects to Item List page

5. **OTP Resend:**
   - User clicks "Resend OTP" link
   - System checks rate limiting (3 requests per 15 minutes)
   - If rate limited: Show error "Too many OTP requests. Please try again after 15 minutes."
   - If allowed: Generate new OTP, update MongoDB, show new OTP input

---

### **3.3 Password Reset Flow**

#### **FR-3.1: Forgot Password Page Display**

**Requirement:** System shall display forgot password page:

- **Email Input Field:**
  - Type: Email input
  - Label: "Email"
  - Required: Yes
  - Auto-convert to lowercase
  - Semantic: `role="textbox"`, `aria-label="Email"`, `data-testid="forgot-password-email"`

- **Request OTP Button:**
  - Type: Button
  - Label: "Request OTP"
  - Semantic: `role="button"`, `aria-label="Request OTP"`, `data-testid="forgot-password-request-otp"`

- **OTP Input Field (shown after OTP request):**
  - Type: Text input (numbers only)
  - Label: "Enter OTP"
  - Required: Yes
  - Max length: 6 digits
  - Semantic: `role="textbox"`, `aria-label="Enter OTP"`, `data-testid="forgot-password-otp"`

- **New Password Input:**
  - Type: Password input (with show/hide toggle)
  - Label: "New Password"
  - Required: Yes
  - Real-time password strength indicator
  - Semantic: `role="textbox"`, `aria-label="New Password"`, `data-testid="forgot-password-new-password"`

- **Confirm Password Input:**
  - Type: Password input (with show/hide toggle)
  - Label: "Confirm New Password"
  - Required: Yes
  - Semantic: `role="textbox"`, `aria-label="Confirm New Password"`, `data-testid="forgot-password-confirm-password"`

- **Reset Password Button:**
  - Type: Submit button
  - Label: "Reset Password"
  - Semantic: `role="button"`, `aria-label="Reset Password"`, `data-testid="forgot-password-submit"`

- **Resend OTP Link:**
  - Type: Link/Button
  - Label: "Resend OTP"
  - Semantic: `role="button"`, `aria-label="Resend OTP"`, `data-testid="forgot-password-resend-otp"`

---

#### **FR-3.2: Forgot Password Process**

**Requirement:** System shall handle forgot password process:

1. **OTP Request:**
   - User enters email
   - User clicks "Request OTP" button
   - System calls API: `POST /auth/forgot-password/request-otp`
   - Request body: `{ "email": "user@example.com" }`
   - System checks if email exists in database:
     - **If exists:**
       - Generate 6-digit OTP
       - Store OTP in MongoDB: `{ email, otp, expiresAt, type: "password-reset" }`
       - Show generic message: "If this email exists, OTP has been sent."
       - Show OTP input field
     - **If doesn't exist:**
       - Show same generic message: "If this email exists, OTP has been sent." (security - doesn't reveal)
       - Don't generate OTP
       - Don't show OTP input field
   - System checks rate limiting (3 requests per 15 minutes per email)
   - If rate limited: Show error "Too many password reset requests. Please try again after 15 minutes."

2. **OTP Verification:**
   - User enters 6-digit OTP
   - System calls API: `POST /auth/forgot-password/verify-otp`
   - Request body: `{ "email": "user@example.com", "otp": "123456" }`
   - System validates OTP (same as sign-up)
   - If invalid: Show error "Invalid or expired OTP. Please try again."
   - If valid: Show password reset form

3. **Password Reset:**
   - User enters new password (with strength requirements)
   - User confirms new password
   - System validates:
     - Password meets strength requirements
     - Passwords match
   - User clicks "Reset Password" button
   - System calls API: `POST /auth/forgot-password/reset`
   - Request body: `{ "email": "user@example.com", "otp": "123456", "newPassword": "NewPassword123!" }`
   - System validates OTP again
   - System updates password in database (hashed)
   - System shows success message: "Password updated successfully"
   - System redirects to login page

---

### **3.4 Logout Flow**

#### **FR-4.1: Logout Functionality**

**Requirement:** System shall provide logout functionality:

- **Logout Button:**
  - Location: Navigation menu/header
  - Label: "Logout" or icon with label
  - Semantic: `role="button"`, `aria-label="Logout"`, `data-testid="logout-button"`

- **Logout Process:**
  1. User clicks "Logout" button
  2. System calls API: `POST /auth/logout`
  3. System clears JWT token from memory
  4. System clears refresh token from httpOnly cookie
  5. System redirects to login page
  6. System shows message: "You have been logged out successfully" (optional)

---

## **4. API Endpoints**

### **4.1 Login**

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-string",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Responses:**
- **400 Bad Request:** `{ "error": "Email and password are required" }`
- **401 Unauthorized:** `{ "error": "Invalid email or password" }`
- **429 Too Many Requests:** `{ "error": "Too many failed attempts. Account locked for 15 minutes." }`
- **500 Internal Server Error:** `{ "error": "Something went wrong. Please try again." }`

---

### **4.2 Sign-Up Request OTP**

**Endpoint:** `POST /auth/signup/request-otp`

**Request:**
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
- **409 Conflict:** `{ "error": "This email is already registered" }`
- **429 Too Many Requests:** `{ "error": "Too many OTP requests. Please try again after 15 minutes." }`

---

### **4.3 Sign-Up Verify OTP**

**Endpoint:** `POST /auth/signup/verify-otp`

**Request:**
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

### **4.4 Sign-Up**

**Endpoint:** `POST /auth/signup`

**Request:**
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
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Responses:**
- **400 Bad Request:** `{ "error": "All fields are required" }`
- **409 Conflict:** `{ "error": "This email is already registered" }`
- **401 Unauthorized:** `{ "error": "Invalid or expired OTP" }`
- **422 Unprocessable Entity:** `{ "error": "Password does not meet strength requirements" }`

---

### **4.5 Forgot Password Request OTP**

**Endpoint:** `POST /auth/forgot-password/request-otp`

**Request:**
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

**Error Responses:**
- **400 Bad Request:** `{ "error": "Email is required" }`
- **429 Too Many Requests:** `{ "error": "Too many password reset requests. Please try again after 15 minutes." }`

**Note:** Response is same whether email exists or not (security)

---

### **4.6 Forgot Password Verify OTP**

**Endpoint:** `POST /auth/forgot-password/verify-otp`

**Request:**
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

### **4.7 Forgot Password Reset**

**Endpoint:** `POST /auth/forgot-password/reset`

**Request:**
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

### **4.8 Logout**

**Endpoint:** `POST /auth/logout`

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

**Error Responses:**
- **401 Unauthorized:** `{ "error": "Unauthorized" }`

---

## **5. Acceptance Criteria**

### **5.1 Login**

**AC-1.1:** User can successfully log in with valid email and password
- Given: User has valid account
- When: User enters valid email and password, clicks "Sign In"
- Then: User is logged in, redirected to Item List page, tokens stored

**AC-1.2:** User cannot log in with invalid credentials
- Given: User enters invalid email or password
- When: User clicks "Sign In"
- Then: Error message "Invalid email or password" is displayed, user stays on login page

**AC-1.3:** Email validation works correctly
- Given: User enters invalid email format or empty email
- When: User leaves email field (blur) or clicks "Sign In"
- Then: Appropriate error message is displayed below email field

**AC-1.4:** Password validation works correctly
- Given: User enters empty password
- When: User clicks "Sign In"
- Then: Error message "Password is required" is displayed below password field

**AC-1.5:** Remember Me checkbox works
- Given: User checks "Remember Me" checkbox
- When: User logs in successfully
- Then: Refresh token expires in 30 days (instead of 7 days)

**AC-1.6:** Account lockout works after 5 failed attempts
- Given: User attempts login 5 times with wrong password
- When: User attempts 6th login
- Then: Account is locked, error message shows lockout duration

**AC-1.7:** Loading state is shown during login
- Given: User clicks "Sign In" button
- When: API call is in progress
- Then: Button shows loading spinner, button is disabled

---

### **5.2 Sign-Up**

**AC-2.1:** User can create account with valid information
- Given: User fills all required fields correctly
- When: User submits sign-up form, verifies OTP
- Then: Account is created, user is automatically logged in, redirected to Item List

**AC-2.2:** First name validation works
- Given: User enters invalid first name (too short, numbers, special chars)
- When: User leaves field or submits form
- Then: Error message is displayed, form submission prevented

**AC-2.3:** Last name validation works
- Given: User enters invalid last name
- When: User leaves field or submits form
- Then: Error message is displayed, form submission prevented

**AC-2.4:** Email uniqueness validation works
- Given: User enters email that already exists
- When: User submits form
- Then: Error message "This email is already registered" is displayed

**AC-2.5:** Password strength validation works
- Given: User enters password that doesn't meet requirements
- When: User types password
- Then: Real-time strength indicator shows, error message on submit

**AC-2.6:** Confirm password validation works
- Given: User enters password and different confirm password
- When: User submits form
- Then: Error message "Passwords do not match" is displayed

**AC-2.7:** OTP verification works
- Given: User requests OTP for sign-up
- When: User enters correct OTP from MongoDB
- Then: OTP is verified, account creation proceeds

**AC-2.8:** OTP expiration works
- Given: OTP was generated 11 minutes ago
- When: User enters OTP
- Then: Error message "Invalid or expired OTP" is displayed

**AC-2.9:** OTP rate limiting works
- Given: User has requested OTP 3 times in 15 minutes
- When: User requests 4th OTP
- Then: Error message "Too many OTP requests" is displayed

---

### **5.3 Password Reset**

**AC-3.1:** User can request OTP for password reset
- Given: User enters email (exists or doesn't exist)
- When: User clicks "Request OTP"
- Then: Generic message is shown (doesn't reveal if email exists)

**AC-3.2:** OTP is only generated if email exists
- Given: User enters email that doesn't exist
- When: User clicks "Request OTP"
- Then: Generic message shown, but no OTP generated (user doesn't know)

**AC-3.3:** Password reset rate limiting works
- Given: User has requested password reset 3 times in 15 minutes
- When: User requests 4th time
- Then: Error message "Too many password reset requests" is displayed

**AC-3.4:** User can reset password with valid OTP
- Given: User has valid OTP
- When: User enters new password, confirms, submits
- Then: Password is updated, user redirected to login page

**AC-3.5:** New password strength validation works
- Given: User enters new password that doesn't meet requirements
- When: User submits password reset
- Then: Error message is displayed, password not updated

---

### **5.4 Logout**

**AC-4.1:** User can log out successfully
- Given: User is logged in
- When: User clicks "Logout" button
- Then: Tokens are cleared, user redirected to login page

**AC-4.2:** User cannot access protected pages after logout
- Given: User has logged out
- When: User tries to access protected page
- Then: User is redirected to login page

---

## **6. Error Cases**

### **6.1 Login Errors**

- Invalid email format → "Please enter a valid email address"
- Empty email → "Email is required"
- Empty password → "Password is required"
- Invalid credentials → "Invalid email or password"
- Account locked → "Too many failed attempts. Account locked for [X] minutes."
- Network error → "Connection failed. Please check your internet and try again."
- Server error → "Something went wrong. Please try again."

### **6.2 Sign-Up Errors**

- Invalid first name → "First name must be 2-50 characters and contain only letters"
- Invalid last name → "Last name must be 2-50 characters and contain only letters"
- Invalid email format → "Please enter a valid email address"
- Email already exists → "This email is already registered"
- Weak password → "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
- Passwords don't match → "Passwords do not match"
- Invalid OTP → "Invalid or expired OTP. Please try again."
- OTP rate limited → "Too many OTP requests. Please try again after 15 minutes."

### **6.3 Password Reset Errors**

- Invalid email format → "Please enter a valid email address"
- OTP rate limited → "Too many password reset requests. Please try again after 15 minutes."
- Invalid OTP → "Invalid or expired OTP. Please try again."
- Weak new password → "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
- Passwords don't match → "Passwords do not match"

---

## **7. Database Requirements**

### **7.1 Users Collection**

**Collection:** `users`

**Schema:**
```javascript
{
  _id: ObjectId,
  firstName: String (required, 2-50 chars),
  lastName: String (required, 2-50 chars),
  email: String (required, unique, lowercase, indexed),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique index)

---

### **7.2 OTPs Collection**

**Collection:** `otps`

**Schema:**
```javascript
{
  _id: ObjectId,
  email: String (required, indexed),
  otp: String (required, 6 digits),
  type: String (required, enum: ["signup", "password-reset"]),
  expiresAt: Date (required, indexed),
  createdAt: Date
}
```

**Indexes:**
- `email` + `type` (compound index)
- `expiresAt` (TTL index for auto-deletion)

---

### **7.3 Account Lockouts Collection (Optional)**

**Collection:** `account_lockouts`

**Schema:**
```javascript
{
  _id: ObjectId,
  email: String (required, indexed),
  lockedUntil: Date (required),
  failedAttempts: Number (default: 0),
  createdAt: Date
}
```

**Indexes:**
- `email` (index)
- `lockedUntil` (TTL index for auto-cleanup)

---

## **8. Security Requirements**

### **8.1 Password Security**

- Passwords must be hashed using bcrypt (or similar)
- Password strength requirements enforced
- Passwords never returned in API responses
- Password reset requires OTP verification

### **8.2 Token Security**

- JWT tokens: Short-lived (15 minutes)
- Refresh tokens: Long-lived (7 or 30 days), stored in httpOnly cookie
- Tokens include user ID and email
- Tokens signed with secret key
- Refresh token rotation (optional, for V2)

### **8.3 Rate Limiting**

- Login attempts: 5 per 15 minutes per email
- OTP requests: 3 per 15 minutes per email
- Password reset requests: 3 per 15 minutes per email
- Rate limiting per email (not per IP)

### **8.4 Input Validation**

- All inputs validated on backend (never trust frontend)
- Email converted to lowercase
- SQL injection prevention (MongoDB handles this)
- XSS prevention (sanitize inputs)
- CSRF protection (if using cookies)

---

## **9. Non-Functional Requirements**

### **9.1 Performance**

- Login API response time: < 500ms
- OTP generation: < 200ms
- Page load time: < 2 seconds
- Form validation: Real-time (< 100ms)

### **9.2 Usability**

- All form fields have clear labels
- Error messages are clear and helpful
- Loading states visible during API calls
- Responsive design (mobile, tablet, desktop)
- Accessible (WCAG 2.1 Level AA)

### **9.3 Reliability**

- 99.9% uptime
- Graceful error handling
- No data loss
- Database backups

---

## **10. Test Scenarios (High-Level)**

### **10.1 Login Test Scenarios**

1. **Positive:** Valid email and password → Success
2. **Negative:** Invalid email → Error message
3. **Negative:** Invalid password → Error message
4. **Negative:** Empty email → Validation error
5. **Negative:** Empty password → Validation error
6. **Negative:** Account locked → Lockout message
7. **Edge:** Remember Me checked → Extended session
8. **Edge:** Network error → Error message

### **10.2 Sign-Up Test Scenarios**

1. **Positive:** Valid data + OTP → Account created
2. **Negative:** Invalid first name → Validation error
3. **Negative:** Invalid last name → Validation error
4. **Negative:** Invalid email → Validation error
5. **Negative:** Email exists → Error message
6. **Negative:** Weak password → Validation error
7. **Negative:** Passwords don't match → Error message
8. **Negative:** Invalid OTP → Error message
9. **Negative:** Expired OTP → Error message
10. **Edge:** OTP rate limited → Error message

### **10.3 Password Reset Test Scenarios**

1. **Positive:** Valid email + OTP + new password → Password reset
2. **Negative:** Invalid email → Generic message
3. **Negative:** Email doesn't exist → Generic message (security)
4. **Negative:** Invalid OTP → Error message
5. **Negative:** Weak new password → Validation error
6. **Negative:** Passwords don't match → Error message
7. **Edge:** Rate limited → Error message

### **10.4 Logout Test Scenarios**

1. **Positive:** User clicks logout → Logged out, redirected
2. **Edge:** User tries to access protected page after logout → Redirected to login

---

## **11. Dependencies**

### **11.1 External Dependencies**

- MongoDB database (for user data, OTPs)
- JWT library (for token generation/validation)
- bcrypt library (for password hashing)
- Express.js (for API endpoints)

### **11.2 Internal Dependencies**

- All other flows depend on this flow (authentication required)
- Navigation component (for logout button)
- Protected route middleware (for redirecting unauthenticated users)

---

## **12. Open Questions / TBD**

- Should we implement refresh token rotation?
- Should we add "Remember this device" feature?
- Should we add login history/audit log?
- Should we implement password change (different from reset)?

---

**Document Version:** 1.0  
**Status:** Draft - Ready for Review  
**Next:** Test Scenarios can be derived from Acceptance Criteria