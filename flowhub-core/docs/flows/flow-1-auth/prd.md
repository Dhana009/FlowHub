# **FlowHub — PRD: Flow 1 - Authentication**

**Version:** 2.1 (Final)  
**Date:** November 30, 2024  
**Author:** Product Manager  
**Status:** ✅ LOCKED - Ready for Functional Specification

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
11. System redirects user to Item List page
12. User can now access FlowHub features

### **Password Reset Flow:**
1. User clicks "Forgot Password" link on login page
2. User enters email address
3. User clicks "Request OTP" button
4. System checks if email exists in database
5. **If email exists:**
   - System generates 6-digit OTP
   - System stores OTP in MongoDB (with expiration: 10 minutes)
   - System shows success message: "OTP has been generated. Please check MongoDB for OTP."
   - System shows OTP input field
6. **If email doesn't exist:**
   - System shows generic message: "If this email exists, OTP has been sent." (security - doesn't reveal if email exists)
   - No OTP generated
   - No OTP input field shown
7. User enters OTP from MongoDB (for testing - no email/SMS)
8. System validates OTP
9. User enters new password
10. User confirms new password
11. System validates password strength
12. System validates passwords match
13. **System checks if new password is different from current password**
    - **If new password matches current password:** System shows error: "New password must be different from your current password"
    - **If new password is different:** Proceed to next step
14. System updates password in database
15. System shows success message: "Password updated successfully"
16. User is redirected to login page

### **Sign-Up Flow:**
1. User clicks "Sign Up" link on login page
2. User sees sign-up form with fields:
   - First Name (required, 2-50 characters, letters only)
   - Last Name (required, 2-50 characters, letters only)
   - Email (required, valid email format, unique)
   - Password (required, meets strength requirements)
   - Confirm Password (required, must match password)
3. User fills all fields
4. User clicks "Sign Up" button
5. System validates all fields
6. **System checks if email already exists in database**
   - **If email exists:** System shows error: "This email is already registered. Please use a different email or log in."
   - **If email doesn't exist:** Proceed to next step
7. System generates 6-digit OTP
8. System stores OTP in MongoDB (with expiration: 10 minutes)
9. System shows OTP input field
10. User enters OTP from MongoDB
11. System validates OTP
12. System creates user account in database
13. System automatically logs in user
14. System redirects user to Item List page

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
- **Browser Close/Reopen:** If user closes browser and reopens, session is automatically restored via `/auth/refresh` endpoint (if refresh token cookie is still valid). User is automatically taken to dashboard (Item List page) without needing to log in again.
- **Token Validation:** If JWT token is invalid/expired and refresh token is also invalid/expired, user is automatically redirected to login page. User cannot access any protected routes without valid authentication.

---

## **7. Error Handling**

**Invalid Login Attempts:**
- Rate limiting: Maximum 5 failed attempts per 15 minutes per email
- After 5 failed attempts: Account locked for 15 minutes
- Error message: "Invalid email or password" (generic - doesn't reveal which is wrong)

**Error Messages:**
- Invalid credentials: "Invalid email or password"
- Account locked: "Account is locked due to too many failed login attempts. Please try again later."
- Network error: "Connection failed. Please check your internet and try again."
- OTP expired: "OTP has expired. Please request a new one."
- Invalid OTP: "Invalid OTP. Please try again."
- Duplicate email (signup): "This email is already registered."
- Same password (password reset): "New password must be different from your current password"
- Token expired/invalid: User is automatically redirected to login page
- Session expired (multi-tab): User is automatically redirected to login page with message "Your session has expired. Please log in again."

**OTP Rate Limiting:**
- Maximum 3 OTP requests per email per 15 minutes
- After 3 requests: "Too many OTP requests. Please try again after 15 minutes."

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

**PRD Status:** ✅ **FINAL / LOCKED**  
**Version:** 2.1 (Final)  
**Date Approved:** November 30, 2024

**Approved By:**
- Product Manager: ✅ Approved
- Tester/SDET: ✅ Ambiguity Analysis Complete
- Stakeholders: ✅ Approved

**Next Steps:**
- Create Functional Specification (FS) for Flow 1
- Proceed with Flow 2 PRD

---

**Document Version:** 2.1 (Final)  
**Status:** ✅ LOCKED - Ready for Functional Specification

