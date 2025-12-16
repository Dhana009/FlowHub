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
2. User sees login page
3. User enters email (converted to lowercase automatically)
4. User enters password (with show/hide toggle)
5. User clicks "Sign In" button
6. System validates credentials
7. System generates JWT token + Refresh token
8. System stores tokens securely (JWT in memory, Refresh in httpOnly cookie)
9. System redirects user to Item List page
10. User can now access FlowHub features

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
13. System updates password in database
14. System shows success message: "Password updated successfully"
15. User is redirected to login page

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
6. System generates 6-digit OTP
7. System stores OTP in MongoDB (with expiration: 10 minutes)
8. System shows OTP input field
9. User enters OTP from MongoDB
10. System validates OTP
11. System creates user account in database
12. System automatically logs in user
13. System redirects user to Item List page

### **Logout Flow:**
1. User clicks "Logout" button
2. System clears JWT token and Refresh token
3. System redirects user to login page

---

## **6. Security Clarifications**

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

## **7. Error Handling**

**Invalid Login Attempts:**
- Rate limiting: Maximum 5 failed attempts per 15 minutes per email
- After 5 failed attempts: Account locked for 15 minutes
- Error message: "Invalid email or password" (generic - doesn't reveal which is wrong)

**Error Messages:**
- Invalid credentials: "Invalid email or password"
- Account locked: "Too many failed attempts. Please try again after 15 minutes."
- Network error: "Connection failed. Please check your internet and try again."
- OTP expired: "OTP has expired. Please request a new one."
- Invalid OTP: "Invalid OTP. Please try again."

**OTP Rate Limiting:**
- Maximum 3 OTP requests per email per 15 minutes
- After 3 requests: "Too many OTP requests. Please try again after 15 minutes."

---

## **8. Out of Scope**

- Two-factor authentication (beyond OTP password reset)
- Social login (Google, Facebook, etc.)
- Email/SMS integration for OTP (using MongoDB for testing)

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

