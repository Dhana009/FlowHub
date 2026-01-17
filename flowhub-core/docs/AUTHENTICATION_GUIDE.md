# Authentication System Guide

## JWT Token System

### Overview
Yes, we are using **JWT (JSON Web Tokens)** for authentication. The system uses a dual-token approach:

1. **Access Token** (JWT)
   - Short-lived: 15 minutes
   - Stored in: React state (memory)
   - Used for: API authentication
   - Secret: `JWT_SECRET` environment variable

2. **Refresh Token** (JWT)
   - Long-lived: 7 days (default) or 30 days (if "Remember Me")
   - Stored in: httpOnly cookie (secure, not accessible via JavaScript)
   - Used for: Getting new access tokens
   - Secret: `JWT_REFRESH_SECRET` environment variable

### Token Flow
```
Login → Get Access Token + Refresh Token
  ↓
API Request → Include Access Token in Authorization header
  ↓
Token Expired? → Use Refresh Token to get new Access Token
  ↓
Refresh Token Expired? → User must login again
```

### Token Storage
- **Access Token**: React Context (memory) - cleared on page refresh
- **Refresh Token**: httpOnly cookie - automatically sent with requests
- **Auto-refresh**: Axios interceptor automatically refreshes expired tokens

## Account Lockout System

### How It Works
- **Max Failed Attempts**: 5 failed login attempts
- **Lockout Duration**: 15 minutes
- **Auto-Unlock**: Account automatically unlocks after 15 minutes

### Lockout Behavior
1. After 5 failed login attempts, account is locked
2. `loginAttempts.lockedUntil` is set to current time + 15 minutes
3. All login attempts are blocked until lockout expires
4. After 15 minutes, lockout automatically expires and account is unlocked

### Database Structure
```javascript
{
  loginAttempts: {
    count: 5,                    // Number of failed attempts
    lastAttempt: Date,           // Last failed attempt timestamp
    lockedUntil: Date            // Lockout expiration time (null if not locked)
  }
}
```

### Manual Unlock from MongoDB

#### Option 1: Reset Lockout Fields
```javascript
// Unlock account immediately
db.users.updateOne(
  { email: "user@example.com" },
  {
    $set: {
      "loginAttempts.count": 0,
      "loginAttempts.lockedUntil": null,
      "loginAttempts.lastAttempt": null
    }
  }
)
```

#### Option 2: Clear Lockout Only
```javascript
// Keep attempt count but unlock account
db.users.updateOne(
  { email: "user@example.com" },
  {
    $set: {
      "loginAttempts.lockedUntil": null
    }
  }
)
```

#### Option 3: Check Lockout Status
```javascript
// Check if account is locked
db.users.findOne(
  { email: "user@example.com" },
  { 
    email: 1,
    "loginAttempts": 1
  }
)
```

### When Account Unlocks
- **Automatic**: After 15 minutes (checked on each login attempt)
- **Manual**: Using MongoDB commands above
- **On Successful Login**: Lockout is cleared automatically

## Password Reset Flow

### Endpoints
1. **Request OTP**: `POST /api/v1/auth/forgot-password/request-otp`
   - Body: `{ email: "user@example.com" }`
   - Returns: `{ message: "...", expiresIn: 10 }`

2. **Verify OTP**: `POST /api/v1/auth/forgot-password/verify-otp`
   - Body: `{ email: "user@example.com", otp: "123456" }`
   - Returns: `{ message: "OTP verified successfully", verified: true }`

3. **Reset Password**: `POST /api/v1/auth/forgot-password/reset`
   - Body: `{ email: "user@example.com", otp: "123456", newPassword: "NewPass123!" }`
   - Returns: `{ message: "Password reset successfully" }`

### Flow Steps
1. User enters email → Request OTP
2. User enters OTP → Verify OTP (doesn't mark as used)
3. User enters new password → Reset password (marks OTP as used)

### OTP Details
- **Type**: `password-reset`
- **Expiry**: 10 minutes
- **Rate Limit**: 3 requests per 15 minutes per email
- **Storage**: Both hashed (`otp`) and plain text (`otpPlain`) in MongoDB

## Common Issues & Solutions

### Issue: Account Locked
**Solution**: Wait 15 minutes OR unlock manually via MongoDB (see above)

### Issue: Password Reset Not Working
**Check**:
1. OTP is not expired (10 minutes)
2. OTP hasn't been used already
3. Email matches the OTP request
4. OTP is correct (check `otpPlain` in MongoDB)

### Issue: Token Expired
**Solution**: Refresh token should auto-refresh. If refresh token expired, user must login again.

### Issue: OTP Not in Database
**Check**:
1. Server was restarted after adding `otpPlain` field
2. Check MongoDB: `db.otps.find({ email: "..." }).sort({ createdAt: -1 })`
3. Look for both `otp` (hashed) and `otpPlain` (readable) fields

## Security Notes

1. **OTP Storage**: `otpPlain` is only for development/testing. In production, exclude it from queries.
2. **Token Security**: Refresh tokens in httpOnly cookies prevent XSS attacks
3. **Account Lockout**: Prevents brute force attacks
4. **Rate Limiting**: OTP requests limited to prevent abuse

## Testing

### Test Account Lockout
```bash
# Try to login 5 times with wrong password
# Account will be locked for 15 minutes
```

### Test Password Reset
```bash
# 1. Request OTP
curl -X POST http://localhost:3000/api/v1/auth/forgot-password/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# 2. Check MongoDB for OTP
db.otps.find({ email: "user@example.com", type: "password-reset" })
  .sort({ createdAt: -1 }).limit(1)

# 3. Verify OTP
curl -X POST http://localhost:3000/api/v1/auth/forgot-password/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'

# 4. Reset Password
curl -X POST http://localhost:3000/api/v1/auth/forgot-password/reset \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456","newPassword":"NewPass123!"}'
```

