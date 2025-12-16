# **Architecture Overview - Flow 1: Authentication**

**Version:** 1.0  
**Date:** December 2024  
**Technology Stack:** React (Frontend), Node.js/Express (Backend), MongoDB (Database)

---

## **1. Document Structure**

This architecture is split into focused sections for clarity:

1. **`01-database-schema.md`** - MongoDB collections, schemas, indexes
2. **`02-api-contract.md`** - API endpoints, request/response formats
3. **`03-backend-architecture.md`** - Backend structure, services, middleware
4. **`04-frontend-architecture.md`** - Frontend structure, components, state management

---

## **2. System Overview**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   React     │───▶│   Express   │───▶│   Auth      │───▶│  MongoDB    │
│  Frontend   │    │    API      │    │  Service    │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Request Flow:**
1. User interacts with React form
2. Frontend calls Express API endpoint
3. Express routes to Auth Controller
4. Controller calls Auth Service (business logic)
5. Service uses Models to interact with MongoDB
6. Response flows back: DB → Service → Controller → API → Frontend

---

## **3. Key Design Decisions**

### **3.1 Database: MongoDB**
- **Why:** Flexible schema, easy to start, good for small apps
- **Collections:** `users`, `otps`
- **Indexes:** Email (unique), TTL indexes for auto-cleanup

### **3.2 Authentication: JWT + Refresh Token**
- **JWT Token:** Short-lived (15 min), stored in memory
- **Refresh Token:** Long-lived (7-30 days), stored in httpOnly cookie
- **Why:** Secure, stateless, scalable

### **3.3 Password Security: bcrypt**
- **Salt Rounds:** 12 (good balance)
- **Storage:** Hashed, never plain text
- **Validation:** Strength requirements enforced

### **3.4 OTP Storage: MongoDB**
- **Why:** For testing (no email/SMS integration needed)
- **Storage:** Hashed OTP, 10-minute expiration
- **Rate Limiting:** 3 requests per 15 minutes

---

## **4. Technology Choices**

### **Backend:**
- **Framework:** Express.js (Node.js)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** jsonwebtoken library
- **Password:** bcryptjs library
- **Validation:** express-validator

### **Frontend:**
- **Framework:** React 18
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS
- **State:** React Context API

---

## **5. Security Considerations**

1. **Password Hashing:** bcrypt with 12 rounds
2. **Token Storage:** JWT in memory, Refresh in httpOnly cookie
3. **Rate Limiting:** Login (5/15min), OTP (3/15min)
4. **Account Lockout:** 5 failed attempts = 15 min lockout
5. **Input Validation:** Backend validates all inputs
6. **Error Messages:** Generic (don't reveal if email exists)

---

## **6. Implementation Checklist**

### **Backend:**
- [ ] Setup Express app and MongoDB connection
- [ ] Create User and OTP models
- [ ] Implement password utility (hash, verify, validate)
- [ ] Implement token service (generate, verify)
- [ ] Implement OTP service (generate, store, verify)
- [ ] Implement auth service (login, signup, password reset)
- [ ] Create auth middleware (token verification)
- [ ] Create rate limiter middleware
- [ ] Create auth controller (endpoint handlers)
- [ ] Setup auth routes
- [ ] Add error handling middleware

### **Frontend:**
- [ ] Setup React app with routing
- [ ] Create AuthContext (state management)
- [ ] Create API client with interceptors
- [ ] Create auth service (API calls)
- [ ] Create validation utilities
- [ ] Create common components (Input, Button, ErrorMessage)
- [ ] Create useForm hook
- [ ] Create LoginForm component
- [ ] Create SignUpForm component
- [ ] Create ForgotPasswordForm component
- [ ] Create pages (LoginPage, SignUpPage, ForgotPasswordPage)
- [ ] Implement protected routes
- [ ] Add semantic HTML attributes

---

## **7. Next Steps**

1. Review all architecture sections
2. Start with database setup (01-database-schema.md)
3. Implement backend following 03-backend-architecture.md
4. Implement frontend following 04-frontend-architecture.md
5. Test each flow manually
6. Proceed to Step B4 (Coding Sequence Plan) if needed

---

**See individual sections for detailed specifications.**

