# **Test Data Requirements & Strategy**

**Purpose:** Guidelines for test data creation, management, and cleanup  
**Use Case:** Setting up test environments, parallel test execution, data isolation

---

## **1. Test Data Creation Methods**

### **Method 1: API Endpoints (Recommended)**
Use standard API endpoints to create test data:

**Create Users:**
```http
POST /api/v1/auth/signup/request-otp
POST /api/v1/auth/signup/verify-otp
POST /api/v1/auth/signup
```

**Create Items:**
```http
POST /api/v1/items
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### **Method 2: Internal Automation Endpoints**
Use internal endpoints for faster test setup (requires `X-Internal-Key`):

**Reset Database (Clean Slate):**
```http
POST /api/v1/internal/reset
X-Internal-Key: flowhub-secret-automation-key-2025
```

**Get OTP (for testing):**
```http
GET /api/v1/internal/otp?email=user@example.com
X-Internal-Key: flowhub-secret-automation-key-2025
```
Response: `{ "status": "success", "data": { "otp": "123456" } }`

**Seed Test Items:**
```http
POST /api/v1/internal/seed
X-Internal-Key: flowhub-secret-automation-key-2025
Content-Type: application/json

{
  "userId": "user_id_here",
  "count": 50
}
```

---

## **2. Test User Setup**

### **Default Test Users**

**Admin User:**
- Email: `admin@test.com`
- Password: `Admin@123`
- Role: `ADMIN`
- **Setup:** Run `node scripts/ensure-admin.js` (one-time setup)

**Create Test Users via API:**
```javascript
// Step 1: Request OTP
POST /api/v1/auth/signup/request-otp
{ "email": "testuser@example.com" }

// Step 2: Get OTP (via internal endpoint)
GET /api/v1/internal/otp?email=testuser@example.com
X-Internal-Key: flowhub-secret-automation-key-2025

// Step 3: Verify OTP
POST /api/v1/auth/signup/verify-otp
{ "email": "testuser@example.com", "otp": "123456" }

// Step 4: Signup
POST /api/v1/auth/signup
{
  "firstName": "Test",
  "lastName": "User",
  "email": "testuser@example.com",
  "password": "Test123!@#",
  "otp": "123456",
  "role": "EDITOR"
}
```

### **User Roles for Testing**

| Role | Use Case | Permissions |
|------|----------|-------------|
| **ADMIN** | Admin operations testing | Full access, user management |
| **EDITOR** | Item CRUD testing | Create/edit own items, view all |
| **VIEWER** | Read-only testing | View items only, no mutations |

**Recommendation:** Create at least 3 test users (one per role) for comprehensive testing.

---

## **3. Test Data Isolation**

### **Parallel Execution Strategy**

**Option 1: Unique Identifiers**
- Use timestamps/random strings in email addresses: `test${Date.now()}@example.com`
- Use unique item names: `Item-${Date.now()}-${Math.random()}`

**Option 2: Database Reset**
- Call `POST /api/v1/internal/reset` before each test suite
- Ensures clean state for each test run

**Option 3: Namespace by Test Run**
- Prefix all test data with run identifier: `run-${runId}-item-name`
- Clean up by prefix after test completion

### **Data Cleanup**

**Automatic Cleanup:**
- Soft-deleted items remain in DB but are excluded from queries
- Use `POST /api/v1/internal/reset` to completely wipe database

**Manual Cleanup:**
- Delete items: `DELETE /api/v1/items/:id` (soft delete)
- Deactivate users: `PATCH /api/v1/users/:id/status` with `{ "isActive": false }`

---

## **4. Test Data Constraints**

### **What Can Be Created:**
- ✅ Users (via signup endpoint)
- ✅ Items (via POST /items)
- ✅ Bulk operations (via POST /bulk-operations)

### **What Cannot Be Created:**
- ❌ Direct database access (use API endpoints)
- ❌ System configuration (read-only)

### **What Can Be Modified:**
- ✅ Items (via PUT /items/:id) - only if you own them (EDITOR) or ADMIN
- ✅ User roles (via PATCH /users/:id/role) - ADMIN only
- ✅ User status (via PATCH /users/:id/status) - ADMIN only

### **What Can Be Deleted:**
- ✅ Items (via DELETE /items/:id) - soft delete, can be restored
- ✅ Users (via PATCH /users/:id/status with isActive: false) - ADMIN only

**Note:** Users cannot be hard-deleted, only deactivated.

---

## **5. Test Data Dependencies**

### **Item Creation Dependencies:**
1. **User Account Required:** Must be authenticated (have valid token)
2. **User Role:** Must be ADMIN or EDITOR (VIEWER cannot create items)
3. **OTP Verification:** Required for user signup (use internal endpoint to get OTP)

### **Bulk Operations Dependencies:**
1. **Items Must Exist:** Item IDs must exist in database
2. **User Permissions:** Must be ADMIN or EDITOR
3. **Ownership:** EDITOR can only bulk-operate on own items

### **User Management Dependencies:**
1. **Admin Role Required:** Only ADMIN can manage users
2. **User Must Exist:** User ID must exist in database

---

## **6. Test Data Examples**

### **Valid Test Item (PHYSICAL):**
```json
{
  "name": "Test Laptop",
  "description": "A test laptop for automation testing purposes",
  "item_type": "PHYSICAL",
  "price": 999.99,
  "category": "Electronics",
  "tags": ["laptop", "test"],
  "weight": 2.5,
  "length": 35,
  "width": 25,
  "height": 2
}
```

### **Valid Test Item (DIGITAL):**
```json
{
  "name": "Test Software",
  "description": "A test software product for automation testing",
  "item_type": "DIGITAL",
  "price": 49.99,
  "category": "Software",
  "tags": ["software", "digital"],
  "download_url": "https://example.com/download/software.zip",
  "file_size": 10485760
}
```

### **Valid Test Item (SERVICE):**
```json
{
  "name": "Test Consulting",
  "description": "A test consulting service for automation testing",
  "item_type": "SERVICE",
  "price": 150.00,
  "category": "Services",
  "tags": ["consulting", "service"],
  "duration_hours": 8
}
```

---

## **7. Test Data Best Practices**

### **Naming Conventions:**
- **Users:** `test-{role}-{timestamp}@example.com` (e.g., `test-editor-1234567890@example.com`)
- **Items:** `Test-{Type}-{Timestamp}` (e.g., `Test-Physical-1234567890`)
- **Categories:** Use consistent categories: `Electronics`, `Clothing`, `Home`, `Books`, `Services`

### **Data Volume:**
- **Small Tests:** 1-10 items
- **Medium Tests:** 10-50 items
- **Large Tests:** 50-100 items (use seed endpoint)
- **Performance Tests:** 100+ items (use seed endpoint)

### **Data Variety:**
- Test all item types: PHYSICAL, DIGITAL, SERVICE
- Test different categories
- Test with/without tags
- Test with/without files (for items)

---

## **8. Quick Setup Script**

### **Recommended Test Setup Flow:**

```javascript
// 1. Reset database (clean slate)
POST /api/v1/internal/reset
X-Internal-Key: flowhub-secret-automation-key-2025

// 2. Create admin user (if not exists)
// Run: node scripts/ensure-admin.js
// Or use signup endpoint

// 3. Login as admin
POST /api/v1/auth/login
{ "email": "admin@test.com", "password": "Admin@123" }
// Save token

// 4. Create test users (if needed)
// Use signup endpoint for each role

// 5. Seed test items (optional, for large datasets)
POST /api/v1/internal/seed
X-Internal-Key: flowhub-secret-automation-key-2025
{ "userId": "admin_user_id", "count": 50 }

// 6. Start testing
```

---

## **9. Data Cleanup After Tests**

### **Option 1: Reset Database (Recommended for CI/CD)**
```http
POST /api/v1/internal/reset
X-Internal-Key: flowhub-secret-automation-key-2025
```
**Pros:** Complete cleanup, fast  
**Cons:** Removes all data (including admin user if not recreated)

### **Option 2: Soft Delete Items**
```http
DELETE /api/v1/items/:id
Authorization: Bearer {token}
```
**Pros:** Preserves data for debugging  
**Cons:** Items remain in database (soft-deleted)

### **Option 3: Deactivate Users**
```http
PATCH /api/v1/users/:id/status
Authorization: Bearer {admin_token}
{ "isActive": false }
```
**Pros:** Preserves user data  
**Cons:** Users remain in database

---

## **10. Test Environment Configuration**

### **Development Environment:**
- **Base URL:** `http://localhost:3000/api/v1`
- **Database:** Local MongoDB or test database
- **Internal Key:** `flowhub-secret-automation-key-2025`

### **Staging Environment:**
- **Base URL:** `{staging-url}/api/v1`
- **Database:** Staging database (shared with other testers)
- **Internal Key:** Same as development

**Note:** Coordinate with team before using reset endpoint in shared staging environment.

---

## **11. Common Test Scenarios**

### **Scenario 1: Basic CRUD Test**
1. Create user → Get token
2. Create item → Get item ID
3. Get item → Verify data
4. Update item → Verify changes
5. Delete item → Verify soft delete

### **Scenario 2: RBAC Test**
1. Create users with different roles (ADMIN, EDITOR, VIEWER)
2. Create items as EDITOR
3. Try to access/modify as VIEWER → Should fail (403)
4. Try to access/modify as ADMIN → Should succeed

### **Scenario 3: Bulk Operations Test**
1. Create multiple items
2. Start bulk operation (delete/activate)
3. Poll job status until complete
4. Verify results

### **Scenario 4: Parallel Execution Test**
1. Use unique identifiers (timestamps) for all test data
2. Run multiple test suites in parallel
3. Each suite uses isolated data
4. Cleanup after completion

---

**Use this document to plan test data setup and management strategies.**






