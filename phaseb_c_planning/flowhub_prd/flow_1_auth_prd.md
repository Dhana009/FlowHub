# **FlowHub — PRD: Flow 1 - Authentication**

**Version:** 1.0  
**Date:** November 2024  
**Author:** Product Manager  
**Status:** Draft

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

1. User navigates to FlowHub application
2. User sees login page
3. User enters credentials (email and password)
4. User clicks "Sign In" button
5. System validates credentials
6. System grants access and redirects user
7. User can now access FlowHub features

---

## **6. Goals & Success Criteria**

**Primary Goal:** Enable secure user authentication to access FlowHub

**Success Criteria:**
- Users can log in successfully
- Invalid login attempts are handled gracefully
- User session is maintained after login
- Authentication is secure and reliable

---

## **7. Out of Scope**

- User registration (users are pre-created)
- Password reset functionality
- Two-factor authentication
- Social login (Google, Facebook, etc.)
- Account lockout after failed attempts
- Password strength requirements
- Session timeout configuration

---

## **8. Dependencies**

**External:**
- User accounts must exist in database
- Authentication service must be available

**Internal:**
- All other flows depend on this flow (user must be authenticated)

---

## **9. Assumptions**

- Users have valid email addresses
- Users have passwords
- User accounts are pre-created in the system
- Authentication tokens are JWT-based

---

## **10. Open Questions / TBD**

- What happens if user is already logged in?
- What is the token expiration time?
- Where should user be redirected after login?
- What is the exact error message format?
- Should "Remember Me" persist session across browser restarts?
- What validation rules apply to email and password fields?

---

---

## **11. Ambiguity Analysis (Version 1.0)**

**Analyzed by:** Tester/SDET  
**Date:** November 30 2024

### **11.1 Missing Features**

1. **Sign-In Flow:** PRD mentions login but doesn't define sign-in flow separately
2. **Password Reset:** Mentioned as out of scope, but should be included with OTP-based approach
   - OTP stored in MongoDB (not sent via email/SMS)
   - User requests OTP, enters OTP, resets password

### **11.2 Security Ambiguities**

3. **Authentication Method:** Not defined - JWT token only? Or JWT + Refresh token combination?
4. **Token Storage:** How to store JWT token? (localStorage, sessionStorage, httpOnly cookie?)
5. **Password Strength:** No requirements defined (min length, complexity, special characters)
6. **Session Persistence:** How to handle refresh token expiration? Auto-refresh mechanism?
7. **Multiple Sessions:** Can user log in from multiple devices/browsers simultaneously?

### **11.3 Input Handling Ambiguities**

8. **Email Case Sensitivity:** Should email be case-sensitive or converted to lowercase?
9. **Password Visibility:** Should there be show/hide password toggle?
10. **Form Validation Timing:** When to validate? (on blur, on submit, real-time?)

### **11.4 User Experience Ambiguities**

11. **Remember Me:** What exactly does "Remember Me" do? How long does it persist?
12. **Protected Routes:** What happens when unauthenticated user tries to access protected pages?
13. **Redirect After Login:** Where exactly should user be redirected? (Dashboard? Item list?)
14. **Logout Functionality:** Not mentioned - how does user log out?

### **11.5 Error Handling Ambiguities**

15. **Invalid Login Attempts:** How many wrong password attempts allowed? Rate limiting?
16. **Error Messages:** What exact error messages to show?
   - User not found vs Wrong password (security concern - should be generic)
   - OTP request rate limiting message
   - Network error message
17. **OTP Rate Limiting:** How many OTP requests per user per time period?
18. **Brute Force Protection:** How to prevent brute force attacks? Account lockout?

### **11.6 Technical Ambiguities**

19. **OTP Expiration:** How long is OTP valid? (5 minutes? 10 minutes?)
20. **OTP Resend:** Can user request new OTP? How many times?
21. **Loading States:** What loading indicators during login, OTP request?
22. **Session Timeout:** How long before auto-logout? (if any)
23. **Browser Back Button:** What happens if user clicks back after login?
24. **Network Errors:** What if API call fails? Retry mechanism?

### **11.7 Additional Ambiguities (Second Review)**

25. **Sign-Up Flow:** Not defined - what fields are needed?
   - First name, Last name required?
   - Password confirmation required?
   - Any other fields? (Phone, Organization, etc.)
   - What happens after sign-up? (Auto-login? Email verification?)
26. **Account Lockout Unlock:** How does locked account get unlocked?
   - Automatic after 15 minutes?
   - Manual unlock required?
   - User action needed?
   - What message to show during lockout?

27. **Sign-Up OTP Verification:** Should sign-up require OTP verification?
   - When is OTP sent? (after email entry? after form submission?)
   - OTP stored in MongoDB (same as password reset)?
   - User enters OTP before account creation?

28. **Forgot Password Email Verification:** Should we verify email exists before sending OTP?
   - What error message if email doesn't exist? (security concern)
   - Should we reveal if email exists in system?
29. **Forgot Password Rate Limiting:** How many "Forgot Password" requests allowed?
   - Same as OTP rate limiting? (3 per 15 minutes?)
   - Separate rate limiting?

---

---

## **12. PRD Version 2.0 (After Clarifications)**

**Updated by:** Product Manager  
**Date:** November 2024  
**Changes:** All ambiguities from Version 1.0 addressed

---

### **12.1 Updated User Journey**

**Login Flow:**
1. User navigates to FlowHub application
2. User sees login page
3. User enters email (converted to lowercase automatically)
4. User enters password (with show/hide toggle)
5. User clicks "Sign In" button
6. System validates credentials
7. System generates JWT token + Refresh token
8. System stores tokens securely (JWT in memory, Refresh in httpOnly cookie)
9. System redirects user to Item List page
10. User can now access FlowHub features

**Password Reset Flow:**
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
13. System updates password in database
14. System shows success message: "Password updated successfully"
15. User is redirected to login page

**Forgot Password Email Verification:**
- System checks if email exists in database
- **Security:** Generic message shown regardless (doesn't reveal if email exists)
- Message: "If this email exists, OTP has been sent." (shown for both cases)
- OTP only generated if email exists (but user doesn't know)

**Forgot Password Rate Limiting:**
- Maximum 3 "Forgot Password" requests per email per 15 minutes
- Same rate limiting as OTP requests
- After 3 requests: "Too many password reset requests. Please try again after 15 minutes."
- Rate limiting is per email address (not per IP)

**Logout Flow:**
1. User clicks "Logout" button
2. System clears JWT token and Refresh token
3. System redirects user to login page

---

### **12.2 Security Clarifications**

**Authentication Method:**
- **JWT Token:** Short-lived (15 minutes), stored in memory
- **Refresh Token:** Long-lived (7 days), stored in httpOnly cookie
- **Auto-Refresh:** When JWT expires, system automatically uses refresh token to get new JWT

**Token Storage:**
- JWT: Stored in memory (React state) - not in localStorage
- Refresh Token: Stored in httpOnly cookie (secure, not accessible via JavaScript)

**Password Strength Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

**Session Management:**
- **Multiple Sessions:** Allowed - user can log in from multiple devices/browsers
- **Session Timeout:** No auto-logout - session persists until user logs out or refresh token expires (7 days)
- **Remember Me:** Extends refresh token expiration to 30 days (instead of 7 days)

---

### **12.3 Input Handling Clarifications**

**Email Input:**
- Automatically converted to lowercase on input
- Validation: Must be valid email format
- Case-insensitive matching in database

**Password Input:**
- Show/hide password toggle available
- Validation: Real-time validation for password strength
- Error messages shown below input field

**Form Validation:**
- Email: Validated on blur (when user leaves field)
- Password: Validated on submit (not on blur)
- Error messages clear when user starts typing

---

### **12.4 User Experience Clarifications**

**Remember Me:**
- If checked: Refresh token expires in 30 days
- If unchecked: Refresh token expires in 7 days
- Persists across browser restarts (if checked)

**Protected Routes:**
- All pages except login and password reset require authentication
- Unauthenticated users are automatically redirected to login page
- After login, user is redirected back to originally requested page (if any)

**Redirect After Login:**
- Default: Item List page
- If user was trying to access specific page: Redirect to that page

**Logout:**
- Available in navigation menu
- Clears all tokens
- Redirects to login page

---

### **12.5 Error Handling Clarifications**

**Invalid Login Attempts:**
- Rate limiting: Maximum 5 failed attempts per 15 minutes per IP
- After 5 failed attempts: Account locked for 15 minutes
- Error message: "Invalid email or password" (generic - doesn't reveal which is wrong)

**Error Messages:**
- Invalid credentials: "Invalid email or password"
- User not found: "Invalid email or password" (same message for security)
- Account locked: "Too many failed attempts. Please try again after 15 minutes."
- Network error: "Connection failed. Please check your internet and try again."
- OTP expired: "OTP has expired. Please request a new one."
- Invalid OTP: "Invalid OTP. Please try again."

**OTP Rate Limiting:**
- Maximum 3 OTP requests per email per 15 minutes
- After 3 requests: "Too many OTP requests. Please try again after 15 minutes."

**Brute Force Protection:**
- Rate limiting on login attempts (5 per 15 minutes)
- Rate limiting on OTP requests (3 per 15 minutes)
- Account lockout after 5 failed login attempts

---

### **12.6 Technical Clarifications**

**OTP Details:**
- **Length:** 6 digits
- **Expiration:** 10 minutes
- **Storage:** MongoDB (for testing - no email/SMS integration)
- **Resend:** Allowed, but rate limited (3 requests per 15 minutes)

**Loading States:**
- Login button shows loading spinner during authentication
- OTP request shows loading state
- Password reset shows loading state during password update

**Session Timeout:**
- No automatic logout
- Session persists until:
  - User manually logs out
  - Refresh token expires (7 days or 30 days with Remember Me)

**Browser Back Button:**
- After login, back button doesn't return to login page
- User stays on authenticated pages

**Network Error Handling:**
- If API call fails: Show error message
- User can retry (no automatic retry)
- Form data is preserved (user doesn't lose input)

---

### **12.7 Updated Out of Scope**

**Removed from Out of Scope (Now In Scope):**
- ✅ Password reset functionality (OTP-based, MongoDB storage)
- ✅ Password strength requirements (defined above)
- ✅ Session timeout configuration (defined above)
- ✅ User registration (Sign-up flow with First Name, Last Name, Email, Password)

**Still Out of Scope:**
- Two-factor authentication (beyond OTP password reset)
- Social login (Google, Facebook, etc.)
- Email/SMS integration for OTP (using MongoDB for testing)

---

### **12.8 Updated Assumptions**

- Users can create accounts via sign-up flow
- Users have valid email addresses
- Users have passwords (meeting strength requirements)
- Authentication uses JWT + Refresh token combination
- OTP is stored in MongoDB (not sent via email/SMS)
- Browser supports httpOnly cookies

---

---

### **12.9 Sign-Up Flow Clarifications**

**Sign-Up Flow:**
1. User clicks "Sign Up" link on login page
2. User sees sign-up form with fields:
   - First Name (required, 2-50 characters, letters only)
   - Last Name (required, 2-50 characters, letters only)
   - Email (required, valid email format, unique)
   - Password (required, meets strength requirements)
   - Confirm Password (required, must match password)
3. User fills all fields
4. User clicks "Sign Up" button
5. System validates:
   - All required fields present
   - Email format valid
   - Email not already registered
   - Password meets strength requirements
   - Confirm password matches password
6. System generates 6-digit OTP
7. System stores OTP in MongoDB (with expiration: 10 minutes)
8. System shows OTP input field
9. User enters OTP from MongoDB
10. System validates OTP
11. System creates user account in database
12. System automatically logs in user
13. System redirects user to Item List page

**Sign-Up OTP Details:**
- **OTP Length:** 6 digits
- **OTP Expiration:** 10 minutes
- **OTP Storage:** MongoDB (for testing - no email/SMS)
- **OTP Rate Limiting:** Same as password reset (3 requests per 15 minutes per email)
- **OTP Resend:** Allowed, but rate limited

**Sign-Up Fields:**
- **First Name:** Required, 2-50 characters, letters and spaces only
- **Last Name:** Required, 2-50 characters, letters and spaces only
- **Email:** Required, valid email format, must be unique
- **Password:** Required, meets strength requirements (8+ chars, uppercase, lowercase, number, special char)
- **Confirm Password:** Required, must exactly match password

**Validation:**
- Real-time validation for email format
- Real-time validation for password strength
- Confirm password validated on submit
- Error messages shown below each field

**After Sign-Up:**
- User must verify OTP before account creation
- After OTP verification and account creation: User is automatically logged in
- User is redirected to Item List page
- User can immediately start using FlowHub

---

### **12.10 Account Lockout Clarifications**

**Account Lockout Mechanism:**
- **Trigger:** 5 failed login attempts within 15 minutes
- **Lockout Duration:** 15 minutes from first failed attempt
- **Unlock Method:** Automatic after 15 minutes (no manual unlock needed)
- **User Experience:**
  - After 5th failed attempt: Account locked
  - Error message: "Account locked due to too many failed attempts. Please try again after [X] minutes."
  - Timer shows remaining lockout time
  - User cannot attempt login during lockout period
  - After 15 minutes: Account automatically unlocks
  - User can attempt login again (counter resets)

**Lockout Details:**
- Lockout is per email address (not per IP)
- Lockout counter resets after successful login
- Lockout counter resets after 15 minutes of no failed attempts
- During lockout: All login attempts rejected with lockout message
- No admin intervention needed - fully automatic

**Lockout Message:**
- "Account locked due to too many failed attempts. Please try again after [X] minutes."
- [X] = remaining minutes until unlock
- Message updates in real-time as timer counts down

---

---

## **13. Approval & Sign-off**

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

