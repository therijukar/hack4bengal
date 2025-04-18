const express = require('express');
const app = express();
const PORT = 8080;

// Basic middleware
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SafeGuard API is running',
    endpoints: {
      health: '/health',
      reports: '/api/reports',
      agencies: '/api/agencies',
      auth: {
        login: '/api/auth/login (POST)',
        register: '/api/auth/register (POST)'
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Development server is running',
    timestamp: new Date().toISOString()
  });
});

// Mock API endpoints
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple dev server running at http://localhost:${PORT}`);
}); 