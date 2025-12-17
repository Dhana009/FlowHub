import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import AuthCard from '../components/auth/AuthCard';

/**
 * Forgot Password Page
 * 
 * Professional password reset page with modern design.
 */
export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email to receive a password reset code"
      footer={
        <p className="text-center text-sm text-slate-600">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
