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
    <AuthCard
      title="Create your account"
      subtitle="Get started with FlowHub today"
      footer={
        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
