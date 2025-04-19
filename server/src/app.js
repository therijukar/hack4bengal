const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const roleMiddleware = require('./middleware/roleMiddleware');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Set up environment variables
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'safeguard-jwt-secret-development-only';

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Mock database
const mockUsers = {
  'admin@example.com': {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: 'password', // In a real app, this would be hashed
    firstName: 'Admin',
    lastName: 'User',
    role: 'agency_admin'
  },
  'user@example.com': {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    password: 'password', // In a real app, this would be hashed
    firstName: 'Regular',
    lastName: 'User',
    role: 'citizen'
  }
};

// Middleware to make authentication optional
const optionalAuthenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, but that's okay - just continue without authentication
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find user by id (mock implementation)
      const user = Object.values(mockUsers).find(user => user.id === decoded.id);
      
      if (user) {
        // Add user to request object (excluding password)
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      } else {
        req.user = null;
      }
    } catch (error) {
      // Invalid token, but still continue
      req.user = null;
    }
    
    next();
  } catch (error) {
    // Continue without user
    req.user = null;
    next();
  }
};

// Role-based authorization
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

// Middleware
app.use(cors(corsOptions));
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

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// Mock routes for development (when no DB is available)
app.get('/api/reports', optionalAuthenticate, (req, res) => {
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
  const { email, password } = req.body;
  
  // Set explicit CORS headers for the login endpoint
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3002');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Check if user exists in mock database
  const user = mockUsers[email];
  
  if (!user || user.password !== password) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }
  
  // Generate JWT token
  const token = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: '30d',
  });
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  
  // Determine appropriate redirect path based on user role
  let redirectPath = '/';
  if (user.role === 'admin' || user.role === 'agency_admin') {
    redirectPath = '/dashboard';
  } else if (user.role === 'agency_staff') {
    redirectPath = '/reports';
  }
  
  res.json({
    status: 'success',
    data: {
      user: userWithoutPassword,
      token,
      redirectPath,
      role: user.role // Include explicit role
    }
  });
});

app.post('/api/reports', optionalAuthenticate, upload.array('media', 5), (req, res) => {
  try {
    const { incidentType, description, isAnonymous } = req.body;
    let location;
    let contactInfo;
    
    try {
      if (req.body.location) {
        location = JSON.parse(req.body.location);
      }
      
      if (!isAnonymous && req.body.contactInfo) {
        contactInfo = JSON.parse(req.body.contactInfo);
      }
    } catch (error) {
      console.error('Error parsing JSON data:', error);
    }
    
    // Get file information if any were uploaded
    const uploadedFiles = req.files || [];
    const mediaInfo = uploadedFiles.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    }));
    
    // Calculate a mock emergency score based on incident type
    const emergencyScore = 
      incidentType === 'physical' ? 8.5 :
      incidentType === 'harassment' ? 7.0 :
      incidentType === 'cyber' ? 6.0 : 5.0;
    
    // Return the created report
    res.status(201).json({
      status: 'success',
      data: {
        report: {
          id: Date.now().toString(),
          incidentType: incidentType || 'other',
          description: description || 'Sample description',
          location: location || { lat: 0, lng: 0, address: '' },
          isAnonymous: isAnonymous === 'true',
          status: 'pending',
          emergencyScore,
          mediaCount: mediaInfo.length,
          media: mediaInfo,
          contactInfo: contactInfo,
          createdAt: new Date().toISOString(),
          userId: req.user ? req.user.id : null
        }
      }
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create report'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, username, firstName, lastName, password } = req.body;
  
  // Check if email already exists
  if (mockUsers[email]) {
    return res.status(400).json({
      status: 'error',
      message: 'Email already in use'
    });
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    username: username || 'newuser',
    email: email,
    password: password,
    firstName: firstName || 'New',
    lastName: lastName || 'User',
    role: 'citizen'
  };
  
  // Add to mock database
  mockUsers[email] = newUser;
  
  // Generate JWT token
  const token = jwt.sign({ id: newUser.id }, JWT_SECRET, {
    expiresIn: '30d',
  });
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.status(201).json({
    status: 'success',
    data: {
      user: userWithoutPassword,
      token
    }
  });
});

// Protected route that requires authentication
app.get('/api/auth/me', optionalAuthenticate, (req, res) => {
  res.json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

// Protected route that requires admin role
app.get('/api/admin/dashboard', optionalAuthenticate, authorize(['agency_admin', 'admin']), (req, res) => {
  res.json({
    status: 'success',
    data: {
      message: 'Welcome to the admin dashboard',
      stats: {
        totalReports: 10,
        pendingReports: 5,
        resolvedReports: 3,
        rejectedReports: 2
      }
    }
  });
});

// Add admin-specific login route
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  // Add proper CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3002');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Check if user exists and has admin privileges
  const user = mockUsers[email];
  
  if (!user || user.password !== password) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }
  
  // Verify the user has admin role
  if (user.role !== 'admin' && user.role !== 'agency_admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Unauthorized: Admin privileges required'
    });
  }
  
  // Generate JWT token with shorter expiration for admin
  const token = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: '12h', // Shorter expiration time for admins as a security measure
  });
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  
  res.status(200).json({
    status: 'success',
    data: {
      user: userWithoutPassword,
      token: token,
      role: user.role, // Explicit role flag
      redirect: '/admin/dashboard' // Explicit redirect path
    }
  });
});

// Authenticated complaint submission route
app.post('/api/complaints/submit', optionalAuthenticate, (req, res, next) => {
  // Authentication check
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }
  
  // Continue to the next middleware
  next();
}, roleMiddleware(['user', 'citizen', 'agency_staff', 'agency_admin', 'admin']), (req, res) => {
  try {
    const { title, description, category, location } = req.body;
    
    // Create a new complaint (mock implementation)
    const newComplaint = {
      id: Date.now().toString(),
      title: title || 'Untitled Complaint',
      description: description || 'No description provided',
      category: category || 'general',
      location: location || 'Unspecified',
      status: 'submitted',
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: req.user.role,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      status: 'success',
      data: {
        complaint: newComplaint
      }
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit complaint'
    });
  }
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
  console.log('JWT_SECRET is set to:', JWT_SECRET);
});

// Export for testing
module.exports = app; 