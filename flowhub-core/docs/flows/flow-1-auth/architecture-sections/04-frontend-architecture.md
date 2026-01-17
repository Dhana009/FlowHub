# **Frontend Architecture - Flow 1: Authentication**

**Version:** 1.0  
**Date:** December 2024  
**Technology:** React + Tailwind CSS

---

## **1. Folder Structure**

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx           # Login page
│   │   ├── SignUpPage.jsx          # Sign-up page
│   │   └── ForgotPasswordPage.jsx  # Password reset page
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx       # Login form component
│   │   │   ├── SignUpForm.jsx      # Sign-up form component
│   │   │   └── ForgotPasswordForm.jsx # Password reset form
│   │   └── common/
│   │       ├── Input.jsx           # Reusable input component
│   │       ├── Button.jsx          # Reusable button component
│   │       └── ErrorMessage.jsx   # Error message component
│   ├── services/
│   │   ├── api.js                  # API client (axios/fetch wrapper)
│   │   └── authService.js          # Auth API calls
│   ├── hooks/
│   │   ├── useAuth.js              # Auth hook (login, logout, token management)
│   │   └── useForm.js               # Form handling hook
│   ├── context/
│   │   └── AuthContext.jsx         # Auth context (user state, token)
│   ├── utils/
│   │   ├── validation.js            # Client-side validation
│   │   └── token.js                # Token management (memory storage)
│   ├── routes/
│   │   └── AppRoutes.jsx           # Route definitions (protected routes)
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── README.md
```

---

## **2. Component Structure**

### **2.1 Pages**

**LoginPage.jsx:**
- **Purpose:** Container page for login form
- **Structure:** Centered layout, renders LoginForm component
- **No business logic** - just layout

**SignUpPage.jsx:**
- **Purpose:** Container page for sign-up form
- **Structure:** Centered layout, renders SignUpForm component
- **No business logic** - just layout

**ForgotPasswordPage.jsx:**
- **Purpose:** Container page for password reset form
- **Structure:** Centered layout, renders ForgotPasswordForm component

---

### **2.2 Auth Components**

**LoginForm.jsx - Required Elements:**
- **Form:** `<form role="form" aria-label="Login form">`
- **Email Input:** 
  - `data-testid="login-email"`
  - `aria-label="Email"`
  - Auto-convert to lowercase on input
  - Validation on blur
- **Password Input:**
  - `data-testid="login-password"`
  - `aria-label="Password"`
  - Show/hide password toggle
  - Validation on submit
- **Remember Me Checkbox:**
  - `data-testid="login-remember-me"`
  - `aria-label="Remember Me"`
- **Submit Button:**
  - `data-testid="login-submit"`
  - `aria-label="Sign In"`
  - Loading state (spinner when submitting)
  - Disabled during API call
- **Error Message:**
  - `data-testid="login-error"`
  - `role="alert"` with `aria-live="assertive"`
  - Display below button on error

**SignUpForm.jsx - Required Elements:**
- First Name, Last Name, Email, Password, Confirm Password inputs
- OTP input field (shown after form submission)
- All with semantic attributes and data-testid
- Real-time password strength indicator

**ForgotPasswordForm.jsx - Required Elements:**
- Email input, OTP input, New Password, Confirm Password inputs
- Request OTP button, Reset Password button
- All with semantic attributes and data-testid

---

### **2.3 Common Components**

**Input.jsx - Required Props:**
- `type`: input type (text, email, password)
- `label`: label text
- `error`: error message string (optional)
- `data-testid`: test identifier
- `showPasswordToggle`: boolean (for password inputs)

**Required Attributes:**
- `role="textbox"`
- `aria-label={label}`
- `data-testid={data-testid}`
- `aria-invalid={!!error}`
- `aria-describedby` pointing to error element (if error exists)

**Error Display:**
- Show error below input
- `role="alert"` with `aria-live="polite"`
- `data-testid="{fieldName}-error"`

**Button.jsx - Required Props:**
- `loading`: boolean (shows spinner)
- `disabled`: boolean
- `data-testid`: test identifier

**Required Attributes:**
- `role="button"`
- `aria-label` with action description
- `data-testid={data-testid}`
- `aria-busy={loading}` when loading
- `disabled` when loading or disabled

---

## **3. State Management**

### **3.1 Auth Context** (`context/AuthContext.jsx`)

**Purpose:** Global state management for authentication.

**State Variables:**
- `user`: User object (null if not logged in)
- `token`: JWT token (stored in memory/React state, NOT localStorage)

**Functions:**
- `login(email, password, rememberMe)`: 
  - Call authService.login()
  - Store token in state (memory)
  - Store user in state
  - Refresh token automatically stored in httpOnly cookie
  
- `logout()`:
  - Call authService.logout()
  - Clear token from state
  - Clear user from state
  
- `isAuthenticated`: Computed boolean (true if token exists)

**Important:** Token must be stored in React state (memory), NOT localStorage or sessionStorage.

---

### **3.2 Form Hook** (`hooks/useForm.js`)

**Purpose:** Reusable form state and validation management.

**State:**
- `values`: Object with form field values
- `errors`: Object with field error messages
- `touched`: Object tracking which fields have been touched

**Functions:**
- `handleChange(name, value)`: Update field value, clear error if exists
- `handleBlur(name)`: Mark field as touched, validate field
- `validateField(name, value)`: Validate single field using validation rules
- `validateAll()`: Validate all fields, return boolean

**Usage:** Pass initial values and validation rules, get back form state and handlers.

---

## **4. API Service**

### **4.1 API Client** (`services/api.js`)

**Purpose:** Centralized HTTP client with interceptors.

**Configuration:**
- Base URL: `process.env.REACT_APP_API_URL` or `http://localhost:3000/api/v1`
- Headers: `Content-Type: application/json`
- `withCredentials: true` (for httpOnly cookies)

**Request Interceptor:**
- Get JWT token from memory (React state/context)
- Add `Authorization: Bearer <token>` header if token exists

**Response Interceptor:**
- On 401 Unauthorized: Try to refresh token using refreshToken cookie
- If refresh succeeds: Retry original request
- If refresh fails: Redirect to `/login`

**Error Handling:** Convert API errors to user-friendly messages

---

### **4.2 Auth Service** (`services/authService.js`)

**Purpose:** API calls for authentication operations.

**Required Functions:**

1. **`login(email, password, rememberMe)`**
   - **Endpoint:** `POST /auth/login`
   - **Process:** Convert email to lowercase, call API, return response data
   - **Output:** { token, refreshToken, user }

2. **`signupRequestOTP(email)`**
   - **Endpoint:** `POST /auth/signup/request-otp`
   - **Process:** Convert email to lowercase, call API
   - **Output:** { message, expiresIn }

3. **`signupVerifyOTP(email, otp)`**
   - **Endpoint:** `POST /auth/signup/verify-otp`
   - **Output:** { message, verified }

4. **`signup(userData, otp)`**
   - **Endpoint:** `POST /auth/signup`
   - **Process:** Convert email to lowercase, include OTP
   - **Output:** { token, refreshToken, user }

5. **`forgotPasswordRequestOTP(email)`**
   - **Endpoint:** `POST /auth/forgot-password/request-otp`
   - **Output:** { message, expiresIn }

6. **`forgotPasswordReset(email, otp, newPassword)`**
   - **Endpoint:** `POST /auth/forgot-password/reset`
   - **Output:** { message }

7. **`logout()`**
   - **Endpoint:** `POST /auth/logout`
   - **Process:** Call API to clear tokens

---

## **5. Validation**

### **5.1 Client-Side Validation** (`utils/validation.js`)

**Purpose:** Reusable validation functions for form fields.

**Required Validators:**

1. **`email(value)`**
   - **Rules:** Required, valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
   - **Output:** Error message string or empty string if valid

2. **`password(value)`**
   - **Rules:** Required only
   - **Output:** Error message or empty string

3. **`passwordStrength(value)`**
   - **Rules:** 
     - Required
     - Min 8 characters
     - At least one uppercase (A-Z)
     - At least one lowercase (a-z)
     - At least one number (0-9)
     - At least one special character (!@#$%^&*)
   - **Output:** Error message or empty string

4. **`firstName(value)`**
   - **Rules:** Required, 2-50 chars, letters and spaces only
   - **Output:** Error message or empty string

5. **`lastName(value)`**
   - **Rules:** Same as firstName
   - **Output:** Error message or empty string

6. **`confirmPassword(value, password)`**
   - **Rules:** Required, must match password exactly
   - **Output:** Error message or empty string

---

## **6. Routing & Protected Routes**

### **6.1 Route Structure** (`routes/AppRoutes.jsx`)

**Public Routes:**
- `/login` - LoginPage
- `/signup` - SignUpPage
- `/forgot-password` - ForgotPasswordPage

**Protected Routes:**
- `/items` - ItemListPage (requires authentication)
- `/` - Redirects to `/items` (or originally requested page)

**ProtectedRoute Component:**
- **Purpose:** Wrapper to protect routes
- **Logic:** Check `isAuthenticated` from useAuth hook
- **If not authenticated:** Redirect to `/login`
- **If authenticated:** Render children

**Implementation:** Use React Router `Navigate` component for redirects

---

## **7. Semantic HTML Requirements**

### **7.1 Required Attributes**

**All form inputs:**
- `role="textbox"` or appropriate role
- `aria-label` with descriptive label
- `data-testid` for automation
- `aria-invalid` when error exists
- `aria-describedby` pointing to error message

**All buttons:**
- `role="button"`
- `aria-label` with action description
- `data-testid` for automation
- `aria-busy="true"` when loading

**Error messages:**
- `role="alert"`
- `aria-live="polite"` or `"assertive"`
- `data-testid` for automation

---

## **8. Dependencies**

**`package.json` dependencies:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "axios": "^1.5.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "vite": "^4.4.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

---

## **9. Environment Variables**

**`.env` file:**
```env
REACT_APP_API_URL=http://localhost:3000/api/v1
```

---

## **10. Implementation Order**

1. **Setup:** React app, routing, Tailwind CSS
2. **Context:** AuthContext setup
3. **Services:** API client, Auth service
4. **Utils:** Validation helpers
5. **Components:** Common components (Input, Button, ErrorMessage)
6. **Hooks:** useForm, useAuth
7. **Pages:** LoginPage, SignUpPage, ForgotPasswordPage
8. **Forms:** LoginForm, SignUpForm, ForgotPasswordForm
9. **Protected Routes:** Route protection logic
10. **Testing:** Manual testing, then automated tests

---

**Next:** See `05-implementation-guide.md` for step-by-step coding instructions.

