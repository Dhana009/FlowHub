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
    [TOAST_TYPES.SUCCESS]: 'bg-white border-emerald-500 text-emerald-900 shadow-emerald-100',
    [TOAST_TYPES.ERROR]: 'bg-white border-red-500 text-red-900 shadow-red-100',
    [TOAST_TYPES.INFO]: 'bg-white border-indigo-500 text-indigo-900 shadow-indigo-100',
    [TOAST_TYPES.WARNING]: 'bg-white border-amber-500 text-amber-900 shadow-amber-100'
  };

  const iconColors = {
    [TOAST_TYPES.SUCCESS]: 'text-emerald-500 bg-emerald-50',
    [TOAST_TYPES.ERROR]: 'text-red-500 bg-red-50',
    [TOAST_TYPES.INFO]: 'text-indigo-500 bg-indigo-50',
    [TOAST_TYPES.WARNING]: 'text-amber-500 bg-amber-50'
  };

  const titles = {
    [TOAST_TYPES.SUCCESS]: 'Success',
    [TOAST_TYPES.ERROR]: 'Error',
    [TOAST_TYPES.INFO]: 'Information',
    [TOAST_TYPES.WARNING]: 'Warning'
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
        relative z-50 max-w-sm w-full
        ${typeStyles[type] || typeStyles[TOAST_TYPES.INFO]}
        border-l-4 rounded-xl shadow-xl overflow-hidden
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      data-testid={`toast-${type}`}
    >
      <div className="px-4 py-3 flex items-center">
        <div className={`flex-shrink-0 p-1.5 rounded-md ${iconColors[type] || iconColors[TOAST_TYPES.INFO]}`}>
          {icons[type] || icons[TOAST_TYPES.INFO]}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-tight truncate">
            {message}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-3 flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md focus:outline-none transition-all"
          aria-label="Dismiss notification"
          data-testid="toast-dismiss-button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* Progress bar for auto-dismiss */}
      {autoDismissDuration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-100">
          <div 
            className={`h-full transition-all duration-linear ${
              type === TOAST_TYPES.SUCCESS ? 'bg-emerald-500' :
              type === TOAST_TYPES.ERROR ? 'bg-red-500' :
              type === TOAST_TYPES.WARNING ? 'bg-amber-500' : 'bg-indigo-500'
            }`}
            style={{ 
              animation: `shrinkWidth ${autoDismissDuration}ms linear forwards`
            }}
          />
        </div>
      )}
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
  // Show max 3 toasts
  const visibleToasts = toasts.slice(-3); // Get the 3 most recent toasts

  return (
    <div 
      className="fixed top-20 right-6 z-[9999] flex flex-col space-y-4 w-full max-w-sm pointer-events-none" 
      data-testid="toast-container"
    >
      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      {visibleToasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full animate-in slide-in-from-right-full duration-300">
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

