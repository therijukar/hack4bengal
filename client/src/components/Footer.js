import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              SafeGuard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-Powered Violence Reporting Platform
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block">
              Home
            </Link>
            <Link component={RouterLink} to="/report" color="inherit" display="block">
              Report Incident
            </Link>
            <Link component={RouterLink} to="/dashboard" color="inherit" display="block">
              Dashboard
            </Link>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Link component={RouterLink} to="/privacy" color="inherit" display="block">
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/terms" color="inherit" display="block">
              Terms of Service
            </Link>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            <Link color="inherit" href="https://safeguard.example.com/">
              SafeGuard
            </Link>{' '}
            {currentYear}
            {'. Created for Hack4Bengal Hackathon.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 