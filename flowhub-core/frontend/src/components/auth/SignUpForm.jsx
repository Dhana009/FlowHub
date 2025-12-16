import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useForm from '../../hooks/useForm';
import * as authService from '../../services/authService';
import { 
  email, 
  passwordStrength, 
  firstName, 
  lastName, 
  confirmPassword,
  otp 
} from '../../utils/validation';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

/**
 * Sign Up Form Component
 * 
 * Multi-step form: Basic info → Request OTP → Verify OTP → Complete signup
 */
export default function SignUpForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'verify'
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    setFormValues,
    setErrors,
    setTouched
  } = useForm(
    {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      otp: ''
    },
    {
      firstName,
      lastName,
      email,
      password: passwordStrength,
      confirmPassword: (value) => confirmPassword(value, values.password),
      otp
    }
  );

  /**
   * Request OTP
   */
  const handleRequestOTP = async () => {
    setSubmitError('');

    // Validate basic fields
    const fieldsToValidate = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    const validationRules = {
      firstName,
      lastName,
      email,
      password: passwordStrength,
      confirmPassword: (value) => confirmPassword(value, values.password)
    };

    let isValid = true;
    const newErrors = {};

    fieldsToValidate.forEach((field) => {
      const validator = validationRules[field];
      if (validator) {
        const error = validator(values[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    if (!isValid) {
      // Set errors and mark fields as touched
      Object.keys(newErrors).forEach((key) => {
        handleBlur(key);
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.signupRequestOTP(values.email);
      setOtpSent(true);
      setStep('otp');
      setSubmitError('');
      
      // In development, OTP is in response
      if (response.otp) {
        console.log('OTP (dev only):', response.otp);
      }
    } catch (error) {
      setSubmitError(
        error.response?.data?.error || 
        error.message || 
        'Failed to send OTP. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Verify OTP
   */
  const handleVerifyOTP = async () => {
    setSubmitError('');

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.signupVerifyOTP(values.email, values.otp);
      setStep('verify');
      setSubmitError('');
    } catch (error) {
      setSubmitError(
        error.response?.data?.error || 
        error.message || 
        'Invalid OTP. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Complete signup
   */
  const handleSignup = async () => {
    // Clear any previous errors
    setSubmitError('');
    setOtpSent(false); // Reset OTP sent state

    setIsSubmitting(true);

    try {
      const response = await authService.signup(
        {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password
        },
        values.otp
      );

      // Auto-login after signup
      // Token is already set by authService, but we need to update context
      await login(values.email, values.password, false);
      
      // Redirect to items page
      navigate('/items', { replace: true });
    } catch (error) {
      // If signup fails, go back to OTP step to allow retry
      setStep('otp');
      setSubmitError(
        error.response?.data?.error || 
        error.message || 
        'Signup failed. The OTP may have expired. Please request a new OTP.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const pwd = values.password;
    if (!pwd) return null;

    const hasLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*]/.test(pwd);

    const strength = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    return { strength, hasLength, hasUpper, hasLower, hasNumber, hasSpecial };
  };

  const passwordStrengthInfo = getPasswordStrength();

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        if (step === 'form') handleRequestOTP();
        else if (step === 'otp') handleVerifyOTP();
        else handleSignup();
      }}
      role="form"
      aria-label="Sign up form"
      className="w-full"
    >
      {step === 'form' && (
        <>
          <Input
            type="text"
            label="First Name"
            value={values.firstName}
            onChange={(value) => handleChange('firstName', value)}
            onBlur={() => handleBlur('firstName')}
            error={touched.firstName ? errors.firstName : ''}
            dataTestid="signup-first-name"
            placeholder="Enter your first name"
            required
          />

          <Input
            type="text"
            label="Last Name"
            value={values.lastName}
            onChange={(value) => handleChange('lastName', value)}
            onBlur={() => handleBlur('lastName')}
            error={touched.lastName ? errors.lastName : ''}
            dataTestid="signup-last-name"
            placeholder="Enter your last name"
            required
          />

          <Input
            type="email"
            label="Email"
            value={values.email}
            onChange={(value) => handleChange('email', value.toLowerCase())}
            onBlur={() => handleBlur('email')}
            error={touched.email ? errors.email : ''}
            dataTestid="signup-email"
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
            dataTestid="signup-password"
            showPasswordToggle
            placeholder="Enter your password"
            required
          />

          {passwordStrengthInfo && values.password && (
            <div className="mb-5 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs font-medium text-gray-700 mb-2">Password requirements:</div>
              <div className="space-y-1.5">
                {[
                  { label: 'At least 8 characters', met: passwordStrengthInfo.hasLength },
                  { label: 'One uppercase letter', met: passwordStrengthInfo.hasUpper },
                  { label: 'One lowercase letter', met: passwordStrengthInfo.hasLower },
                  { label: 'One number', met: passwordStrengthInfo.hasNumber },
                  { label: 'One special character', met: passwordStrengthInfo.hasSpecial }
                ].map((req, idx) => (
                  <div key={idx} className="flex items-center text-xs">
                    <svg 
                      className={`w-4 h-4 mr-2 flex-shrink-0 ${req.met ? 'text-green-600' : 'text-gray-400'}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      {req.met ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      )}
                    </svg>
                    <span className={req.met ? 'text-gray-700' : 'text-gray-500'}>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Input
            type="password"
            label="Confirm Password"
            value={values.confirmPassword}
            onChange={(value) => handleChange('confirmPassword', value)}
            onBlur={() => handleBlur('confirmPassword')}
            error={touched.confirmPassword ? errors.confirmPassword : ''}
            dataTestid="signup-confirm-password"
            showPasswordToggle
            placeholder="Confirm your password"
            required
          />

          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            dataTestid="signup-request-otp"
            className="w-full"
          >
            Request OTP
          </Button>
        </>
      )}

      {step === 'otp' && (
        <>
          <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">Verification code sent</p>
              <p className="mt-1">OTP has been sent to <strong>{values.email}</strong>. Please check your email.</p>
            </div>
          </div>

          <Input
            type="text"
            label="OTP"
            value={values.otp}
            onChange={(value) => {
              // Only allow numeric input
              const numericValue = value.replace(/\D/g, '');
              // Limit to 6 digits
              const limitedValue = numericValue.slice(0, 6);
              handleChange('otp', limitedValue);
              
              // Real-time validation: validate as user types (if field has been touched)
              if (touched.otp) {
                const otpError = otp(limitedValue);
                setErrors(prev => ({
                  ...prev,
                  otp: otpError || undefined
                }));
              }
            }}
            onBlur={() => {
              handleBlur('otp');
              // Validate on blur
              const otpError = otp(values.otp);
              setErrors(prev => ({
                ...prev,
                otp: otpError || undefined
              }));
            }}
            error={touched.otp ? errors.otp : ''}
            dataTestid="signup-otp"
            placeholder="Enter 6-digit OTP"
            required
            maxLength={6}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setStep('form')}
              variant="secondary"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              dataTestid="signup-verify-otp"
              className="flex-1"
            >
              Verify OTP
            </Button>
          </div>
        </>
      )}

      {step === 'verify' && (
        <>
          {!submitError && (
            <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">OTP verified successfully!</p>
                <p className="mt-1">Click below to complete your account setup.</p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            dataTestid="signup-submit"
            className="w-full"
          >
            Complete Sign Up
          </Button>
        </>
      )}

      {submitError && (
        <ErrorMessage 
          message={submitError}
          dataTestid="signup-error"
          ariaLive="assertive"
        />
      )}
    </form>
  );
}

