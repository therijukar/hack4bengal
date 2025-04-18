import React, { useEffect, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, Container } from '@mui/material';

// Pages
import Home from './pages/Home';
import ReportForm from './pages/ReportForm';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TestForm from './pages/TestForm';
import MyCases from './pages/MyCases';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Auth routing wrapper component
const AuthRoutes: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle auth state changes for routing
  useEffect(() => {
    // If on dashboard but not admin, redirect
    if (location.pathname === '/dashboard' && !auth.isSuperAdmin() && !auth.loading) {
      navigate('/');
    }
    
    // If on protected route but not logged in
    if ((location.pathname === '/report' || location.pathname === '/my-cases') && 
        !auth.isAuthenticated() && !auth.loading) {
      navigate('/login');
    }
  }, [auth, navigate, location.pathname]);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={
            <ProtectedRoute>
              <ReportForm />
            </ProtectedRoute>
          } />
          <Route path="/test-form" element={<TestForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-cases" element={
            <ProtectedRoute>
              <MyCases />
            </ProtectedRoute>
          } />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute roles={['admin', 'agency_admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
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