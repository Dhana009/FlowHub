import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import api, { setTokenFunctions } from '../services/api';

/**
 * Auth Context
 * 
 * Global state management for authentication.
 * JWT token stored in memory (React state) - NOT localStorage (per PRD).
 * Refresh token stored in httpOnly cookie (handled by backend).
 * On page refresh, system calls /auth/refresh to get new JWT using refresh token cookie.
 */

const AuthContext = createContext(null);

// Role Hierarchy
const ROLE_LEVELS = {
  'ADMIN': 3,
  'EDITOR': 2,
  'VIEWER': 1
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Clear authentication state
   * Sets all auth data to null
   * NOTE: Do NOT set isInitialized here - let the caller decide when initialization is complete
   * This prevents circular dependencies
   */
  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    // DO NOT set isInitialized here - initialization state is managed separately
  }, []);

  /**
   * Refresh token function for API interceptor
   * Tries to refresh using httpOnly cookie
   */
  const refreshToken = useCallback(async () => {
    try {
      // Call refresh endpoint (refresh token sent automatically via httpOnly cookie)
      const response = await api.post('/auth/refresh');
      
      if (response.data?.token) {
        const newToken = response.data.token;
        const newUser = response.data.user;
        
        // Store in memory only (React state)
        setToken(newToken);
        setUser(newUser);
        
        return newToken;
      }
      
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear auth state on refresh failure
      clearAuth();
      return null;
    }
  }, [clearAuth]);

  /**
   * Get access token (for API interceptor)
   */
  const getAccessToken = useCallback(() => {
    return token;
  }, [token]);

  /**
   * Set access token (for API interceptor)
   */
  const setAccessToken = useCallback((newToken) => {
    setToken(newToken);
    if (!newToken) {
      clearAuth();
    }
  }, [clearAuth]);

  // Setup API interceptor functions
  useEffect(() => {
    setTokenFunctions(getAccessToken, setAccessToken, refreshToken, clearAuth);
  }, [getAccessToken, setAccessToken, refreshToken, clearAuth]);

  /**
   * Initialize auth state on mount
   * Try to restore session using refresh token cookie
   * This runs ONCE when component mounts
   */
  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 Starting auth initialization...');
        
        // Try to get new JWT using refresh token cookie
        const newToken = await refreshToken();
        
        if (!isMounted) {
          console.log('⚠️ Component unmounted, skipping state update');
          return;
        }
        
        // Token refresh succeeded - token and user already set by refreshToken()
        // Mark as initialized
        if (newToken) {
          console.log('✅ Auth initialization: Token restored');
          setIsInitialized(true);
        } else {
          // No valid refresh token - clear auth state
          // IMPORTANT: Must set isInitialized = true even if token is invalid
          // Otherwise we get stuck in endless loader
          console.log('⚠️ Auth initialization: No valid token, redirecting to login');
          setToken(null);
          setUser(null);
          setIsInitialized(true);
        }
      } catch (error) {
        if (!isMounted) {
          console.log('⚠️ Component unmounted during error handling');
          return;
        }
        console.error('❌ Auth initialization failed:', error);
        // Clear auth state AND mark initialization as complete
        // This prevents endless loader
        setToken(null);
        setUser(null);
        setIsInitialized(true);
      }
    };

    // Start initialization
    initializeAuth();
    
    // Safety timeout: if initialization takes too long, mark as initialized anyway
    timeoutId = setTimeout(() => {
      if (isMounted && !isInitialized) {
        console.warn('⏱️ Auth initialization timeout - forcing completion');
        setIsInitialized(true);
      }
    }, 5000); // 5 second timeout
    
    // Cleanup: mark as unmounted if component unmounts
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Only run once on mount

  /**
   * Login user
   */
  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      const response = await authService.login(email, password, rememberMe);
      
      // Store JWT token in memory only (React state)
      setToken(response.token);
      setUser(response.user);
      setIsInitialized(true);
      
      // Refresh token is automatically stored in httpOnly cookie by backend
      
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear refresh token cookie
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear state regardless of API call success
      clearAuth();
    }
  }, [clearAuth]);

  /**
   * RBAC Helper: Check if user has required role level
   */
  const hasRole = useCallback((requiredRole) => {
    if (!user || !user.role) return false;
    return ROLE_LEVELS[user.role] >= ROLE_LEVELS[requiredRole];
  }, [user]);

  /**
   * RBAC Helper: Check if user can perform action on resource
   * 
   * @param {string} action - 'create', 'edit', 'delete', 'view'
   * @param {object} resource - The item or object to check ownership for
   */
  const canPerform = useCallback((action, resource = null) => {
    if (!user || !user.role) return false;

    // ADMIN can do everything
    if (user.role === 'ADMIN') return true;

    switch (action) {
      case 'create':
        return user.role === 'EDITOR';
      
      case 'edit':
      case 'delete':
      case 'activate':
      case 'deactivate':
        // EDITOR can edit/delete if they own the resource
        if (user.role === 'EDITOR') {
          if (!resource) return true; // Permission to see the button generally
          const ownerId = resource.created_by || resource.userId;
          return ownerId === user.id || ownerId === user._id;
        }
        return false;

      case 'bulk':
        return user.role === 'EDITOR' || user.role === 'ADMIN';

      case 'view':
        return true; // All authenticated users can view

      default:
        return false;
    }
  }, [user]);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    isInitialized,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    hasRole,
    canPerform
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
