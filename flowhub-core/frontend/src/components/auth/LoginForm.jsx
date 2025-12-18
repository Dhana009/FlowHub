import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useForm from '../../hooks/useForm';
import { email, password } from '../../utils/validation';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

/**
 * Login Form Component
 * 
 * Handles user login with email, password, and remember me option.
 */
export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll
  } = useForm(
    {
      email: '',
      password: '',
      rememberMe: false
    },
    {
      email,
      password
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validate all fields
    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(values.email, values.password, values.rememberMe);
      
      // Redirect to dashboard page
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setSubmitError(
        error.response?.data?.error || 
        error.message || 
        'Login failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      role="form"
      aria-label="Login form"
      className="w-full"
      noValidate
    >
      <Input
        type="email"
        label="Email"
        value={values.email}
        onChange={(value) => handleChange('email', value.toLowerCase())}
        onBlur={() => handleBlur('email')}
        error={touched.email ? errors.email : ''}
        dataTestid="login-email"
        placeholder="Enter your email"
        required
      />

      <Input
        type="password"
        label="Password"
        value={values.password}
        onChange={(value) => handleChange('password', value)}
        onBlur={() => handleBlur('password')}
        error={touched.password ? errors.password : ''}
        dataTestid="login-password"
        showPasswordToggle
        placeholder="Enter your password"
        required
      />

      <div className="mb-6 flex items-center justify-between">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={values.rememberMe}
            onChange={(e) => handleChange('rememberMe', e.target.checked)}
            data-testid="login-remember-me"
            role="checkbox"
            aria-checked={values.rememberMe}
            aria-label="Remember me on this device"
            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
          />
          <span className="ml-2 text-sm text-slate-700">Remember me</span>
        </label>
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        dataTestid="login-submit"
        className="w-full"
      >
        Sign In
      </Button>

      {submitError && (
        <ErrorMessage 
          message={submitError}
          dataTestid="login-error"
          ariaLive="assertive"
        />
      )}
    </form>
  );
}

