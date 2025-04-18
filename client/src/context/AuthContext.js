import React, { createContext, useState, useEffect, useCallback } from 'react';
// We can't use types directly in a .js file, but we can document them with JSDoc

/**
 * @typedef {Object} User
 * @property {string} [id]
 * @property {string} [username]
 * @property {string} [email]
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {'admin'|'citizen'} [role]
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} currentUser
 * @property {boolean} loading
 * @property {function(User, string):void} login
 * @property {function():void} logout
 * @property {function():boolean} isSuperAdmin
 * @property {function():boolean} isAuthenticated
 */

/** @type {React.Context<AuthContextType>} */
export const AuthContext = createContext({
  currentUser: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isSuperAdmin: () => false,
  isAuthenticated: () => false
});

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load user from storage when component mounts
  useEffect(() => {
    loadUserFromStorage();
  }, []);
  
  /**
   * Load user info from localStorage
   */
  const loadUserFromStorage = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (token && user) {
        console.log('Loaded user from storage:', user);
        setCurrentUser(user);
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
  }, []);
  
  /**
   * Login function
   * @param {User} userData - User data
   * @param {string} token - Auth token
   */
  const login = useCallback((userData, token) => {
    console.log('Login called with:', userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentUser(userData);
  }, []);
  
  /**
   * Logout function
   */
  const logout = useCallback(() => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
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
      user: currentUser
    });
  }, [currentUser]);
  
  const authContextValue = {
    currentUser,
    loading,
    login,
    logout,
    isSuperAdmin,
    isAuthenticated
  };
  
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 