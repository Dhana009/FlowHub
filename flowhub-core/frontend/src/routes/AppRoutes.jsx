import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import ItemsPage from '../pages/ItemsPage';
import CreateItemPage from '../pages/CreateItemPage';
import EditItemPage from '../pages/EditItemPage';

/**
 * Root Route Component
 * 
 * Handles the default "/" route.
 * Waits for auth initialization, then redirects based on auth state.
 */
function RootRoute() {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  // Still initializing - show loader
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Initialization complete - redirect based on auth state
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
}

/**
 * Protected Route Component
 * 
 * Wrapper to protect routes that require authentication.
 * Redirects to login if not authenticated.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  // Still initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated - render children
  return <>{children}</>;
}

/**
 * App Routes
 * 
 * Defines all routes for the application.
 * Public routes: login, signup, forgot-password
 * Protected routes: items (and future flows)
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - Auth Layout */}
      <Route
        path="/login"
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthLayout>
            <SignUpPage />
          </AuthLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthLayout>
            <ForgotPasswordPage />
          </AuthLayout>
        }
      />

      {/* Protected routes - App Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout title="Dashboard">
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/items"
        element={
          <ProtectedRoute>
            <AppLayout title="Items">
              <ItemsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/items/create"
        element={
          <ProtectedRoute>
            <AppLayout title="Create Item">
              <CreateItemPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/items/:id/edit"
        element={
          <ProtectedRoute>
            <AppLayout title="Edit Item">
              <EditItemPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect - check auth first before redirecting */}
      <Route path="/" element={<RootRoute />} />

      {/* 404 - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

