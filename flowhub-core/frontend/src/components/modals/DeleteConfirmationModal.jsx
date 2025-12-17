/**
 * Delete Confirmation Modal Component
 * 
 * Flow 6 - Item Delete
 * PRD Reference: Flow 6 - Item Delete (Section 7)
 * 
 * Features:
 * - Confirmation dialog before deletion
 * - Loading state during deletion
 * - Error handling with retry logic
 * - Accessibility (WCAG 2.1 AA)
 * - Semantic HTML and data-testid attributes
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Button from '../common/Button';

// Modal states
const MODAL_STATES = {
  IDLE: 'IDLE',
  DELETING: 'DELETING',
  ERROR: 'ERROR',
  RETRYING: 'RETRYING',
  ERROR_PERMANENT: 'ERROR_PERMANENT'
};

// Recoverable errors (can retry)
const RECOVERABLE_ERRORS = [500, 0, 408]; // 500 Server Error, 0 Network Error, 408 Timeout

// Maximum retry attempts (PRD Section 11.3)
const MAX_RETRIES = 3;

/**
 * DeleteConfirmationModal Component
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {object|null} props.item - Item to delete (null to close)
 * @param {function} props.onConfirm - Callback when user confirms deletion
 * @param {function} props.onCancel - Callback when user cancels
 * @param {HTMLElement} props.triggerElement - Element that triggered modal (for focus return)
 */
export default function DeleteConfirmationModal({ 
  isOpen, 
  item, 
  onConfirm, 
  onCancel,
  triggerElement 
}) {
  const [modalState, setModalState] = useState(MODAL_STATES.IDLE);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const modalRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const abortControllerRef = useRef(null);

  /**
   * Get item display name (PRD Section 7.1)
   */
  const getItemDisplayName = useCallback(() => {
    if (!item) return 'this item';
    return item.name || 'this item';
  }, [item]);

  /**
   * Cancel delete request (PRD Section 7.2)
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Handle delete confirmation (PRD Section 5: User Journey)
   */
  const handleConfirm = useCallback(async () => {
    if (!item || !item._id) return;

    // Cancel any existing request
    cancelRequest();

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setModalState(MODAL_STATES.DELETING);
      setError(null);

      // Call onConfirm with abort signal
      await onConfirm(item._id, abortControllerRef.current.signal);

      // Check if request was cancelled
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      // Success - modal will be closed by parent component
      setModalState(MODAL_STATES.IDLE);
      setRetryCount(0);

    } catch (err) {
      // Check if request was cancelled
      if (err.isCancelled || abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Handle error (PRD Section 11.1: Error Scenarios)
      const errorData = {
        message: err.message || 'An error occurred',
        statusCode: err.statusCode || 0,
        error_code: err.error_code || err.statusCode || 0,
        error_type: err.error_type || 'Error',
        isRecoverable: RECOVERABLE_ERRORS.includes(err.statusCode || err.error_code || 0)
      };

      setError(errorData);

      // Determine next state (PRD Section 11.3: Retry Logic)
      if (errorData.isRecoverable && retryCount < MAX_RETRIES) {
        setModalState(MODAL_STATES.ERROR);
      } else {
        setModalState(MODAL_STATES.ERROR_PERMANENT);
      }
    }
  }, [item, onConfirm, cancelRequest, retryCount]);

  /**
   * Handle retry (PRD Section 11.3: Retry Logic)
   */
  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRIES) {
      return;
    }

    setRetryCount(prev => prev + 1);
    setModalState(MODAL_STATES.RETRYING);
    handleConfirm();
  }, [retryCount, handleConfirm]);

  /**
   * Handle cancel (PRD Section 7.2: Cancel Button)
   */
  const handleCancel = useCallback(() => {
    // Cancel pending request
    cancelRequest();

    // Reset state
    setModalState(MODAL_STATES.IDLE);
    setError(null);
    setRetryCount(0);

    // Return focus to trigger element (PRD Section 14.1: Focus Management)
    if (triggerElement && typeof triggerElement.focus === 'function') {
      triggerElement.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }

    // Call onCancel callback
    if (onCancel) {
      onCancel();
    }
  }, [cancelRequest, triggerElement, onCancel]);

  /**
   * Handle Escape key (PRD Section 7.2: Escape Key)
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      // Disable Escape during deletion (PRD Section 5)
      if (modalState === MODAL_STATES.DELETING || modalState === MODAL_STATES.RETRYING) {
        return;
      }

      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, modalState, handleCancel]);

  /**
   * Handle modal open/close lifecycle
   */
  useEffect(() => {
    if (isOpen && item) {
      // Store current focus (PRD Section 14.1: Focus Management)
      previousFocusRef.current = document.activeElement;

      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden';

      // Reset state
      setModalState(MODAL_STATES.IDLE);
      setError(null);
      setRetryCount(0);

      // Focus cancel button (first focusable element)
      setTimeout(() => {
        if (cancelButtonRef.current) {
          cancelButtonRef.current.focus();
        }
      }, 100);
    } else if (!isOpen) {
      // Unlock body scroll when modal closes
      document.body.style.overflow = '';
      
      // Cleanup on close
      cancelRequest();
      setModalState(MODAL_STATES.IDLE);
      setError(null);
      setRetryCount(0);
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, item, cancelRequest]);

  /**
   * Focus trap (PRD Section 14.1: Focus Trap)
   */
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Don't render if closed
  if (!isOpen || !item) {
    return null;
  }

  const itemDisplayName = getItemDisplayName();
  const isDeleting = modalState === MODAL_STATES.DELETING || modalState === MODAL_STATES.RETRYING;
  const showRetry = error && error.isRecoverable && modalState !== MODAL_STATES.ERROR_PERMANENT && retryCount < MAX_RETRIES;

  return (
    <>
      {/* Overlay (PRD Section 7.1) - High z-index to cover Header and Sidebar */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 z-[150]"
        aria-hidden="true"
        onClick={(e) => {
          if (!isDeleting) {
            handleCancel();
          }
        }}
      ></div>
      
      {/* Modal Dialog Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-message"
        className="fixed inset-0 z-[160] flex items-center justify-center pointer-events-none"
        data-testid="delete-confirm-modal"
      >
        {/* Modal Container (PRD Section 7.1) */}
        <div
          ref={modalRef}
          className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 my-4 p-6 max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Modal Title (PRD Section 7.1) */}
        <h2
          id="delete-modal-title"
          className="text-xl font-semibold text-gray-900 mb-4"
        >
          Deactivate Item
        </h2>

        {/* Modal Message (PRD Section 7.1) */}
        <p
          id="delete-modal-message"
          className="text-gray-700 mb-6"
          data-testid="delete-confirm-message"
        >
          Are you sure you want to deactivate <strong>'{itemDisplayName}'</strong>? This action cannot be undone.
        </p>

        {/* Error Message (PRD Section 11.1) */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            aria-live="assertive"
          >
            <p className="text-sm text-red-800">{error.message}</p>
            {modalState === MODAL_STATES.ERROR_PERMANENT && (
              <p className="text-xs text-red-600 mt-1">
                Unable to deactivate item. Please try again later.
              </p>
            )}
          </div>
        )}

        {/* Buttons (PRD Section 7.1) */}
        <div className="flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            onClick={handleCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="cancel-button"
          >
            Cancel
          </button>
          
          {showRetry ? (
            <Button
              onClick={handleRetry}
              disabled={isDeleting}
              dataTestid="retry-button"
            >
              {modalState === MODAL_STATES.RETRYING 
                ? `Retrying... (${retryCount}/${MAX_RETRIES})`
                : `Retry (${retryCount}/${MAX_RETRIES})`
              }
            </Button>
          ) : (
            <button
              ref={deleteButtonRef}
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              data-testid="confirm-delete-button"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deactivating...
                </>
              ) : (
                'Deactivate'
              )}
            </button>
          )}
        </div>
        </div>
      </div>
    </>
  );
}

