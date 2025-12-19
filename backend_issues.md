# Backend Issues - API Status Code Errors

This document lists backend issues identified during API testing. These issues need to be fixed by the backend team.

**Last Updated:** 2025-12-19

---

## Issue #1: Invalid OTP Returns 500 Instead of 4xx

### Problem
The backend returns **500 Internal Server Error** for invalid OTP scenarios, which is incorrect according to HTTP standards.

### HTTP Status Code Standards
- **400 Bad Request**: Client error - invalid input, validation failure
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Server understood but refuses to authorize
- **500 Internal Server Error**: Unexpected server-side error (crashes, unhandled exceptions)

**Invalid OTP is a CLIENT-SIDE validation/authentication error, NOT a server malfunction.**

### Affected Endpoints

#### 1. POST /auth/signup - Invalid/Expired OTP
- **Expected:** 400 Bad Request or 401 Unauthorized
- **Actual:** 500 Internal Server Error
- **Response:**
  ```json
  {
    "status": "error",
    "error_code": 500,
    "error_type": "Internal Server Error",
    "message": "Invalid or expired OTP",
    "timestamp": "2025-12-19T10:53:59.672Z",
    "path": "/api/v1/auth/signup"
  }
  ```

#### 2. POST /auth/signup - Wrong OTP
- **Expected:** 400 Bad Request or 401 Unauthorized
- **Actual:** 500 Internal Server Error
- **Response:**
  ```json
  {
    "status": "error",
    "error_code": 500,
    "error_type": "Internal Server Error",
    "message": "Invalid OTP",
    "timestamp": "2025-12-19T10:54:05.771Z",
    "path": "/api/v1/auth/signup"
  }
  ```

#### 3. POST /auth/signup/verify-otp - Wrong OTP
- **Expected:** 400 Bad Request or 401 Unauthorized
- **Actual:** 500 Internal Server Error
- **Response:**
  ```json
  {
    "status": "error",
    "error_code": 500,
    "error_type": "Internal Server Error",
    "message": "Invalid OTP",
    "timestamp": "2025-12-19T10:54:07.303Z",
    "path": "/api/v1/auth/signup/verify-otp"
  }
  ```

#### 4. POST /auth/signup/verify-otp - OTP Not Requested
- **Expected:** 400 Bad Request or 401 Unauthorized
- **Actual:** 500 Internal Server Error
- **Response:**
  ```json
  {
    "status": "error",
    "error_code": 500,
    "error_type": "Internal Server Error",
    "message": "Invalid or expired OTP",
    "timestamp": "2025-12-19T10:54:08.175Z",
    "path": "/api/v1/auth/signup/verify-otp"
  }
  ```

### Recommended Fix
Change all invalid OTP error responses to return:
- **400 Bad Request** (if treating as validation error)
- **OR 401 Unauthorized** (if treating as authentication failure)

**DO NOT return 500** for client-side validation errors.

### Test Cases Affected

#### Test Case 1: AUTH-SIGNUP-016
- **Test Name:** `test_signup_without_otp_verification`
- **Endpoint:** POST /auth/signup
- **Description:** Test that signup fails if OTP was not verified first
- **Test Steps:**
  1. Generate unique email and user data
  2. Attempt to signup with random OTP (without requesting/verifying OTP first)
  3. Verify response status code
- **Expected Result:** 400 Bad Request or 401 Unauthorized
- **Actual Result:** 500 Internal Server Error
- **Error Message:** "Invalid or expired OTP"
- **Test File:** `tests/api/auth/test_signup_negative.py`

#### Test Case 2: AUTH-SIGNUP-017
- **Test Name:** `test_signup_with_wrong_otp`
- **Endpoint:** POST /auth/signup
- **Description:** Test that signup fails with wrong OTP code
- **Test Steps:**
  1. Generate unique email and user data
  2. Request OTP for the email
  3. Attempt to signup with wrong OTP (e.g., "000000")
  4. Verify response status code
- **Expected Result:** 400 Bad Request or 401 Unauthorized
- **Actual Result:** 500 Internal Server Error
- **Error Message:** "Invalid OTP"
- **Test File:** `tests/api/auth/test_signup_negative.py`

#### Test Case 3: AUTH-SIGNUP-VERIFY-OTP-011
- **Test Name:** `test_signup_verify_otp_with_wrong_otp`
- **Endpoint:** POST /auth/signup/verify-otp
- **Description:** Test that verify OTP fails with wrong OTP code
- **Test Steps:**
  1. Generate unique email
  2. Request OTP for the email
  3. Attempt to verify with wrong OTP (e.g., "000000")
  4. Verify response status code
- **Expected Result:** 400 Bad Request or 401 Unauthorized
- **Actual Result:** 500 Internal Server Error
- **Error Message:** "Invalid OTP"
- **Test File:** `tests/api/auth/test_signup_verify_otp_negative.py`

#### Test Case 4: AUTH-SIGNUP-VERIFY-OTP-012
- **Test Name:** `test_signup_verify_otp_without_requesting_first`
- **Endpoint:** POST /auth/signup/verify-otp
- **Description:** Test that verify OTP fails if OTP was not requested first
- **Test Steps:**
  1. Generate unique email (but don't request OTP)
  2. Attempt to verify with random OTP (e.g., "123456")
  3. Verify response status code
- **Expected Result:** 400 Bad Request or 401 Unauthorized
- **Actual Result:** 500 Internal Server Error
- **Error Message:** "Invalid or expired OTP"
- **Test File:** `tests/api/auth/test_signup_verify_otp_negative.py`

### Impact
- Tests are currently **FAILING** due to incorrect status codes
- This violates HTTP standards and REST API best practices
- Monitoring/alerting systems may incorrectly flag these as server errors

---

## Issue #2: Invalid OTP Returns 500 Instead of 4xx (Forgot Password Flow)

### Problem
The backend returns **500 Internal Server Error** for invalid OTP scenarios in the forgot password flow, which is incorrect according to HTTP standards.

**Invalid OTP is a CLIENT-SIDE validation/authentication error, NOT a server malfunction.**

### Affected Endpoints

#### 1. POST /auth/forgot-password/verify-otp - Wrong OTP
- **Expected:** 400 Bad Request or 401 Unauthorized
- **Actual:** 500 Internal Server Error
- **Response:**
  ```json
  {
    "status": "error",
    "error_code": 500,
    "error_type": "Internal Server Error",
    "message": "Invalid OTP",
    "timestamp": "2025-12-19T11:04:58.002Z",
    "path": "/api/v1/auth/forgot-password/verify-otp"
  }
  ```

#### 2. POST /auth/forgot-password/verify-otp - OTP Not Requested
- **Expected:** 400 Bad Request or 401 Unauthorized
- **Actual:** 500 Internal Server Error
- **Response:**
  ```json
  {
    "status": "error",
    "error_code": 500,
    "error_type": "Internal Server Error",
    "message": "Invalid or expired OTP",
    "timestamp": "2025-12-19T11:04:58.669Z",
    "path": "/api/v1/auth/forgot-password/verify-otp"
  }
  ```

#### 3. POST /auth/forgot-password/reset - Wrong OTP
- **Expected:** 400 Bad Request or 401 Unauthorized
- **Actual:** 500 Internal Server Error
- **Response:**
  ```json
  {
    "status": "error",
    "error_code": 500,
    "error_type": "Internal Server Error",
    "message": "Invalid OTP",
    "timestamp": "2025-12-19T11:05:17.199Z",
    "path": "/api/v1/auth/forgot-password/reset"
  }
  ```

#### 4. POST /auth/forgot-password/reset - OTP Not Verified
- **Expected:** 400 Bad Request or 401 Unauthorized
- **Actual:** 500 Internal Server Error
- **Response:**
  ```json
  {
    "status": "error",
    "error_code": 500,
    "error_type": "Internal Server Error",
    "message": "Invalid or expired OTP",
    "timestamp": "2025-12-19T11:05:06.158Z",
    "path": "/api/v1/auth/forgot-password/reset"
  }
  ```

### Recommended Fix
Change all invalid OTP error responses to return:
- **400 Bad Request** (if treating as validation error)
- **OR 401 Unauthorized** (if treating as authentication failure)

**DO NOT return 500** for client-side validation errors.

### Test Cases Affected
- `test_forgot_password_verify_otp_with_wrong_otp` - AUTH-FORGOT-PASSWORD-VERIFY-OTP-011
- `test_forgot_password_verify_otp_without_requesting_first` - AUTH-FORGOT-PASSWORD-VERIFY-OTP-012
- `test_forgot_password_reset_with_wrong_otp` - AUTH-FORGOT-PASSWORD-RESET-017
- `test_forgot_password_reset_without_otp_verification` - AUTH-FORGOT-PASSWORD-RESET-016

### Impact
- Tests are currently **FAILING** due to incorrect status codes
- This violates HTTP standards and REST API best practices
- Monitoring/alerting systems may incorrectly flag these as server errors

---

## Issue #3: Password Validation Errors Return 500 Instead of 4xx

### Problem
The backend returns **500 Internal Server Error** for password validation errors (e.g., password too short), which is incorrect according to HTTP standards.

**Password validation errors are CLIENT-SIDE validation errors, NOT server malfunctions.**

### Affected Endpoints

#### 1. POST /auth/forgot-password/reset - Password Below Minimum Length
- **Expected:** 400 Bad Request or 422 Unprocessable Entity
- **Actual:** 500 Internal Server Error
- **Scenario:** Password with less than 8 characters
- **Response:**
  ```json
  {
    "status": "error",
    "error_code": 500,
    "error_type": "Internal Server Error",
    "message": "Invalid or expired OTP",
    "timestamp": "2025-12-19T11:04:30.XXX",
    "path": "/api/v1/auth/forgot-password/reset"
  }
  ```

### Recommended Fix
Change password validation error responses to return:
- **400 Bad Request** (if treating as validation error)
- **OR 422 Unprocessable Entity** (if treating as schema validation failure)

**DO NOT return 500** for client-side validation errors.

### Test Cases Affected
- `test_forgot_password_reset_password_boundaries` - AUTH-FORGOT-PASSWORD-RESET-020

### Impact
- Tests are currently **FAILING** due to incorrect status codes
- This violates HTTP standards and REST API best practices
- Monitoring/alerting systems may incorrectly flag these as server errors

---

## Issue #4: User Not Found Returns 500 Instead of 404

### Problem
The backend returns **500 Internal Server Error** when a user is not found during password reset, which is incorrect according to HTTP standards.

**User not found is a CLIENT-SIDE error (resource not found), NOT a server malfunction.**

### Affected Endpoints

#### 1. POST /auth/forgot-password/reset - User Not Found
- **Expected:** 404 Not Found
- **Actual:** 500 Internal Server Error
- **Response:**
  ```json
  {
    "status": "error",
    "error_code": 500,
    "error_type": "Internal Server Error",
    "message": "User not found",
    "timestamp": "2025-12-19T11:05:14.827Z",
    "path": "/api/v1/auth/forgot-password/reset"
  }
  ```

### Recommended Fix
Change user not found error responses to return:
- **404 Not Found** (resource does not exist)

**DO NOT return 500** for resource not found errors.

### Test Cases Affected
- `test_forgot_password_reset_successful` - AUTH-FORGOT-PASSWORD-RESET-001 (when using non-existent email)

### Impact
- Tests may fail when using non-existent users
- This violates HTTP standards and REST API best practices
- Monitoring/alerting systems may incorrectly flag these as server errors

---

## Issue #5: Schema Validation Errors Return 500 Instead of 4xx

### Problem
The backend returns **500 Internal Server Error** for some schema validation errors (e.g., invalid data types), which is incorrect according to HTTP standards.

**Schema validation errors are CLIENT-SIDE validation errors, NOT server malfunctions.**

### Affected Endpoints

#### 1. POST /auth/forgot-password/reset - Invalid Data Type
- **Expected:** 400 Bad Request or 422 Unprocessable Entity
- **Actual:** 500 Internal Server Error (in some cases)
- **Scenario:** Invalid data type for newPassword (e.g., integer instead of string)
- **Response:**
  ```json
  {
    "status": "error",
    "error_code": 500,
    "error_type": "Internal Server Error",
    "message": "Invalid or expired OTP",
    "timestamp": "2025-12-19T11:05:02.299Z",
    "path": "/api/v1/auth/forgot-password/reset"
  }
  ```

### Recommended Fix
Change schema validation error responses to return:
- **400 Bad Request** (if treating as validation error)
- **OR 422 Unprocessable Entity** (if treating as schema validation failure)

**DO NOT return 500** for client-side validation errors.

### Test Cases Affected
- `test_forgot_password_reset_schema_mutations` - AUTH-FORGOT-PASSWORD-RESET-003

### Impact
- Tests may fail for schema validation errors
- This violates HTTP standards and REST API best practices
- Monitoring/alerting systems may incorrectly flag these as server errors

---

## Summary

### Common Pattern
All issues follow the same pattern: **Client-side errors (4xx) are being returned as server errors (5xx)**.

### HTTP Status Code Guidelines
- **4xx (Client Errors)**: Invalid request, validation failure, authentication failure, resource not found
- **5xx (Server Errors)**: Unexpected server crashes, database connection failures, unhandled exceptions

### Recommended Action
Review all error handling in the authentication flow and ensure:
1. Invalid OTP → 400 or 401 (NOT 500)
2. Password validation errors → 400 or 422 (NOT 500)
3. User not found → 404 (NOT 500)
4. Schema validation errors → 400 or 422 (NOT 500)

---

## Notes
- All test cases are configured to expect correct status codes (400/401/403/404/422)
- Tests will fail until backend is fixed
- This document should be shared with backend team for resolution
- All backend bugs are documented with clear error messages in test failures

