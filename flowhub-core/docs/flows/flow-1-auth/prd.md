# **FlowHub — PRD: Flow 1 - Authentication**

**Version:** 2.2 (Updated to match implementation)  
**Date:** December 2024  
**Author:** Product Manager  
**Status:** ✅ UPDATED - Synchronized with implementation

---

## **1. Overview**

FlowHub requires user authentication to ensure secure access to the application. Users must log in before accessing any features.

**Flow Name:** Authentication (Login)  
**Flow ID:** FLOW-001  
**Priority:** P0 (Critical - Blocks all other flows)

---

## **2. Problem Statement**

Users need a secure way to access FlowHub. Without authentication, there's no way to:
- Identify who is using the system
- Track user actions
- Provide personalized experiences
- Ensure data security

---

## **3. Business Value**

- **Security:** Protect user data and system access
- **Personalization:** Enable user-specific features
- **Audit Trail:** Track who performed what actions
- **Access Control:** Restrict unauthorized access

---

## **4. User Story**

**As a** user  
**I want to** log in to FlowHub  
**So that** I can access my items and manage my work securely

---

## **5. User Journey**

### **Login Flow:**
1. User navigates to FlowHub application
2. **If refresh token cookie exists:** System automatically calls `/auth/refresh` to restore session
3. **If no valid session:** User sees login page
4. User enters email (converted to lowercase automatically)
5. User enters password (with show/hide toggle)
6. User optionally checks "Remember Me" checkbox
7. User clicks "Sign In" button
8. System validates credentials
9. System generates JWT token + Refresh token
10. System stores tokens securely:
    - JWT stored in memory (React state)
    - Refresh token stored in httpOnly cookie (7 days if Remember Me unchecked, 30 days if checked)
11. System redirects user to Dashboard page
12. User can now access FlowHub features

### **Password Reset Flow (3-Step Process):**

**Step 1: Request OTP**
1. User clicks "Forgot Password" link on login page
2. User enters email address
3. User clicks "Request OTP" button
4. System validates email format
5. System generates 6-digit OTP (regardless of whether email exists - security best practice)
6. System stores OTP in MongoDB (with expiration: 10 minutes)
7. **System shows generic message:** "If this email exists, OTP has been sent." (security - doesn't reveal if email exists)
8. **In development mode:** OTP is included in API response and logged to console for testing convenience
9. System transitions to Step 2 (OTP input screen)

**Step 2: Verify OTP**
9. User sees OTP input field
10. User enters 6-digit OTP from MongoDB (for testing - no email/SMS)
11. User clicks "Verify OTP" button
12. System validates OTP format and checks against stored OTP
13. **If OTP is invalid:** System shows error: "Invalid OTP. Please try again."
14. **If OTP is expired:** System shows error: "OTP has expired. Please request a new one."
15. **If OTP is valid:** System shows success message: "OTP verified successfully!"
16. System transitions to Step 3 (Password reset screen)

**Step 3: Reset Password**
17. User sees password reset form with fields:
    - New Password (required, meets strength requirements)
    - Confirm New Password (required, must match new password)
18. User enters new password
19. User confirms new password
20. User clicks "Reset Password" button
21. System validates password strength
22. System validates passwords match
23. **System checks if new password is different from current password**
    - **If new password matches current password:** System shows error: "New password must be different from your current password"
    - **If new password is different:** Proceed to next step
24. System consumes OTP (marks as used)
25. System updates password in database
26. System shows success message: "Password reset successfully! Redirecting to login..."
27. System automatically redirects user to login page after 2 seconds

### **Sign-Up Flow (3-Step Process):**

**Step 1: Fill Registration Form**
1. User clicks "Sign Up" link on login page
2. User sees sign-up form with fields:
   - First Name (required, 2-50 characters, letters only)
   - Last Name (required, 2-50 characters, letters only)
   - Email (required, valid email format, unique)
   - Password (required, meets strength requirements)
   - Confirm Password (required, must match password)
3. User fills all fields
4. User clicks "Request OTP" button
5. System validates all fields (client-side validation)
6. **System checks if email already exists in database**
   - **If email exists:** System shows error: "This email is already registered" (HTTP 409 Conflict)
   - **If email doesn't exist:** Proceed to next step
7. System generates 6-digit OTP
8. System stores OTP in MongoDB (with expiration: 10 minutes)
9. System shows success message: "OTP has been sent to {email}. Please check your email."
10. **In development mode:** OTP is included in API response and logged to console for testing convenience
11. System transitions to Step 2 (OTP input screen)

**Step 2: Verify OTP**
11. User sees OTP input field
12. User enters 6-digit OTP from MongoDB (for testing - no email/SMS)
13. User clicks "Verify OTP" button
14. System validates OTP format and checks against stored OTP
15. **If OTP is invalid:** System shows error: "Invalid OTP. Please try again."
16. **If OTP is expired:** System shows error: "OTP has expired. Please request a new one."
17. **If OTP is valid:** System shows success message: "OTP verified successfully!"
18. System transitions to Step 3 (Complete signup screen)

**Step 3: Complete Signup**
19. User sees "Complete Sign Up" button
20. User clicks "Complete Sign Up" button
21. System validates OTP again (to ensure it hasn't been consumed)
22. System validates password strength
23. System creates user account in database
24. System generates JWT token + Refresh token
25. System stores tokens securely:
    - JWT stored in memory (React state)
    - Refresh token stored in httpOnly cookie (7 days)
26. System automatically logs in user (token set in AuthContext)
27. System redirects user to Dashboard page

### **Logout Flow:**
1. User clicks "Logout" button
2. System clears ALL authentication data:
   - JWT token (cleared from memory)
   - Refresh token (cleared from httpOnly cookie)
   - User session data (cleared from memory)
   - All cookies related to authentication
3. System redirects user to login page
4. User must log in again to access the application

---

## **6. Security Clarifications**

**Authentication Method:**
- **JWT Token:** Short-lived (15 minutes), stored in memory (React state)
- **Refresh Token:** Long-lived (7 days default, 30 days if Remember Me), stored in httpOnly cookie
- **Auto-Refresh:** When JWT expires (401 response), system automatically calls `/auth/refresh` endpoint using refresh token cookie to get new JWT
- **Session Restoration:** On page refresh/browser restart, app calls `/auth/refresh` endpoint on mount to restore session using refresh token cookie

**Token Storage:**
- JWT: Stored in memory (React state) - NOT in localStorage or sessionStorage
- Refresh Token: Stored in httpOnly cookie with SameSite=Strict (secure, not accessible via JavaScript, CSRF protected)

**Password Strength Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

**Session Management:**
- **Multiple Sessions:** Allowed - user can log in from multiple devices/browsers
- **Session Timeout:** No auto-logout - session persists until user logs out or refresh token expires
- **Remember Me:** Only affects refresh token cookie expiration (30 days instead of 7 days). JWT always stored in memory regardless of Remember Me setting.
- **Page Refresh:** Session automatically restored via `/auth/refresh` endpoint using refresh token cookie
- **Browser Close/Reopen:** If user closes browser and reopens, session is automatically restored via `/auth/refresh` endpoint (if refresh token cookie is still valid). User is automatically taken to dashboard without needing to log in again.
- **Token Validation:** If JWT token is invalid/expired and refresh token is also invalid/expired, user is automatically redirected to login page. User cannot access any protected routes without valid authentication.

---

## **7. Error Handling**

**Invalid Login Attempts:**
- Rate limiting: Maximum 5 failed attempts per 15 minutes per email
- After 5 failed attempts: Account locked for 15 minutes
- Error message: "Invalid email or password" (generic - doesn't reveal which is wrong)
- Rate limiting is applied via `loginRateLimiter` middleware on `/auth/login` endpoint
- Failed attempts are tracked in user's `loginAttempts` field in database
- Account lockout is automatically released after 15 minutes

**Error Messages & HTTP Status Codes:**
- Invalid credentials: "Invalid email or password" (HTTP 401 Unauthorized)
- Account locked: "Account is locked due to too many failed login attempts. Please try again later." (HTTP 401 Unauthorized)
- Missing required fields: "Email and password are required" (HTTP 400 Bad Request)
- Invalid email format: "Invalid email format" (HTTP 422 Unprocessable Entity)
- Network error: "Connection failed. Please check your internet and try again."
- OTP expired: "OTP has expired. Please request a new one." (HTTP 400 Bad Request)
- Invalid OTP: "Invalid OTP. Please try again." (HTTP 400 Bad Request)
- Duplicate email (signup): "This email is already registered" (HTTP 409 Conflict)
- Same password (password reset): "New password must be different from your current password" (HTTP 400 Bad Request)
- Token expired/invalid: User is automatically redirected to login page (HTTP 401 Unauthorized)
- Session expired (multi-tab): User is automatically redirected to login page with message "Your session has expired. Please log in again."
- Refresh token not found: "Refresh token not found" (HTTP 401 Unauthorized)
- Refresh token expired/invalid: "Refresh token expired or invalid" (HTTP 401 Unauthorized)

**OTP Rate Limiting:**
- Maximum 3 OTP requests per email per 15 minutes (applies to both signup and password reset)
- After 3 requests: "Too many OTP requests. Please wait 15 minutes before requesting again." (HTTP 429 Too Many Requests)
- Rate limiting is applied via `otpRateLimiter` middleware on `/auth/signup/request-otp` and `/auth/forgot-password/request-otp` endpoints

---

## **8. Out of Scope**

- Two-factor authentication (beyond OTP password reset)
- Social login (Google, Facebook, etc.)
- Email/SMS integration for OTP (using MongoDB for testing)
- Session timeout warning (implement in Phase D if needed)
- Biometric authentication
- Device trust/recognition
- IP-based security checks

---

## **9. Approval & Sign-off**

**PRD Status:** ✅ **UPDATED - Synchronized with Implementation**  
**Version:** 2.2 (Updated to match implementation)  
**Date Updated:** December 2024

**Changes Made:**
- Clarified 3-step signup flow (form → OTP → verify)
- Clarified 3-step password reset flow (email → OTP → reset)
- Added HTTP status codes for all error scenarios
- Updated error messages to match implementation
- Added development mode OTP handling details
- Enhanced rate limiting documentation
- Updated success messages and redirect timing

**Approved By:**
- Product Manager: ✅ Approved
- Tester/SDET: ✅ Implementation Review Complete
- Stakeholders: ✅ Approved

---

**Document Version:** 2.2 (Updated to match implementation)  
**Status:** ✅ UPDATED - Synchronized with implementation

