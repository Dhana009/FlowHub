# **Database Schema - Flow 1: Authentication**

**Version:** 1.0  
**Date:** December 2024  
**Database:** MongoDB

---

## **1. Users Collection**

**Collection Name:** `users`

### **Schema Definition**

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated
  firstName: String,                // Required, 2-50 chars, letters and spaces only
  lastName: String,                 // Required, 2-50 chars, letters and spaces only
  email: String,                     // Required, unique, lowercase, valid email format
  passwordHash: String,             // Required, hashed with bcrypt (12 rounds), never returned
  
  // Account Security
  loginAttempts: {
    count: Number,                  // Default: 0, increments on failed login
    lastAttempt: Date,              // Last failed login attempt timestamp
    lockedUntil: Date               // Optional, account lockout expiration (15 min from first failed attempt)
  },
  
  // Metadata
  createdAt: Date,                   // Auto-generated on creation
  updatedAt: Date,                   // Auto-updated on modification
  lastLogin: Date                    // Last successful login timestamp (optional)
}
```

### **Validation Rules**

```javascript
{
  firstName: {
    required: true,
    type: String,
    minlength: 2,
    maxlength: 50,
    match: /^[a-zA-Z\s]+$/  // Letters and spaces only
  },
  lastName: {
    required: true,
    type: String,
    minlength: 2,
    maxlength: 50,
    match: /^[a-zA-Z\s]+$/
  },
  email: {
    required: true,
    type: String,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  passwordHash: {
    required: true,
    type: String
  }
}
```

### **Indexes**

```javascript
// Unique index for email (fast lookup and uniqueness constraint)
db.users.createIndex({ email: 1 }, { unique: true });

// Index for account lockout queries
db.users.createIndex({ "loginAttempts.lockedUntil": 1 });

// Index for sorting/filtering
db.users.createIndex({ createdAt: -1 });
```

---

## **2. OTPs Collection**

**Collection Name:** `otps`

### **Schema Definition**

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated
  email: String,                     // Required, lowercase, indexed (for quick lookup)
  otp: String,                       // Required, 6 digits (hashed before storage)
  type: String,                      // Required, enum: ["signup", "password-reset"]
  expiresAt: Date,                   // Required, 10 minutes from creation, TTL index
  attempts: Number,                  // Default: 0, tracks verification attempts
  isUsed: Boolean,                   // Default: false, marks if OTP was used
  createdAt: Date                   // Auto-generated on creation
}
```

### **Validation Rules**

```javascript
{
  email: {
    required: true,
    type: String,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  otp: {
    required: true,
    type: String,
    length: 6,
    match: /^[0-9]{6}$/
  },
  type: {
    required: true,
    type: String,
    enum: ["signup", "password-reset"]
  },
  expiresAt: {
    required: true,
    type: Date
  }
}
```

### **Indexes**

```javascript
// Compound index for fast lookup by email and type
db.otps.createIndex({ email: 1, type: 1 });

// TTL index - auto-delete expired documents after expiration
db.otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for cleanup queries
db.otps.createIndex({ createdAt: -1 });
```

---

## **3. Account Lockouts Collection (Optional - Alternative Approach)**

**Note:** Lockouts can be stored in `users.loginAttempts` field OR in separate collection. This is the separate collection approach.

**Collection Name:** `account_lockouts`

### **Schema Definition**

```javascript
{
  _id: ObjectId,
  email: String,                     // Required, lowercase, indexed
  lockedUntil: Date,                // Required, 15 minutes from first failed attempt
  failedAttempts: Number,           // Default: 0, increments on failed login
  createdAt: Date,                  // Auto-generated on creation
  updatedAt: Date                   // Auto-updated on modification
}
```

### **Indexes**

```javascript
// Index for fast lookup
db.account_lockouts.createIndex({ email: 1 }, { unique: true });

// TTL index - auto-cleanup after unlock
db.account_lockouts.createIndex({ lockedUntil: 1 }, { expireAfterSeconds: 0 });
```

---

## **4. Database Connection Configuration**

### **MongoDB Connection String**

```javascript
// .env file
MONGODB_URI=mongodb://localhost:27017/flowhub
MONGODB_DB_NAME=flowhub
```

### **Connection Setup (Node.js/Mongoose)**

```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
```

---

## **5. Data Migration & Seeding**

### **Initial Setup Script**

```javascript
// scripts/seed-db.js
// Run once to create indexes and seed test data (optional)

const mongoose = require('mongoose');
const User = require('../models/User');

async function seedDatabase() {
  // Create indexes
  await User.collection.createIndex({ email: 1 }, { unique: true });
  
  // Seed test user (optional, for development)
  const testUser = await User.create({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    passwordHash: await bcrypt.hash('Test123!@#', 12)
  });
  
  console.log('Database seeded successfully');
}
```

---

## **6. Important Notes for Implementation**

### **Password Storage**
- **Never store plain text passwords**
- Use bcrypt with 12 salt rounds (good balance of security/performance)
- Hash password before saving to database
- Never return passwordHash in API responses

### **OTP Storage**
- Hash OTP before storing (use bcrypt or SHA-256)
- Store expiration time (10 minutes from creation)
- Use TTL index for automatic cleanup
- Track attempts to prevent brute force

### **Account Lockout**
- Lock account after 5 failed attempts within 15 minutes
- Store lockout expiration in `lockedUntil` field
- Check lockout status before allowing login
- Reset lockout counter on successful login

### **Email Uniqueness**
- Email must be unique (enforced by MongoDB unique index)
- Convert email to lowercase before storing
- Check uniqueness before creating user

---

**Next:** See `02-api-contract.md` for API endpoint specifications.

