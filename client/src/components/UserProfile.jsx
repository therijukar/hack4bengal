import React, { useContext } from 'react';
import { Box, Paper, Typography, Button, Divider, Grid, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ComplaintForm from './ComplaintForm';
import ComplaintTracker from './ComplaintTracker';

/**
 * User profile component that shows different views based on user role
 * Regular users can only see complaint forms and trackers
 * Admin users can see additional dashboard links
 */
const UserProfile = () => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  
  if (!isAuthenticated() || !currentUser) {
    return (
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Please log in to view your profile
        </Typography>
        <Button 
          component={RouterLink} 
          to="/login" 
          variant="contained" 
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </Paper>
    );
  }
  
  const { firstName, lastName, email, role } = currentUser;
  const isRegularUser = role === 'user' || role === 'citizen';
  
  return (
    <Box>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Typography variant="body1">
                  <strong>Name:</strong> {firstName} {lastName}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {email}
                </Typography>
                <Typography variant="body1">
                  <strong>Role:</strong> {role}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Actions
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth 
                  sx={{ mb: 1 }}
                >
                  Edit Profile
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  fullWidth
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Admin section - only shown for admin roles */}
        {!isRegularUser && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" gutterBottom>
              Administrative Access
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  component={RouterLink} 
                  to="/dashboard" 
                  variant="contained" 
                  fullWidth
                  sx={{ p: 2 }}
                >
                  Dashboard
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  component={RouterLink} 
                  to="/admin/reports" 
                  variant="contained" 
                  fullWidth
                  sx={{ p: 2 }}
                >
                  Manage Reports
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button 
                  component={RouterLink} 
                  to="/admin/users" 
                  variant="contained" 
                  fullWidth
                  sx={{ p: 2 }}
                >
                  Manage Users
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
      
      {/* Complaint section - only shown for regular users */}
      {isRegularUser && (
        <Box>
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Complaint Management
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Submit a New Complaint
              </Typography>
              <ComplaintForm />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="h6" gutterBottom>
                Track Your Complaints
              </Typography>
              <ComplaintTracker />
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default UserProfile; 