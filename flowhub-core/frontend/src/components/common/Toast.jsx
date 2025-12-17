/**
 * Toast Notification Component
 * 
 * Flow 6 - Item Delete
 * PRD Reference: Flow 6 - Item Delete (Section 12)
 * 
 * Features:
 * - Success and error toast notifications
 * - Auto-dismiss with configurable duration
 * - Manual dismiss option
 * - Position: Top-right corner
 * - Queue management (max 3 visible)
 */

import { useEffect, useState } from 'react';

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Toast durations (PRD Section 12.1)
const TOAST_DURATIONS = {
  SUCCESS: 3000, // 3 seconds
  ERROR: 5000,   // 5 seconds
  INFO: 3000,
  WARNING: 4000
};

/**
 * Toast Component
 * 
 * @param {object} props
 * @param {string} props.message - Toast message
 * @param {string} props.type - Toast type (success, error, info, warning)
 * @param {function} props.onDismiss - Callback when toast is dismissed
 * @param {number} props.duration - Auto-dismiss duration in ms (optional)
 */
export default function Toast({ message, type = TOAST_TYPES.INFO, onDismiss, duration }) {
  const [isVisible, setIsVisible] = useState(true);
  const autoDismissDuration = duration || TOAST_DURATIONS[type.toUpperCase()] || TOAST_DURATIONS.INFO;

  useEffect(() => {
    if (autoDismissDuration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          if (onDismiss) onDismiss();
        }, 300); // Wait for fade-out animation
      }, autoDismissDuration);

      return () => clearTimeout(timer);
    }
  }, [autoDismissDuration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300); // Wait for fade-out animation
  };

  const typeStyles = {
    [TOAST_TYPES.SUCCESS]: 'bg-emerald-50 border-emerald-500 text-emerald-800',
    [TOAST_TYPES.ERROR]: 'bg-red-50 border-red-500 text-red-800',
    [TOAST_TYPES.INFO]: 'bg-indigo-50 border-indigo-500 text-indigo-800',
    [TOAST_TYPES.WARNING]: 'bg-amber-50 border-amber-500 text-amber-800'
  };

  const icons = {
    [TOAST_TYPES.SUCCESS]: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    [TOAST_TYPES.ERROR]: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    [TOAST_TYPES.INFO]: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    [TOAST_TYPES.WARNING]: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  };

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live={type === TOAST_TYPES.ERROR ? 'assertive' : 'polite'}
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        ${typeStyles[type] || typeStyles[TOAST_TYPES.INFO]}
        border-l-4 rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      data-testid={`toast-${type}`}
    >
      <div className="p-4 flex items-start">
        <div className="flex-shrink-0">
          {icons[type] || icons[TOAST_TYPES.INFO]}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          aria-label="Dismiss notification"
          data-testid="toast-dismiss-button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Toast Container Component
 * Manages multiple toasts with queue (max 3 visible)
 * 
 * @param {array} toasts - Array of toast objects { id, message, type, duration }
 * @param {function} onDismiss - Callback when toast is dismissed
 */
export function ToastContainer({ toasts = [], onDismiss }) {
  // Show max 3 toasts (PRD Section 12.2)
  const visibleToasts = toasts.slice(0, 3);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" data-testid="toast-container">
      {visibleToasts.map((toast, index) => (
        <div
          key={toast.id}
          className="transform transition-all duration-300"
          style={{
            transform: `translateY(${index * 80}px)`
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onDismiss={() => onDismiss && onDismiss(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

