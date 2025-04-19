import React, { useContext, useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles = [] }) => {
  // Get auth context
  const auth = useContext(AuthContext);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const validationInProgress = useRef(false);
  
  // Debug the current authentication state
  useEffect(() => {
    console.log('ProtectedRoute state:', {
      authLoading: auth.loading,
      isVerifying,
      isAuthenticated,
      hasRequiredRole,
      currentUser: auth.currentUser,
      currentUserRole: auth.currentUser?.role,
      requiredRoles: roles,
      attempts
    });
  }, [auth.loading, isVerifying, isAuthenticated, hasRequiredRole, auth.currentUser, roles, attempts]);
  
  useEffect(() => {
    // Force immediate check if user is already loaded
    if (!auth.loading && auth.currentUser) {
      console.log('User already loaded in context:', auth.currentUser);
      setIsAuthenticated(true);
      if (roles.length > 0) {
        setHasRequiredRole(roles.includes(auth.currentUser.role || ''));
      } else {
        setHasRequiredRole(true);
      }
      setIsVerifying(false);
      return;
    }
    
    // Retry mechanism for token validation
    const maxAttempts = 2; // Reduced from 3 to 2
    
    const validateAuthentication = async () => {
      // Prevent concurrent validation attempts
      if (validationInProgress.current) {
        console.log('Validation already in progress, skipping');
        return;
      }
      
      try {
        validationInProgress.current = true;
        setIsVerifying(true);
        setError(null);
        
        // Increment attempt counter
        setAttempts(prev => prev + 1);
        
        console.log('Validating authentication, attempt:', attempts + 1);
        
        // If we're not authenticated, validate token
        if (!auth.isAuthenticated()) {
          console.log('Not authenticated, validating token...');
          const user = await auth.validateToken();
          console.log('Token validation result:', user);
          
          if (user) {
            setIsAuthenticated(true);
            
            // Check role requirements if roles are specified
            if (roles.length > 0) {
              const hasRole = roles.includes(user.role || '');
              console.log(`Role check: user role=${user.role}, required=${roles}, hasRole=${hasRole}`);
              setHasRequiredRole(hasRole);
            } else {
              setHasRequiredRole(true);
            }
          } else {
            console.log('No user returned from validateToken');
            setIsAuthenticated(false);
            setHasRequiredRole(false);
          }
        } else {
          // Already authenticated, check role
          console.log('Already authenticated, checking roles');
          setIsAuthenticated(true);
          
          if (roles.length > 0 && auth.currentUser) {
            const hasRole = roles.includes(auth.currentUser.role || '');
            console.log(`Role check: user role=${auth.currentUser.role}, required=${roles}, hasRole=${hasRole}`);
            setHasRequiredRole(hasRole);
          } else {
            setHasRequiredRole(true);
          }
        }
      } catch (error) {
        console.error('Error in ProtectedRoute:', error);
        setError(error instanceof Error ? error.message : 'Authentication error');
        setIsAuthenticated(false);
        setHasRequiredRole(false);
      } finally {
        setIsVerifying(false);
        validationInProgress.current = false;
      }
    };
    
    // Run validation
    validateAuthentication();
    
    // Retry if needed and not at max attempts yet - increase delay to prevent hammering the server
    const retryTimer = setTimeout(() => {
      if (!isAuthenticated && attempts < maxAttempts && !auth.currentUser) {
        console.log(`Authentication retry ${attempts + 1}/${maxAttempts}`);
        validateAuthentication();
      }
    }, 2000); // Increased from 1000ms to 2000ms
    
    return () => clearTimeout(retryTimer);
  }, [auth, roles, attempts]);
  
  // If auth is loading or we're verifying, show loading spinner
  if (auth.loading || isVerifying) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '300px',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Verifying authentication...
        </Typography>
        {attempts > 1 && (
          <Typography variant="caption" color="text.secondary">
            Attempt {attempts}/2
          </Typography>
        )}
      </Box>
    );
  }
  
  // Show error if any
  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error">
          Authentication error: {error}
        </Alert>
      </Box>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />; // Added 'replace' to prevent history stack buildup
  }
  
  // If roles are specified and user doesn't have the required role
  if (roles.length > 0 && !hasRequiredRole) {
    console.log('User doesn\'t have required role, redirecting to home');
    // Redirect to home page or unauthorized page
    return <Navigate to="/" replace />; // Added 'replace' to prevent history stack buildup
  }
  
  // If all checks pass, render the children
  console.log('Authentication successful, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute; 