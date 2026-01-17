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
import ActivityLogsPage from '../pages/ActivityLogsPage';
import UsersPage from '../pages/UsersPage';

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
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="sr-only">FlowHub Loading</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
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
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="sr-only">FlowHub Loading</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
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
 * Public Route Component
 * 
 * Wrapper for routes that should only be accessible when NOT authenticated.
 * Redirects to dashboard if already logged in.
 */
function PublicRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();

  // Still initializing
  if (!isInitialized) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="sr-only">FlowHub Session Verification</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking session...</p>
        </div>
      </main>
    );
  }

  // Already authenticated - redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Not authenticated - render children
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
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <AuthLayout>
              <SignUpPage />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <AuthLayout>
              <ForgotPasswordPage />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Protected routes - App Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout title="System Dashboard">
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/items"
        element={
          <ProtectedRoute>
            <AppLayout title="Items Management">
              <ItemsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/items/create"
        element={
          <ProtectedRoute>
            <AppLayout title="Create New Item">
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
      <Route
        path="/activity-logs"
        element={
          <ProtectedRoute>
            <AppLayout title="Activity Logs">
              <ActivityLogsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AppLayout title="User Management">
              <UsersPage />
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

