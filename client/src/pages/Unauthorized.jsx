import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

/**
 * Unauthorized access page (403 Forbidden)
 * Displayed when a user tries to access a route they don't have permission for
 */
const Unauthorized = () => {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 8,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <LockIcon color="error" sx={{ fontSize: 72 }} />
          
          <Typography variant="h4" component="h1" gutterBottom>
            Access Denied
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600 }}>
            You don't have permission to access this page. This area is restricted to authorized users only.
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => navigate(-1)}
              color="primary"
            >
              Go Back
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Unauthorized; 