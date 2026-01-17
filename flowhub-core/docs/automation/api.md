Q1: Content-Type for API Requests - CORRECT ANSWER
✅ Option A is CORRECT - Always use multipart/form-data
Even without file uploads, the endpoint requires multipart/form-data because:
The middleware is configured to accept multipart data
It must handle optional file uploads (for items with product images)
Using multipart/form-data works with OR without files
Correct Implementation:
# ✅ CORRECT - Always multipart/form-dataimport requestsitem_data = {    'name': 'Test Laptop',    'description': 'A high-performance laptop for testing purposes',    'item_type': 'PHYSICAL',    'price': '999.99',    'category': 'Electronics',    'weight': '2.5',    'length': '35',    'width': '25',    'height': '2',    'tags': 'laptop,test,electronics'  # Can be comma-separated or array}files = {    'file': None  # Optional - no file}response = requests.post(    f'{API_URL}/items',    headers={'Authorization': f'Bearer {token}'},    data=item_data,    files=files)
With File Upload:
# ✅ CORRECT - With file includedwith open('product-image.jpg', 'rb') as f:    files = {'file': f}    response = requests.post(        f'{API_URL}/items',        headers={'Authorization': f'Bearer {token}'},        data=item_data,        files=files    )
Why NOT Option B (JSON):
# ❌ WRONG - Will failjson_data = {...}requests.post(url, json=json_data)  # Won't work - endpoint expects multipart
Q2: Tags Field - OPTIONAL
✅ tags is completely OPTIONAL
Scenario	Send Tags?	Result
With tags	✅ Yes	Tags stored in array
Without tags	❌ No	Defaults to empty array []
Empty array	✅ Yes	Item created with tags: []
Valid Examples:
# ✅ With tags (comma-separated string)item_data = {    'name': 'Test Laptop',    'description': '...',    'item_type': 'PHYSICAL',    'price': '999.99',    'category': 'Electronics',    'weight': '2.5',    'length': '35',    'width': '25',    'height': '2',    'tags': 'laptop,test,electronics'  # Works!}# ✅ Without tagsitem_data = {    'name': 'Test Laptop',    'description': '...',    'item_type': 'PHYSICAL',    'price': '999.99',    'category': 'Electronics',    'weight': '2.5',    'length': '35',    'width': '25',    'height': '2'    # No tags field - defaults to []}
Tags Validation Rules:
Max 10 tags per item
Each tag: 1-30 characters
No duplicate tags (unique)
Optional field
Q3: Response Format - OPTION A is CORRECT
✅ Structure is Option A:
{  "status": "success",  "message": "Item created successfully",  "data": {    "_id": "507f1f77bcf86cd799439011",    "name": "Test Laptop",    "description": "A high-performance laptop for testing purposes",    "item_type": "PHYSICAL",    "price": 999.99,    "category": "Electronics",    "tags": ["laptop", "test", "electronics"],    "weight": 2.5,    "dimensions": {      "length": 35,      "width": 25,      "height": 2    },    "version": 1,    "is_active": true,    "created_by": "user_id_123",    "createdAt": "2024-01-15T10:30:00.000Z",    "updatedAt": "2024-01-15T10:30:00.000Z"  },  "item_id": "507f1f77bcf86cd799439011"}
Key Points:
✅ Top-level status: "success"
✅ Response wrapped in data object
✅ Both data._id AND top-level item_id provided (for convenience)
✅ HTTP Status: 201 Created (not 200)
Q4: Error Response Format (422 Validation Error)
Here's what a validation error (422) looks like:
{  "status": "error",  "error_code": 422,  "error_type": "Unprocessable Entity - Validation failed",  "message": "Description must be at least 10 characters",  "timestamp": "2024-01-15T10:30:00.000Z",  "path": "/api/v1/items"}
Other Error Formats:
409 Conflict (Duplicate Item):
{  "status": "error",  "error_code": "CONFLICT_ERROR",  "error_code_detail": "DUPLICATE",  "error_type": "Conflict - Duplicate item",  "message": "Item with same name and category already exists",  "timestamp": "2024-01-15T10:30:00.000Z",  "path": "/api/v1/items"}
400 Bad Request (Missing Field):
{  "status": "error",  "error_code": 400,  "error_type": "Bad Request",  "message": "Email and password are required",  "timestamp": "2024-01-15T10:30:00.000Z",  "path": "/api/v1/auth/login"}
401 Unauthorized (Bad Token):
{  "status": "error",  "error_code": 401,  "error_type": "Invalid Token",  "message": "Your session is invalid or has expired. Please log in again.",  "timestamp": "2024-01-15T10:30:00.000Z",  "path": "/api/v1/items"}
403 Forbidden (Insufficient Permissions):
{  "status": "error",  "error_code": 403,  "error_type": "Forbidden",  "message": "You do not have permission to perform this action",  "timestamp": "2024-01-15T10:30:00.000Z",  "path": "/api/v1/items/123"}
📊 COMPLETE 6-FLOW API GUIDE
FLOW 1: Identity & Access (Authentication)
Step 1: Request OTP
POST /api/v1/auth/signup/request-otpContent-Type: application/jsonRequest:{  "email": "newuser@example.com"}Response (200):{  "message": "OTP sent to email",  "expiresIn": 600  // 10 minutes  "otp": "123456"  // Only in development mode!}
Step 2: Verify OTP
POST /api/v1/auth/signup/verify-otpContent-Type: application/jsonRequest:{  "email": "newuser@example.com",  "otp": "123456"}Response (200):{  "message": "OTP verified successfully",  "verified": true}
Step 3: Signup
POST /api/v1/auth/signupContent-Type: application/jsonRequest:{  "firstName": "John",  "lastName": "Doe",  "email": "newuser@example.com",  "password": "SecurePass123!",  "otp": "123456",  "role": "EDITOR"  // Optional, defaults to EDITOR}Response (201):{  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  "user": {    "id": "507f1f77bcf86cd799439011",    "email": "newuser@example.com",    "firstName": "John",    "lastName": "Doe",    "role": "EDITOR"  }}Also sets httpOnly cookie: refreshToken
Step 4: Login
POST /api/v1/auth/loginContent-Type: application/jsonRequest:{  "email": "user@example.com",  "password": "SecurePass123!",  "rememberMe": false  // Optional}Response (200):{  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  "user": {    "id": "507f1f77bcf86cd799439011",    "email": "user@example.com",    "role": "EDITOR",    "firstName": "John",    "lastName": "Doe"  }}
Step 5: Logout
POST /api/v1/auth/logoutAuthorization: Bearer {token}Response (200):{  "message": "Logged out successfully"}Clears refreshToken cookie
FLOW 2: Item Ingestion (Creation)
POST /api/v1/itemsAuthorization: Bearer {token}Content-Type: multipart/form-dataRequest (PHYSICAL Item):{  "name": "Test Laptop",  "description": "A high-performance laptop for testing with all required features",  "item_type": "PHYSICAL",  "price": 999.99,  "category": "Electronics",  "tags": "laptop,test,electronics",  // Optional - comma-separated  "weight": 2.5,  "length": 35,  "width": 25,  "height": 2,  "file": <binary_file>  // Optional}Request (DIGITAL Item):{  "name": "Adobe Photoshop",  "description": "Professional photo editing software license for testing",  "item_type": "DIGITAL",  "price": 299.99,  "category": "Software",  "tags": "software,adobe",  "download_url": "https://example.com/download/photoshop.zip",  "file_size": 2048000}Request (SERVICE Item):{  "name": "Web Development Consultation",  "description": "Professional consultation service for web development projects",  "item_type": "SERVICE",  "price": 150.00,  "category": "Services",  "tags": "consulting,development",  "duration_hours": 2}Response (201):{  "status": "success",  "message": "Item created successfully",  "data": {    "_id": "507f1f77bcf86cd799439011",    "name": "Test Laptop",    "description": "...",    "item_type": "PHYSICAL",    "price": 999.99,    "category": "Electronics",    "tags": ["laptop", "test", "electronics"],    "weight": 2.5,    "dimensions": { "length": 35, "width": 25, "height": 2 },    "version": 1,    "is_active": true,    "created_by": "user_id_123",    "createdAt": "2024-01-15T10:30:00Z",    "updatedAt": "2024-01-15T10:30:00Z"  },  "item_id": "507f1f77bcf86cd799439011"}
FLOW 3: Search & Discovery (Listing)
GET /api/v1/items?search=laptop&category=Electronics&page=1&limit=20&sort_by=name&sort_order=ascAuthorization: Bearer {token}Query Parameters:- search: Keyword search (optional)- category: Filter by category (optional)- status: "active" or "inactive" (optional)- page: 1-based page number (default: 1)- limit: Items per page (default: 20, max: 100)- sort_by: Field name (optional)- sort_order: "asc" or "desc" (optional)Response (200):{  "status": "success",  "data": [    {      "_id": "507f1f77bcf86cd799439011",      "name": "Test Laptop",      "description": "...",      "item_type": "PHYSICAL",      "price": 999.99,      "category": "Electronics",      "is_active": true    }    // ... more items  ],  "pagination": {    "page": 1,    "limit": 20,    "total": 45,    "pages": 3  }}
FLOW 4: Resource Inspection (View Single Item)
GET /api/v1/items/:idAuthorization: Bearer {token}Response (200):{  "status": "success",  "data": {    "_id": "507f1f77bcf86cd799439011",    "name": "Test Laptop",    "description": "High-performance laptop...",    "item_type": "PHYSICAL",    "price": 999.99,    "category": "Electronics",    "tags": ["laptop", "test", "electronics"],    "weight": 2.5,    "dimensions": {      "length": 35,      "width": 25,      "height": 2    },    "version": 1,    "is_active": true,    "created_by": "user_id_123",    "createdAt": "2024-01-15T10:30:00Z",    "updatedAt": "2024-01-15T10:30:00Z",    "file_path": "/uploads/items/image_123.jpg",    "embed_url": null  }}Error (404):{  "status": "error",  "error_code": 404,  "error_type": "Not Found",  "message": "Item not found"}
FLOW 5: State Mutation (Update Item)
PUT /api/v1/items/:idAuthorization: Bearer {token}Content-Type: multipart/form-dataRequest (MUST include version!):{  "version": 1,  // CRITICAL - must match current version  "name": "Updated Laptop Name",  "description": "Updated description...",  "price": 1099.99,  "category": "Electronics",  "tags": "laptop,updated"}Response (200) - Success:{  "status": "success",  "message": "Item updated successfully",  "data": {    "_id": "507f1f77bcf86cd799439011",    "version": 2  // Incremented!  }}Error (409) - Version Conflict:{  "status": "error",  "error_code": 409,  "error_code_detail": "VERSION_CONFLICT",  "error_type": "Conflict - Version mismatch",  "message": "Item has been modified by another user. Current version is 2, you provided version 1"}Error (403) - Insufficient Permissions:{  "status": "error",  "error_code": 403,  "error_type": "Forbidden",  "message": "You do not have permission to update this item"}
FLOW 6: Lifecycle Management (Delete & Restore)
Delete (Soft Delete):
DELETE /api/v1/items/:idAuthorization: Bearer {token}Response (200):{  "status": "success",  "message": "Item deleted successfully"}Effect: Sets is_active: false, item hidden from search but remains in DB
Restore (Reactivate):
PATCH /api/v1/items/:id/activateAuthorization: Bearer {token}Response (200):{  "status": "success",  "message": "Item activated successfully"}Effect: Sets is_active: true, item visible again
📋 QUICK REFERENCE TABLE - All 6 Flows
Flow	Method	Endpoint	Purpose	Key Data	Response Status
1	POST	/auth/login	Get token	email, password	200
2	POST	/items	Create item	name, description, item_type, price, category + conditional	201
3	GET	/items	List/search items	query params (search, category, page, limit, sort)	200
4	GET	/items/:id	View single item	:id	200
5	PUT	/items/:id	Update item	version + fields to update	200
6	DELETE	/items/:id	Delete (soft)	:id	200
🔐 RBAC Permissions for Flows 2-6
Flow	VIEWER	EDITOR	ADMIN
Flow 2 (Create)	❌ 403	✅ Own items	✅ All
Flow 3 (List)	✅ All	✅ All	✅ All
Flow 4 (View)	✅ All	✅ All	✅ All
Flow 5 (Update)	❌ 403	✅ Own items only	✅ All
Flow 6 (Delete)	❌ 403	✅ Own items only	✅ All
This is the complete API reference you need for building your test client. Does this clarify everything?