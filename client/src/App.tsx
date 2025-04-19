import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper } from '@mui/material';

// Pages
import Home from './pages/Home';
import ReportForm from './pages/ReportForm';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TestForm from './pages/TestForm';
import MyCases from './pages/MyCases';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, AuthContext } from './context/AuthContext';

// NotFound page component
const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 5, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        maxWidth: 600,
        mx: 'auto'
      }}
    >
      <Typography variant="h1" color="error" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" align="center" gutterBottom sx={{ mb: 4 }}>
        Sorry, we couldn't find the page you're looking for. It might have been removed, had
        its name changed, or is temporarily unavailable.
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate('/')}
      >
        Go to Homepage
      </Button>
    </Paper>
  );
};

// Public route that redirects authenticated users
const PublicRoute: React.FC<{ children: React.ReactNode, redirectTo: string }> = ({ 
  children, 
  redirectTo 
}) => {
  const auth = useContext(AuthContext);
  
  return auth.isAuthenticated() ? <Navigate to={redirectTo} /> : <>{children}</>;
};

// Auth routing wrapper component
const AuthRoutes: React.FC = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();
  
  // Debug auth state in routes
  useEffect(() => {
    console.log('App auth state:', { 
      isAuthenticated: auth.isAuthenticated(), 
      path: location.pathname 
    });
  }, [auth, location]);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/test-form" element={<TestForm />} />
          
          {/* Authentication routes - redirect to home if already logged in */}
          <Route path="/login" element={
            <PublicRoute redirectTo="/">
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute redirectTo="/">
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected routes - require authentication */}
          <Route path="/report" element={
            <ProtectedRoute>
              <ReportForm />
            </ProtectedRoute>
          } />
          <Route path="/my-cases" element={
            <ProtectedRoute>
              <MyCases />
            </ProtectedRoute>
          } />
          
          {/* Admin routes - require specific roles */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute roles={['admin', 'agency_admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Not found page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
      <Footer />
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthRoutes />
    </AuthProvider>
  );
};

export default App; 