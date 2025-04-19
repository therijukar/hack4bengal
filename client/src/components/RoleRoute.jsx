import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Role-based route protection component
 * @param {Object} props
 * @param {string[]} props.allowedRoles - Array of roles allowed to access the route
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} [props.redirectTo] - Path to redirect to if not authorized (defaults to "/unauthorized")
 * @returns {JSX.Element}
 */
const RoleRoute = ({ allowedRoles, children, redirectTo = "/unauthorized" }) => {
  const auth = useContext(AuthContext);
  
  // If auth is still loading, show nothing
  if (auth.loading) {
    return null;
  }
  
  // If not authenticated at all, redirect to login
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }
  
  // Get user role from context
  const userRole = auth.currentUser?.role || '';
  
  // Check if user's role is in the allowed roles
  const hasRequiredRole = allowedRoles.includes(userRole);
  
  // If user's role is not allowed, redirect to specified path or unauthorized page
  if (!hasRequiredRole) {
    console.log(`Role check failed: User role=${userRole}, required=${allowedRoles}`);
    return <Navigate to={redirectTo} replace />;
  }
  
  // User is authenticated and has required role, render children
  return <>{children}</>;
};

export default RoleRoute; 