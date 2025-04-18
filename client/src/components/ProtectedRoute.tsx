import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles = [] }) => {
  // Get auth context
  const auth = useContext(AuthContext);
  
  // If auth is loading, show nothing yet
  if (auth.loading) {
    return null;
  }
  
  // If user is not authenticated, redirect to login
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  // If roles are specified and user doesn't have the required role
  if (roles.length > 0 && auth.currentUser && !roles.includes(auth.currentUser.role || '')) {
    // Redirect to home page or unauthorized page
    return <Navigate to="/" />;
  }
  
  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute; 