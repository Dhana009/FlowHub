import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useForm from '../../hooks/useForm';
import * as authService from '../../services/authService';
import { email, passwordStrength, confirmPassword, otp } from '../../utils/validation';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

/**
 * Forgot Password Form Component
 * 
 * Multi-step form: Email → Request OTP → Verify OTP → Reset Password
 */
export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset'
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    setErrors,
    setTouched
  } = useForm(
    {
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    },
    {
      email,
      otp,
      newPassword: passwordStrength,
      confirmPassword: (value) => confirmPassword(value, values.newPassword)
    }
  );

  /**
   * Request password reset OTP
   */
  const handleRequestOTP = async () => {
    setSubmitError('');
    setSuccessMessage('');

    // Only validate email field for this step
    const emailError = email(values.email);
    if (emailError) {
      setErrors({ email: emailError });
      setTouched({ email: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.forgotPasswordRequestOTP(values.email);
      setStep('otp');
      setSuccessMessage('If this email exists, OTP has been sent.');
      
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
    setSuccessMessage('');

    // Only validate email and OTP fields for this step
    const emailError = email(values.email);
    const otpError = otp(values.otp);
    if (emailError || otpError) {
      setErrors({ 
        email: emailError || undefined,
        otp: otpError || undefined
      });
      setTouched({ 
        email: true,
        otp: true
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify OTP first (this doesn't mark it as used)
      await authService.forgotPasswordVerifyOTP(values.email, values.otp);
      setStep('reset');
      setSuccessMessage('');
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
   * Reset password
   */
  const handleResetPassword = async () => {
    setSubmitError('');
    setSuccessMessage('');

    // Validate all fields for password reset step
    const emailError = email(values.email);
    const otpError = otp(values.otp);
    const newPasswordError = passwordStrength(values.newPassword);
    const confirmPasswordError = confirmPassword(values.confirmPassword, values.newPassword);
    
    if (emailError || otpError || newPasswordError || confirmPasswordError) {
      setErrors({
        email: emailError || undefined,
        otp: otpError || undefined,
        newPassword: newPasswordError || undefined,
        confirmPassword: confirmPasswordError || undefined
      });
      setTouched({
        email: true,
        otp: true,
        newPassword: true,
        confirmPassword: true
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.forgotPasswordReset(
        values.email,
        values.otp,
        values.newPassword
      );

      setSuccessMessage('Password reset successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (error) {
      setSubmitError(
        error.response?.data?.error || 
        error.message || 
        'Password reset failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        if (step === 'email') handleRequestOTP();
        else if (step === 'otp') handleVerifyOTP();
        else handleResetPassword();
      }}
      role="form"
      aria-label="Forgot password form"
      className="w-full"
    >
      {step === 'email' && (
        <>
          <Input
            type="email"
            label="Email"
            value={values.email}
            onChange={(value) => handleChange('email', value.toLowerCase())}
            onBlur={() => handleBlur('email')}
            error={touched.email ? errors.email : ''}
            dataTestid="forgot-password-email"
            placeholder="Enter your email"
            required
          />

          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            dataTestid="forgot-password-request-otp"
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
              <p className="mt-1">{successMessage || `If this email exists, OTP has been sent to ${values.email}. Please check your email.`}</p>
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
            dataTestid="forgot-password-otp"
            placeholder="Enter 6-digit OTP"
            required
            maxLength={6}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setStep('email')}
              variant="secondary"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleVerifyOTP}
              loading={isSubmitting}
              disabled={isSubmitting}
              dataTestid="forgot-password-verify-otp"
              className="flex-1"
            >
              Verify OTP
            </Button>
          </div>
        </>
      )}

      {step === 'reset' && (
        <>
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">OTP verified successfully!</p>
              <p className="mt-1">Please enter your new password below.</p>
            </div>
          </div>

          <Input
            type="password"
            label="New Password"
            value={values.newPassword}
            onChange={(value) => {
              handleChange('newPassword', value);
              // Clear confirmPassword error when newPassword changes
              setErrors(prev => ({
                ...prev,
                newPassword: passwordStrength(value) || undefined,
                confirmPassword: confirmPassword(values.confirmPassword, value) || undefined
              }));
            }}
            onBlur={() => {
              handleBlur('newPassword');
              const newPasswordError = passwordStrength(values.newPassword);
              setErrors(prev => ({
                ...prev,
                newPassword: newPasswordError || undefined
              }));
            }}
            error={touched.newPassword ? errors.newPassword : ''}
            dataTestid="forgot-password-new-password"
            showPasswordToggle
            placeholder="Enter new password"
            required
          />

          <Input
            type="password"
            label="Confirm New Password"
            value={values.confirmPassword}
            onChange={(value) => {
              handleChange('confirmPassword', value);
              // Real-time validation: check if passwords match as user types
              if (touched.confirmPassword) {
                const confirmPasswordError = confirmPassword(value, values.newPassword);
                setErrors(prev => ({
                  ...prev,
                  confirmPassword: confirmPasswordError || undefined
                }));
              }
            }}
            onBlur={() => {
              handleBlur('confirmPassword');
              const confirmPasswordError = confirmPassword(values.confirmPassword, values.newPassword);
              setErrors(prev => ({
                ...prev,
                confirmPassword: confirmPasswordError || undefined
              }));
            }}
            error={touched.confirmPassword ? errors.confirmPassword : ''}
            dataTestid="forgot-password-confirm-password"
            showPasswordToggle
            placeholder="Confirm new password"
            required
          />

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setStep('otp')}
              variant="secondary"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              dataTestid="forgot-password-reset"
              className="flex-1"
            >
              Reset Password
            </Button>
          </div>
        </>
      )}

      {submitError && (
        <ErrorMessage 
          message={submitError}
          dataTestid="forgot-password-error"
          ariaLive="assertive"
        />
      )}

      {successMessage && step === 'reset' && (
        <div 
          role="alert"
          aria-live="polite"
          className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-start"
        >
          <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="flex-1">{successMessage}</span>
        </div>
      )}
    </form>
  );
}

