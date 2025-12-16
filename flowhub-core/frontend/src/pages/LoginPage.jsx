import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import AuthCard from '../components/auth/AuthCard';

/**
 * Login Page
 * 
 * Professional login page with modern design.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your account to continue"
        footer={
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign up
              </Link>
            </p>
            <div className="pt-2">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        }
      >
        <LoginForm />
      </AuthCard>
    </div>
  );
}
