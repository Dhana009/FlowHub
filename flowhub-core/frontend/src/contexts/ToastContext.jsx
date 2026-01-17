import { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/common/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = null) => {
    const toastId = Date.now() + Math.random();
    const newToast = { id: toastId, message, type, duration };
    
    setToasts(prev => [...prev, newToast].slice(-3)); // Max 3 toasts
    
    // Auto-dismiss based on type
    const autoDuration = duration || (type === 'success' ? 3000 : type === 'error' ? 5000 : type === 'info' ? 3000 : 4000);
    if (autoDuration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
      }, autoDuration);
    }
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

