import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import api, { setTokenFunctions } from '../services/api';

/**
 * Auth Context
 * 
 * Global state management for authentication.
 * Token stored in memory (React state), NOT localStorage.
 * Refresh token stored in httpOnly cookie (automatically sent).
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Refresh token function for API interceptor
   * Tries to refresh using httpOnly cookie
   */
  const refreshToken = useCallback(async () => {
    try {
      // Note: Refresh token endpoint would be called here
      // For now, we'll implement a simple refresh mechanism
      // The refresh token is automatically sent via httpOnly cookie
      
      // TODO: Implement refresh endpoint call when backend supports it
      // For now, return null to trigger login redirect
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }, []);

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
  }, []);

  // Setup API interceptor functions
  useEffect(() => {
    setTokenFunctions(getAccessToken, setAccessToken, refreshToken);
  }, [getAccessToken, setAccessToken, refreshToken]);

  /**
   * Initialize auth state on mount
   * Try to refresh token using httpOnly cookie
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Try to refresh token using httpOnly cookie
      // For now, we'll start with null state
      // When refresh endpoint is implemented, call it here
      
      // TODO: Call refresh endpoint when backend supports it
      // const response = await api.post('/auth/refresh');
      // if (response.data.token) {
      //   setToken(response.data.token);
      //   setUser(response.data.user);
      // }
      
      setIsLoading(false);
      setIsInitialized(true);
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  /**
   * Login user
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Whether to remember user
   */
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await authService.login(email, password, rememberMe);
      
      // Store token in memory (React state)
      setToken(response.token);
      setUser(response.user);
      
      // Refresh token is automatically stored in httpOnly cookie by backend
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Call logout endpoint to clear refresh token cookie
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API call success
      setToken(null);
      setUser(null);
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    isLoading,
    isInitialized,
    isAuthenticated,
    login,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

