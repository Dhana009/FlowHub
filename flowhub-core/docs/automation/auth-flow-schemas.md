# Flow 1: Auth API Schemas for QA Testing

## POST /auth/signup/request-otp
**Request Body:**
```json
{
  "email": "string (required, valid email format)"
}
```

**Valid Example:**
```json
{
  "email": "user@example.com"
}
```

---

## POST /auth/signup/verify-otp
**Request Body:**
```json
{
  "email": "string (required, valid email format)",
  "otp": "string (required, exactly 6 digits)"
}
```

**Valid Example:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

---

## POST /auth/signup
**Request Body:**
```json
{
  "firstName": "string (required, 2-50 chars, letters and spaces only)",
  "lastName": "string (required, 2-50 chars, letters and spaces only)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 8 chars, must contain: uppercase, lowercase, number, special char !@#$%^&*)",
  "otp": "string (required, exactly 6 digits)",
  "role": "string (optional, one of: 'ADMIN', 'EDITOR', 'VIEWER', defaults to 'EDITOR')"
}
```

**Valid Example:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "otp": "123456",
  "role": "EDITOR"
}
```

---

## POST /auth/login
**Request Body:**
```json
{
  "email": "string (required, valid email format)",
  "password": "string (required, minimum 8 characters)",
  "rememberMe": "boolean (optional, defaults to false)"
}
```

**Valid Example:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

---

## POST /auth/logout
**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:** None

---

## Field Validation Rules

### email
- Type: string
- Required: yes
- Format: Valid email regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`

### otp
- Type: string
- Required: yes
- Format: Exactly 6 digits: `^[0-9]{6}$`

### firstName / lastName
- Type: string
- Required: yes
- Length: 2-50 characters
- Pattern: Letters and spaces only: `^[a-zA-Z\s]+$`

### password
- Type: string
- Required: yes
- Minimum length: 8 characters
- Must contain:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (!@#$%^&*)

### role
- Type: string
- Required: no
- Allowed values: `"ADMIN"`, `"EDITOR"`, `"VIEWER"`
- Default: `"EDITOR"`

### rememberMe
- Type: boolean
- Required: no
- Default: false



