import { Link } from 'react-router-dom';
import SignUpForm from '../components/auth/SignUpForm';
import AuthCard from '../components/auth/AuthCard';

/**
 * Sign Up Page
 * 
 * Professional sign-up page with modern design.
 */
export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <AuthCard
        title="Create your account"
        subtitle="Get started with FlowHub today"
        footer={
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        }
      >
        <SignUpForm />
      </AuthCard>
    </div>
  );
}
