/**
 * Item Details Modal Component
 * 
 * Flow 4 - Item Details
 * PRD Reference: Flow 4 - Item Details (Sections 6-11)
 * 
 * Features:
 * - Modal popup with async content loading
 * - State machine (CLOSED, OPENING, LOADING, LOADED, ERROR, RETRYING, ERROR_PERMANENT, CLOSING)
 * - Error handling with retry logic (max 3 attempts)
 * - iframe support for embedded content
 * - Focus trap and keyboard navigation
 * - URL hash management
 * - Responsive design
 * - Accessibility (WCAG 2.1 AA)
 * - Semantic HTML and data-testid attributes
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getItem } from '../../services/itemService';
import Button from '../common/Button';

// Modal states (PRD Section 14.1)
const MODAL_STATES = {
  CLOSED: 'CLOSED',
  OPENING: 'OPENING',
  LOADING: 'LOADING',
  LOADED: 'LOADED',
  ERROR: 'ERROR',
  RETRYING: 'RETRYING',
  ERROR_PERMANENT: 'ERROR_PERMANENT',
  CLOSING: 'CLOSING'
};

// Error types (PRD Section 8.1)
const ERROR_TYPES = {
  NOT_FOUND: 404,
  INVALID_ID: 422,
  UNAUTHORIZED: 401,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 0,
  TIMEOUT: 408
};

// Recoverable errors (PRD Section 8.1)
const RECOVERABLE_ERRORS = [
  ERROR_TYPES.NOT_FOUND,
  ERROR_TYPES.SERVER_ERROR,
  ERROR_TYPES.NETWORK_ERROR,
  ERROR_TYPES.TIMEOUT
];

/**
 * ItemDetailsModal Component
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {string|null} props.itemId - Item ID to display (null to close)
 * @param {function} props.onClose - Callback when modal closes
 * @param {HTMLElement} props.triggerElement - Element that triggered modal (for focus return)
 */
export default function ItemDetailsModal({ isOpen, itemId, onClose, triggerElement }) {
  // State management
  const [modalState, setModalState] = useState(MODAL_STATES.CLOSED);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // Refs for DOM manipulation
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const abortControllerRef = useRef(null);
  const iframeRef = useRef(null);
  const iframeTimeoutRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Maximum retry attempts (PRD Section 8.1)
  const MAX_RETRIES = 3;

  // iframe timeout (PRD Section 6.3: 5 seconds)
  const IFRAME_TIMEOUT_MS = 5000;

  /**
   * Sanitize item ID for data-testid attributes
   * PRD Section 6.2: Special characters replaced with hyphens
   */
  const sanitizeId = useCallback((id) => {
    if (!id) return '';
    return id.toString().replace(/[^a-zA-Z0-9]/g, '-');
  }, []);

  /**
   * Validate embed URL (PRD Section 6.3: Security Framework)
   */
  const isValidEmbedUrl = useCallback((url) => {
    if (!url || typeof url !== 'string') return false;
    
    // Block dangerous protocols
    if (url.startsWith('javascript:') || 
        url.startsWith('data:') || 
        url.startsWith('file:') || 
        url.startsWith('about:')) {
      return false;
    }
    
    // Only allow http:// and https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    
    // Basic URL validation
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Format price (PRD Section 6.2: Field Validation)
   */
  const formatPrice = useCallback((price) => {
    if (price === null || price === undefined) return 'N/A';
    if (price === 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }, []);

  /**
   * Format date (PRD Section 6.2: MM/DD/YYYY)
   */
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch {
      return 'N/A';
    }
  }, []);

  /**
   * Get status display (PRD Section 6.2: Status Display)
   */
  const getStatusDisplay = useCallback((item) => {
    if (!item) return 'Unknown';
    // is_active takes precedence over status
    if (item.is_active === false && item.status === 'active') {
      return 'inactive';
    }
    return item.status || 'unknown';
  }, []);

  /**
   * Get status badge color
   */
  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  /**
   * Cancel pending API request (PRD Section 14.2: Resource Cleanup)
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Clear iframe timeout (PRD Section 6.3)
   */
  const clearIframeTimeout = useCallback(() => {
    if (iframeTimeoutRef.current) {
      clearTimeout(iframeTimeoutRef.current);
      iframeTimeoutRef.current = null;
    }
  }, []);

  /**
   * Load item data (PRD Section 9: API Endpoint)
   */
  const loadItem = useCallback(async (id, isRetry = false) => {
    // Cancel any existing request
    cancelRequest();

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      setModalState(isRetry ? MODAL_STATES.RETRYING : MODAL_STATES.LOADING);
      setError(null);

      const itemData = await getItem(id, abortControllerRef.current.signal);
      
      // Check if request was cancelled
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setItem(itemData);
      setModalState(MODAL_STATES.LOADED);
      setRetryCount(0); // Reset retry count on success

      // Load iframe if embed_url is valid
      if (itemData.embed_url) {
        if (isValidEmbedUrl(itemData.embed_url)) {
          // Valid URL - reset iframe state to show loading
          setIframeLoaded(false);
          setIframeError(false);
        } else {
          // Invalid URL - mark as error
          setIframeLoaded(true);
          setIframeError(true);
        }
      } else {
        // No embed_url - skip iframe
        setIframeLoaded(true);
        setIframeError(false);
      }
    } catch (err) {
      // Check if request was cancelled
      if (err.isCancelled || abortControllerRef.current.signal.aborted) {
        return;
      }

      // Handle error (PRD Section 8.1: Error Scenarios)
      const errorData = {
        message: err.message || 'An error occurred',
        statusCode: err.statusCode || 0,
        error_code: err.error_code || err.statusCode || 0,
        error_type: err.error_type || 'Error',
        isRecoverable: RECOVERABLE_ERRORS.includes(err.statusCode || err.error_code || 0)
      };

      setError(errorData);

      // Determine next state (PRD Section 8.3: Error Recovery Flow)
      if (errorData.isRecoverable && retryCount < MAX_RETRIES) {
        setModalState(MODAL_STATES.ERROR);
      } else {
        setModalState(MODAL_STATES.ERROR_PERMANENT);
      }
    }
  }, [cancelRequest, isValidEmbedUrl, retryCount]);

  /**
   * Handle retry (PRD Section 8.1: Retry Logic)
   */
  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRIES) {
      return;
    }

    setRetryCount(prev => prev + 1);
    loadItem(itemId, true);
  }, [itemId, retryCount, loadItem]);

  /**
   * Handle modal close (PRD Section 10.2: Closing Modal)
   */
  const handleClose = useCallback(() => {
    // Cancel pending requests
    cancelRequest();
    clearIframeTimeout();

    // Clear URL hash immediately (PRD Section 16.1: URL Hash Management)
    if (window.location.hash.startsWith('#item/')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // Close immediately without animation delay to prevent glitch
    setModalState(MODAL_STATES.CLOSED);
    setItem(null);
    setError(null);
    setRetryCount(0);
    setIframeLoaded(false);
    setIframeError(false);

    // Return focus to trigger element (PRD Section 10.2: Focus Management)
    if (triggerElement && typeof triggerElement.focus === 'function') {
      triggerElement.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }

    // Call onClose callback
    if (onClose) {
      onClose();
    }
  }, [cancelRequest, clearIframeTimeout, triggerElement, onClose]);

  /**
   * Handle iframe load (PRD Section 6.3: iframe Handling)
   */
  const handleIframeLoad = useCallback(() => {
    clearIframeTimeout();
    setIframeLoaded(true);
    setIframeError(false);
  }, [clearIframeTimeout]);

  /**
   * Handle iframe error (PRD Section 6.3: iframe Error Handling)
   */
  const handleIframeError = useCallback(() => {
    clearIframeTimeout();
    setIframeLoaded(true);
    setIframeError(true);
  }, [clearIframeTimeout]);

  /**
   * Check if iframe loaded successfully (fallback check)
   * Some sites block iframe embedding, so we check after a delay
   */
  useEffect(() => {
    if (item?.embed_url && isValidEmbedUrl(item.embed_url) && iframeRef.current && !iframeLoaded && !iframeError) {
      // Check if iframe content loaded after a delay
      const checkInterval = setInterval(() => {
        try {
          // Try to access iframe content (will fail if blocked by CORS/X-Frame-Options)
          const iframe = iframeRef.current;
          if (iframe && iframe.contentWindow) {
            // Iframe loaded successfully
            clearInterval(checkInterval);
            setIframeLoaded(true);
            setIframeError(false);
          }
        } catch (e) {
          // CORS error or X-Frame-Options blocking - this is expected for many sites
          // Don't treat as error, just let it be
        }
      }, 1000);

      // Clear interval after 6 seconds (1 second after timeout)
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 6000);

      return () => clearInterval(checkInterval);
    }
  }, [item?.embed_url, iframeLoaded, iframeError]);

  /**
   * Handle Escape key (PRD Section 10.3: Keyboard Navigation)
   */
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && modalState !== MODAL_STATES.CLOSED && modalState !== MODAL_STATES.CLOSING) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, modalState, handleClose]);

  /**
   * Handle URL hash changes (PRD Section 16.1: Browser Back Button)
   */
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#item/')) {
        // Hash was removed (browser back button)
        if (isOpen && modalState !== MODAL_STATES.CLOSED) {
          handleClose();
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isOpen, modalState, handleClose]);

  /**
   * Handle modal open/close lifecycle
   */
  useEffect(() => {
    let loadTimeoutId = null;
    let focusTimeoutId = null;

    if (isOpen && itemId) {
      // Store current focus (PRD Section 10.1: Focus Management)
      previousFocusRef.current = document.activeElement;

      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden';

      // Update URL hash (PRD Section 16.1: URL Hash Management)
      const newHash = `#item/${itemId}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search + newHash);
      }

      // Reset state if opening a different item
      const isDifferentItem = item && item._id !== itemId;
      if (isDifferentItem) {
        setItem(null);
        setError(null);
        setRetryCount(0);
        setIframeLoaded(false);
        setIframeError(false);
      }

      // Transition to OPENING if currently closed or in error state
      if (modalState === MODAL_STATES.CLOSED || modalState === MODAL_STATES.ERROR || modalState === MODAL_STATES.ERROR_PERMANENT) {
        setModalState(MODAL_STATES.OPENING);
      }

      // Always load item data when modal opens (unless we already have the correct item loaded)
      // This ensures API is called every time modal opens
      const hasCorrectItem = item && item._id === itemId;
      if (!hasCorrectItem) {
        // Start loading after a brief delay to allow opening animation
        const delay = (modalState === MODAL_STATES.CLOSED || modalState === MODAL_STATES.ERROR || modalState === MODAL_STATES.ERROR_PERMANENT) ? 100 : 0;
        loadTimeoutId = setTimeout(() => {
          // Load item data - this will set state to LOADING
              loadItem(itemId);
        }, delay);
      }

      // Focus close button (PRD Section 10.1: Focus Management)
      focusTimeoutId = setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        }
      }, 150);
    } else if (!isOpen && modalState !== MODAL_STATES.CLOSED && modalState !== MODAL_STATES.CLOSING) {
      handleClose();
    } else if (!isOpen) {
      // Unlock body scroll when modal closes
      document.body.style.overflow = '';
    }

    // Cleanup timeouts and restore scroll
    return () => {
      if (loadTimeoutId) clearTimeout(loadTimeoutId);
      if (focusTimeoutId) clearTimeout(focusTimeoutId);
      document.body.style.overflow = '';
    };
  }, [isOpen, itemId, loadItem, handleClose, modalState, item]);

  /**
   * Setup iframe timeout (PRD Section 6.3: 5 seconds)
   */
  useEffect(() => {
    if (item?.embed_url && isValidEmbedUrl(item.embed_url) && !iframeLoaded && !iframeError) {
      iframeTimeoutRef.current = setTimeout(() => {
        handleIframeError();
      }, IFRAME_TIMEOUT_MS);

      return () => clearIframeTimeout();
    }
  }, [item?.embed_url, iframeLoaded, iframeError, isValidEmbedUrl, handleIframeError, clearIframeTimeout]);

  /**
   * Focus trap (PRD Section 10.3: Focus Trap)
   */
  useEffect(() => {
    if (modalState === MODAL_STATES.LOADED || modalState === MODAL_STATES.ERROR || modalState === MODAL_STATES.ERROR_PERMANENT) {
      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTab = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      modal.addEventListener('keydown', handleTab);
      return () => modal.removeEventListener('keydown', handleTab);
    }
  }, [modalState]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }
  
  // Render the modal - state will transition from CLOSED to OPENING in useEffect

  const sanitizedId = sanitizeId(itemId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={item ? "modal-description" : undefined}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        // Close on overlay click (PRD Section 10.2)
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      data-testid="item-details-modal-overlay"
    >
      {/* Overlay (PRD Section 6.1) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal Container (PRD Section 6.1) */}
      <div
        ref={modalRef}
        className={`
          relative bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 my-4
          max-h-[90vh] overflow-hidden flex flex-col
          ${isReducedMotion ? '' : 'transition-all duration-300'}
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-[-20px]'}
        `}
        data-testid="item-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (PRD Section 6.1) */}
        <        header
        role="banner"
        className="flex items-center justify-between p-6 border-b border-slate-200"
      >
          <h2
            id="modal-title"
            className="text-2xl font-semibold text-slate-900"
            data-testid="modal-title"
          >
            Item Details
          </h2>
          <button
            ref={closeButtonRef}
            onClick={handleClose}
            className="
              ml-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              transition-colors duration-200
            "
            aria-label="Close modal"
            data-testid="close-button"
            disabled={modalState === MODAL_STATES.CLOSING}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        {/* Modal Content (PRD Section 6.1) */}
        <main
          role="main"
          className="flex-1 overflow-y-auto p-6"
          aria-busy={modalState === MODAL_STATES.LOADING || modalState === MODAL_STATES.RETRYING}
          aria-live={modalState === MODAL_STATES.LOADING ? 'polite' : modalState === MODAL_STATES.ERROR ? 'assertive' : 'off'}
        >
          {/* Loading State (PRD Section 7.1) */}
          {(modalState === MODAL_STATES.OPENING || modalState === MODAL_STATES.LOADING || modalState === MODAL_STATES.RETRYING) && (
            <div
              className="flex flex-col items-center justify-center py-12"
              data-testid="loading-state"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
              <p className="text-gray-600">
                {modalState === MODAL_STATES.RETRYING ? 'Retrying...' : 'Loading item details...'}
              </p>
            </div>
          )}

          {/* Error State (PRD Section 8.2) */}
          {(modalState === MODAL_STATES.ERROR || modalState === MODAL_STATES.ERROR_PERMANENT) && error && (
            <div
              role="alert"
              className="flex flex-col items-center justify-center py-12"
              data-testid="error-state"
            >
              <div className="text-red-600 text-lg font-semibold mb-4">
                {error.message}
              </div>
              {error.isRecoverable && modalState !== MODAL_STATES.ERROR_PERMANENT && (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-gray-600">
                    Retry ({retryCount}/{MAX_RETRIES})
                  </p>
                  <Button
                    onClick={handleRetry}
                    disabled={retryCount >= MAX_RETRIES}
                    dataTestid="retry-button"
                  >
                    Retry
                  </Button>
                </div>
              )}
              {modalState === MODAL_STATES.ERROR_PERMANENT && (
                <p className="text-sm text-gray-600 mt-2">
                  Please close and try again.
                </p>
              )}
            </div>
          )}

          {/* Item Details (PRD Section 6.2) */}
          {modalState === MODAL_STATES.LOADED && item && (
            <article
              role="article"
              id="modal-description"
              className="space-y-6"
            >
              {/* Item Name */}
              <div>
                <h3
                  className="text-2xl font-bold text-slate-900 mb-3"
                  data-testid={`item-name-${sanitizedId}`}
                >
                  {item.name || 'Unnamed Item'}
                </h3>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Description</h4>
                <p
                  className="text-gray-600 whitespace-pre-wrap"
                  data-testid={`item-description-${sanitizedId}`}
                >
                  {item.description || 'No description available'}
                </p>
              </div>

              {/* Status and Category */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <div className="mt-1">
                    <span
                      className={`
                        inline-block px-3 py-1 rounded-full text-sm font-medium border
                        ${getStatusColor(getStatusDisplay(item))}
                      `}
                      data-testid={`item-status-${sanitizedId}`}
                    >
                      {getStatusDisplay(item)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Category</span>
                  <p
                    className="mt-1 text-gray-900"
                    data-testid={`item-category-${sanitizedId}`}
                  >
                    {item.category || 'Uncategorized'}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div>
                <span className="text-sm font-medium text-gray-500">Price</span>
                <p
                  className="mt-1 text-2xl font-bold text-gray-900"
                  data-testid={`item-price-${sanitizedId}`}
                >
                  {formatPrice(item.price)}
                </p>
              </div>

              {/* Created Date */}
              <div>
                <span className="text-sm font-medium text-gray-500">Created Date</span>
                <p
                  className="mt-1 text-gray-900"
                  data-testid={`item-created-date-${sanitizedId}`}
                >
                  {formatDate(item.createdAt || item.created_at)}
                </p>
              </div>

              {/* Tags (PRD Section 6.2: Field Validation) */}
              {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Tags</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        data-testid={`item-tag-${index}-${sanitizedId}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* File Attachment (PRD Section 6.2) */}
              {item.file_path && (
                <div>
                  <span className="text-sm font-medium text-gray-500">File Attachment</span>
                  <div className="mt-1 flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium break-words">
                        {item.file_metadata?.original_name || item.file_path.split('/').pop() || 'File'}
                      </p>
                      {item.file_metadata?.size && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Size: {(item.file_metadata.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1 break-all font-mono">
                        {item.file_path}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Embedded Content - iframe (PRD Section 6.3) */}
              {item.embed_url && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Embedded Content</h4>
                  {!isValidEmbedUrl(item.embed_url) ? (
                    <div className="py-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                      <p className="text-sm text-yellow-800">
                        Invalid embed URL format. Must be http:// or https://
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">URL: {item.embed_url}</p>
                    </div>
                  ) : (
                    <>
                      {!iframeLoaded && !iframeError && (
                        <div
                          className="flex items-center justify-center py-8 bg-gray-50 rounded-lg"
                          aria-busy="true"
                          data-testid="iframe-loading-state"
                        >
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
                          <span className="text-gray-600">Loading embedded content...</span>
                        </div>
                      )}
                      {iframeError && (
                        <div className="py-8 bg-gray-50 rounded-lg text-center">
                          <div className="text-gray-600 mb-2">Embedded content failed to load</div>
                          <div className="text-sm text-gray-500 mt-2">
                            <p className="mb-1">This may be because:</p>
                            <ul className="list-disc list-inside text-left max-w-md mx-auto space-y-1">
                              <li>The website blocks iframe embedding (X-Frame-Options)</li>
                              <li>The URL is not an embeddable format</li>
                              <li>Network or CORS restrictions</li>
                            </ul>
                            <p className="mt-3 text-xs">
                              <strong>For YouTube:</strong> Use embed URL format:<br />
                              <code className="bg-gray-200 px-2 py-1 rounded">https://www.youtube.com/embed/VIDEO_ID</code>
                            </p>
                            <p className="mt-2 text-xs">
                              <strong>Test URL:</strong> Try <code className="bg-gray-200 px-2 py-1 rounded">https://www.example.com</code>
                            </p>
                          </div>
                        </div>
                      )}
                      {!iframeError && (
                        <iframe
                          ref={iframeRef}
                          src={item.embed_url}
                          title={`Embedded content for ${item.name || 'item'}`}
                          aria-label={`Embedded content for ${item.name || 'item'}`}
                          sandbox="allow-scripts allow-same-origin allow-forms"
                          loading="lazy"
                          className="w-full h-96 border border-gray-300 rounded-lg"
                          data-testid="embedded-iframe"
                          onLoad={handleIframeLoad}
                          onError={handleIframeError}
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </article>
          )}
        </main>
      </div>
    </div>
  );
}

