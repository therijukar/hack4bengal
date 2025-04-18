import React, { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';

// Login validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const auth = useContext(AuthContext);
  
  // Check if already logged in
  useEffect(() => {
    if (auth.isAuthenticated() && !loginSuccess) {
      // Already logged in, redirect
      const isAdmin = auth.isSuperAdmin();
      navigate(isAdmin ? '/dashboard' : '/');
    }
  }, [auth, navigate, loginSuccess]);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    
    try {
      console.log('Attempting login with:', values.email);
      
      // Make a real API call to the server
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      
      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Use AuthContext login function to store user data
      auth.login(data.data.user, data.data.token);
      setLoginSuccess(true);
      
      // Wait a moment before redirecting to ensure state updates
      setTimeout(() => {
        // Redirect to dashboard for admins, or home for regular users
        if (data.data.user.role === 'agency_admin' || data.data.user.role === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }, 100);
    } catch (err) {
      console.error('Login error details:', err);
      setError(err.message || 'Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign In
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {loginSuccess && (
            <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
              Login successful! Redirecting...
            </Alert>
          )}
          
          <Box sx={{ mt: 1, width: '100%' }}>
            <Formik
              initialValues={{
                email: '',
                password: '',
                rememberMe: false,
              }}
              validationSchema={LoginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form>
                  <Field
                    as={TextField}
                    margin="normal"
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  <Field
                    as={TextField}
                    margin="normal"
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                  <Field
                    as={FormControlLabel}
                    control={<Checkbox value="remember" color="primary" />}
                    label="Remember me"
                    name="rememberMe"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={isSubmitting || loginSuccess}
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <Grid container>
                    <Grid item xs>
                      <Link component={RouterLink} to="/forgot-password" variant="body2">
                        Forgot password?
                      </Link>
                    </Grid>
                    <Grid item>
                      <Link component={RouterLink} to="/register" variant="body2">
                        {"Don't have an account? Sign Up"}
                      </Link>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </Box>
        </Box>
        
        <Box sx={{ mt: 3, borderTop: '1px solid #eee', pt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            To use demo accounts:
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" display="block">
              Admin: admin@example.com / password
            </Typography>
            <Typography variant="caption" display="block">
              User: user@example.com / password
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 