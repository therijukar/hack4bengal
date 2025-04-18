const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Set up environment variables
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Set up rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Mock routes for development (when no DB is available)
app.get('/api/reports', (req, res) => {
  res.json({
    status: 'success',
    data: {
      reports: [
        {
          id: '1',
          incidentType: 'physical',
          description: 'Sample incident report',
          status: 'pending',
          emergencyScore: 8.5,
          createdAt: new Date().toISOString()
        }
      ],
      pagination: {
        total: 1,
        page: 1,
        pages: 1
      }
    }
  });
});

app.get('/api/agencies', (req, res) => {
  res.json({
    status: 'success',
    data: {
      agencies: [
        {
          id: '1',
          name: 'Sample Police Department',
          jurisdiction: 'Local',
          contactEmail: 'contact@samplepd.gov',
          contactPhone: '123-456-7890'
        }
      ]
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  
  // Check if email is admin
  const isAdmin = email && (email.includes('admin') || email === 'admin@example.com');
  
  res.json({
    status: 'success',
    data: {
      user: {
        id: '1',
        username: 'testuser',
        email: email || 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: isAdmin ? 'agency_admin' : 'citizen'
      },
      token: 'sample-jwt-token-for-development'
    }
  });
});

app.post('/api/reports', (req, res) => {
  res.status(201).json({
    status: 'success',
    data: {
      report: {
        id: '2',
        incidentType: req.body.incidentType || 'other',
        description: req.body.description || 'Sample description',
        isAnonymous: req.body.isAnonymous || false,
        status: 'pending',
        emergencyScore: 5.0,
        createdAt: new Date().toISOString()
      }
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, username, firstName, lastName } = req.body;
  
  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: '2',
        username: username || 'newuser',
        email: email || 'new@example.com',
        firstName: firstName || 'New',
        lastName: lastName || 'User',
        role: 'citizen'
      },
      token: 'sample-jwt-token-for-development'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running in mock mode',
    mode: NODE_ENV
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode (MOCK DATA)`);
  console.log('Database connection is NOT available - using mock data');
});

// Export for testing
module.exports = app; 