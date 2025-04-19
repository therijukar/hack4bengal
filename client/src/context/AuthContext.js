import React, { createContext, useState, useEffect, useCallback } from 'react';
// We can't use types directly in a .js file, but we can document them with JSDoc

/**
 * @typedef {Object} User
 * @property {string} [id]
 * @property {string} [username]
 * @property {string} [email]
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {'admin'|'agency_admin'|'agency_staff'|'citizen'} [role]
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} currentUser
 * @property {boolean} loading
 * @property {function(User, string):void} login
 * @property {function():void} logout
 * @property {function():boolean} isSuperAdmin
 * @property {function():boolean} isAuthenticated
 * @property {function():Promise<User|null>} validateToken
 */

/** @type {React.Context<AuthContextType>} */
export const AuthContext = createContext({
  currentUser: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isSuperAdmin: () => false,
  isAuthenticated: () => false,
  validateToken: () => Promise.resolve(null)
});

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastValidationTime, setLastValidationTime] = useState(0);
  
  /**
   * Validate the stored token with the server
   * @returns {Promise<User|null>}
   */
  const validateToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found in localStorage');
        return null;
      }
      
      // Add rate limiting to prevent multiple validation calls
      const now = Date.now();
      if (now - lastValidationTime < 2000) {
        console.log('Token validation throttled (tried too soon)');
        return currentUser; // Return current user to prevent unnecessary validation
      }
      
      setLastValidationTime(now);
      console.log('Validating token with server...');
      
      const response = await fetch('http://localhost:3001/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Token validation response status:', response.status);
      
      if (!response.ok) {
        console.error('Token validation failed with status:', response.status);
        if (response.status === 401) {
          // Clear auth data on 401 Unauthorized
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return null;
        }
        
        // For server errors, we'll keep the current user to prevent logout on temporary issues
        if (response.status >= 500) {
          console.warn('Server error during validation, keeping current session');
          return currentUser;
        }
        
        throw new Error('Token validation failed');
      }
      
      const data = await response.json();
      console.log('Token validation successful, user data:', data.data.user);
      return data.data.user;
    } catch (error) {
      console.error('Token validation error:', error);
      
      // Keep the current user if there's a network error to prevent logout on temporary issues
      if (error.name === 'TypeError' || error.name === 'NetworkError') {
        console.warn('Network error during validation, keeping current session');
        return currentUser;
      }
      
      // Clear stored credentials on other validation failures
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  }, [currentUser, lastValidationTime]);
  
  // Load user from storage when component mounts
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        setLoading(true);
        
        // Try to get user from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        const token = localStorage.getItem('token');
        
        console.log('Loading user from storage, token exists:', !!token);
        
        if (token && storedUser) {
          // First set the stored user to avoid loading flicker
          setCurrentUser(storedUser);
          
          // Add a small delay before validation to ensure component is mounted
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Then verify the token is still valid
          const validatedUser = await validateToken();
          
          if (validatedUser) {
            console.log('Token validated successfully, updating user');
            // Update with server-provided user data (might have updated roles, etc)
            setCurrentUser(validatedUser);
            // Update stored user with latest data
            localStorage.setItem('user', JSON.stringify(validatedUser));
          } else {
            console.log('Stored token is invalid, logging out');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
          }
        } else {
          console.log('No user in storage');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserFromStorage();
  }, [validateToken]);
  
  /**
   * Login function
   * @param {User} userData - User data
   * @param {string} token - Auth token
   */
  const login = useCallback((userData, token) => {
    console.log('Login called with:', userData);
    if (!userData || !token) {
      console.error('Invalid login data', { userData, token });
      return;
    }
    
    // Store authentication data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Update state
    setCurrentUser(userData);
    setLastValidationTime(Date.now());
    
    console.log('User logged in successfully', userData);
  }, []);
  
  /**
   * Logout function
   */
  const logout = useCallback(() => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    console.log('User logged out successfully');
  }, []);
  
  /**
   * Check if user is admin
   * @returns {boolean}
   */
  const isSuperAdmin = useCallback(() => {
    return currentUser?.role === 'admin' || currentUser?.role === 'agency_admin';
  }, [currentUser]);
  
  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  const isAuthenticated = useCallback(() => {
    return !!currentUser;
  }, [currentUser]);
  
  // Log auth state changes
  useEffect(() => {
    console.log('Auth state updated:', { 
      authenticated: !!currentUser,
      user: currentUser,
      role: currentUser?.role
    });
  }, [currentUser]);
  
  // Expose auth values
  const authContextValue = {
    currentUser,
    loading,
    login,
    logout,
    isSuperAdmin,
    isAuthenticated,
    validateToken
  };
  
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 