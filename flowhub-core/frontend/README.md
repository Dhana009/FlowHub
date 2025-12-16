# FlowHub Frontend

**FlowHub Core (SDET Edition) - Frontend Application**

## Overview

React + Vite + Tailwind CSS frontend for FlowHub Core application. Implements authentication UI (Flow 1) with semantic HTML, accessibility features, and test-friendly locators.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env` file (already created)
   - Update `REACT_APP_API_URL` if backend runs on different port/host

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Verify Setup**
   - Frontend should start on `http://localhost:5173` (or port shown in terminal)
   - App should load without errors
   - Check browser console for any errors

5. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/        # Auth form components (LoginForm, SignUpForm, etc.)
│   │   └── common/      # Reusable components (Input, Button, ErrorMessage)
│   ├── context/         # React Context (AuthContext)
│   ├── hooks/           # Custom hooks (useAuth, useForm)
│   ├── pages/           # Page components (LoginPage, SignUpPage, etc.)
│   ├── routes/          # Route definitions (AppRoutes, ProtectedRoute)
│   ├── services/        # API services (api.js, authService.js)
│   ├── utils/           # Utility functions (validation.js)
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── public/              # Static assets
├── package.json
└── .env                 # Environment variables
```

## Features

- **Semantic HTML:** All interactive elements have proper ARIA attributes
- **Test-Friendly:** All elements have `data-testid` attributes for automation
- **Accessibility:** Keyboard navigation, screen reader support
- **Responsive Design:** Tailwind CSS for modern, responsive UI
- **Token Management:** JWT tokens stored in memory (React state), NOT localStorage

## Pages

### Authentication (Flow 1)

- `/login` - Login page
- `/signup` - Sign-up page
- `/forgot-password` - Password reset page

### Protected Routes

- `/items` - Item list page (requires authentication)

## Development Notes

- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios with interceptors
- **State Management:** React Context (no Redux)

## Next Steps

See `docs/flows/flow-1-auth/coding-sequence-plan.md` for implementation order.

