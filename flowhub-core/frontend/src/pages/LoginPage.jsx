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
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footer={
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Sign up
            </Link>
          </p>
          <div className="pt-2">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
