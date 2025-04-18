# Violence Reporting Platform Implementation Guide

This document provides step-by-step instructions for setting up and implementing the full-stack violence reporting platform with AI emergency scoring.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Database Setup](#database-setup)
5. [AI Service Configuration](#ai-service-configuration)
6. [Frontend Implementation](#frontend-implementation)
7. [Backend Implementation](#backend-implementation)
8. [Integration Testing](#integration-testing)
9. [Deployment](#deployment)
10. [Security Considerations](#security-considerations)

## System Architecture

The platform consists of three main components:

1. **Frontend** - React.js with Material-UI
2. **Backend** - Node.js/Express.js
3. **AI Service** - Python/TensorFlow for emergency scoring

The architecture follows a microservices approach where:
- The React frontend communicates with the Express.js backend via RESTful APIs
- The Express.js backend communicates with the PostgreSQL database and the AI service
- The AI service processes reports for emergency scoring

![Architecture Diagram](architecture.png)

## Prerequisites

- Node.js (v14+)
- Python (v3.9+)
- PostgreSQL (v13+)
- Docker and Docker Compose
- Git

## Local Development Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd violence-reporting-platform
```

2. Start the entire application using Docker Compose:

```bash
docker-compose up
```

This will start all services:
- Frontend client on port 3000
- Backend server on port 5000
- AI service on port 8000
- PostgreSQL on port 5432

## Database Setup

The PostgreSQL schema is defined in `database/init.sql` and will be automatically initialized when you run Docker Compose. The main tables are:

- `users` - User accounts for citizens and agency staff
- `agencies` - Government agencies handling reports
- `reports` - Violence incident reports
- `report_media` - Media files attached to reports
- `report_analysis` - AI analysis results for reports
- `case_activities` - Activity logs for reports
- `audit_logs` - System audit logs for security

If you need to reset the database:

```bash
docker-compose down -v
docker-compose up
```

## AI Service Configuration

The AI service integrates three machine learning models:

1. **Spam Detector (XGBoost)** - Identifies fake or irrelevant reports
2. **Text Analysis (DistilBERT)** - Analyzes the report text for violence indicators
3. **Image Analysis (YOLOv8)** - Detects violence-related objects in uploaded images

To use your own trained models:

1. Place your models in the `ai_service/models` directory
2. Update the model paths in the corresponding Python files
3. Rebuild the AI service container:

```bash
docker-compose build ai_service
docker-compose up ai_service
```

## Frontend Implementation

The frontend is structured as follows:

- `client/src/components` - Reusable UI components
- `client/src/pages` - Page-level components
- `client/src/services` - API service functions
- `client/src/contexts` - React context providers
- `client/src/hooks` - Custom React hooks

### Key Frontend Components

1. **Report Form** (`pages/ReportForm.tsx`): Multi-page form for incident reporting with:
   - Incident type selection
   - Location picking with Leaflet maps
   - Media file upload
   - Anonymous reporting option

2. **Dashboard** (`pages/Dashboard.tsx`): Agency view for managing reports with:
   - Priority queue based on emergency scores
   - Map visualization
   - Case assignment system

## Backend Implementation

The backend follows a clean architecture pattern:

- `server/src/routes` - API route definitions
- `server/src/controllers` - Request handlers
- `server/src/services` - Business logic
- `server/src/models` - Database models
- `server/src/middleware` - Express.js middleware

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get authenticated user profile

#### Reports
- `POST /api/reports` - Submit a new report
- `GET /api/reports` - Get all reports (with pagination)
- `GET /api/reports/queue` - Get priority queue of reports
- `GET /api/reports/:id` - Get a single report
- `PATCH /api/reports/:id/status` - Update report status
- `POST /api/reports/:id/assign` - Assign report to staff

#### Agencies
- `GET /api/agencies` - List all agencies
- `POST /api/agencies` - Create a new agency (admin only)
- `GET /api/agencies/:id/staff` - Get agency staff list

## Integration Testing

To ensure all components work together properly:

1. Test the report submission flow:
   - Submit a report through the frontend
   - Verify it's processed by the AI service
   - Check that it appears in the dashboard with correct emergency score

2. Test the case assignment flow:
   - Assign a report to a staff member
   - Verify the status changes
   - Check that notifications are sent

## Deployment

### Production Environment Setup

1. Configure environment variables for production in `.env.production`
2. Build production Docker images:

```bash
docker-compose -f docker-compose.prod.yml build
```

3. Deploy to your environment (AWS, Azure, etc.)

### Scaling Considerations

- Use a container orchestration service like Kubernetes for scaling
- Set up load balancing for the backend and AI services
- Consider using managed PostgreSQL for the database
- Implement caching for frequently accessed data

## Security Considerations

The platform implements several security features:

1. **JWT Authentication** - For secure agency user login
2. **End-to-End Encryption** - For sensitive report data
3. **Rate Limiting** - To prevent abuse of APIs
4. **Input Validation** - To protect against injection attacks
5. **Audit Logging** - For tracking security events

Additional security recommendations:

- Implement regular security audits
- Set up automated vulnerability scanning
- Add CAPTCHA for public report submission
- Implement IP-based rate limiting for anonymous submissions

---

## Emergency Score Calculation

The emergency score is calculated using the following formula:

```
Score = (text_severity × 0.4) + (media_severity × 0.5) + (user_credibility × 0.1)
```

Where:
- `text_severity` - Score from text analysis (0-10)
- `media_severity` - Score from image/video analysis (0-10)
- `user_credibility` - Score based on user reputation (0-5)

This formula prioritizes media evidence over text descriptions, while taking into account the reporter's credibility based on past reports. 