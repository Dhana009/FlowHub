# **Flow 1 Backend Bugs: Root Cause Analysis**

**Total Bugs:** 7 (6 × 500 errors, 1 × RBAC)

---

## **Root Causes**

### **BUG-01, BUG-02, BUG-05: Type Violations → 500**
- **Issue:** Missing type validation in controllers before service calls
- **Impact:** Non-string inputs (numbers/objects) crash service layer → 500 error
- **Files:** `authController.js` (login, signup)

### **BUG-03, BUG-06: Invalid Credentials → 500**
- **Issue:** Service throws generic `Error` without `statusCode`, controller has no specific handling
- **Impact:** Authentication failures return 500 instead of 401
- **Files:** `authController.js`, `authService.js`

### **BUG-07: RBAC Authorization → 403**
- **Issue:** Role comparison is case-sensitive, no normalization
- **Impact:** ADMIN users denied access to `/users` endpoint
- **Files:** `rbacMiddleware.js`

---

## **Common Pattern**

**6/7 bugs:** Service layer assumes valid input types, crashes on invalid data, errors lack `statusCode` → defaults to 500.

**Fix Strategy:**
1. Add type validation in controllers
2. Add `statusCode` to service errors
3. Normalize RBAC role comparison
