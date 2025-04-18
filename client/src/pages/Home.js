import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import MapIcon from '@mui/icons-material/Map';
import ReportIcon from '@mui/icons-material/Report';
import SmsIcon from '@mui/icons-material/Sms';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://source.unsplash.com/random/?city,night)',
        }}
      >
        {/* Increase the priority of the hero background image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.6)',
          }}
        />
        <Grid container>
          <Grid item md={6}>
            <Box
              sx={{
                position: 'relative',
                p: { xs: 3, md: 6 },
                pr: { md: 0 },
              }}
            >
              <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                Report Violence Securely & Anonymously
              </Typography>
              <Typography variant="h5" color="inherit" paragraph>
                AI-powered platform to report and track incidents. Your safety matters to us.
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/report"
                sx={{ mt: 2 }}
              >
                Report Incident
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Features Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Key Features
        </Typography>
        <Typography variant="subtitle1" paragraph align="center" sx={{ mb: 6 }}>
          Our platform provides comprehensive tools for reporting and responding to incidents
        </Typography>

        <Grid container spacing={4}>
          {/* Feature 1 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <ReportIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography gutterBottom variant="h5" component="div">
                  Multi-channel Reporting
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Submit reports through an intuitive web interface with support for text, geolocation, and media uploads.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 2 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <AnalyticsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography gutterBottom variant="h5" component="div">
                  AI Emergency Scoring
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our advanced AI analyzes reports to assess urgency and priority, ensuring quick response to critical situations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 3 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <MapIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography gutterBottom variant="h5" component="div">
                  Geographic Mapping
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View incidents on interactive maps to identify patterns and coordinate response efforts effectively.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 4 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <PrivacyTipIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography gutterBottom variant="h5" component="div">
                  Anonymous Reporting
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Report incidents anonymously with end-to-end encryption to protect your identity and privacy.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 5 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography gutterBottom variant="h5" component="div">
                  Agency Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Specialized dashboards for agencies to manage and respond to reports based on priority and location.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 6 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <SmsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography gutterBottom variant="h5" component="div">
                  SMS Alerts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Receive real-time notifications and updates on your reported incidents via SMS.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            Report an Incident Now
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            Your safety matters. Report incidents anonymously and help us create safer communities.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/report"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Report Incident
          </Button>
        </Container>
      </Box>
    </>
  );
};

export default Home; 