# FlowHub Backend

**FlowHub Core (SDET Edition) - Backend Server**

## Overview

Node.js + Express + MongoDB backend for FlowHub Core application. Implements authentication flow (Flow 1) with JWT tokens, OTP verification, and account security features.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env` file (already created)
   - Update `MONGODB_URI` if MongoDB is not running on localhost:27017
   - Generate secure JWT secrets (minimum 32 characters each):
     - `JWT_SECRET`
     - `JWT_REFRESH_SECRET`
   - Update `ALLOWED_ORIGINS` if frontend runs on different ports

3. **Start MongoDB**
   - Ensure MongoDB is running on `localhost:27017`
   - Or update `MONGODB_URI` in `.env` to point to your MongoDB instance

4. **Run the Server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

5. **Verify Setup**
   - Server should start on `http://localhost:3000`
   - Check console for "MongoDB connected" message
   - API base URL: `http://localhost:3000/api/v1`

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, JWT)
│   ├── controllers/     # Route handlers (HTTP layer)
│   ├── middleware/      # Express middleware (auth, rate limiting, error handling)
│   ├── models/          # MongoDB schemas (User, OTP)
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic layer
│   ├── utils/           # Utility functions (password, validation)
│   └── app.js           # Express app setup
├── server.js            # Server entry point
├── package.json
└── .env                 # Environment variables
```

## API Endpoints

### Authentication (Flow 1)

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup/request-otp` - Request signup OTP
- `POST /api/v1/auth/signup/verify-otp` - Verify signup OTP
- `POST /api/v1/auth/signup` - Complete signup
- `POST /api/v1/auth/forgot-password/request-otp` - Request password reset OTP
- `POST /api/v1/auth/forgot-password/reset` - Reset password
- `POST /api/v1/auth/logout` - User logout

## Development Notes

- **Database:** MongoDB (collections: `users`, `otps`)
- **Authentication:** JWT tokens (access token in Authorization header, refresh token in httpOnly cookie)
- **Security:** Account lockout after 5 failed login attempts, OTP rate limiting (3 per 15 minutes)
- **Password:** Bcrypt hashing with 12 salt rounds

## Next Steps

See `docs/flows/flow-1-auth/coding-sequence-plan.md` for implementation order.

