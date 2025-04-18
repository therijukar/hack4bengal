# SafeGuard: AI-Powered Violence Reporting Platform

SafeGuard is a comprehensive violence reporting platform that uses artificial intelligence to prioritize and respond to incidents based on urgency and severity.

![SafeGuard Logo](docs/logo.png)

## Key Features

- **Multi-channel Reporting**: Submit reports through a user-friendly web interface with support for text, geolocation, and media uploads
- **AI Emergency Scoring**: Automated analysis of reports using advanced machine learning models
- **Dynamic Priority Queue**: Real-time agency dashboard displaying incidents sorted by emergency score
- **Map Visualization**: Geographic incident mapping for better agency response coordination
- **Secure Anonymous Reporting**: End-to-end encryption and optional anonymous reporting
- **SMS Alerts**: Immediate notification system for high-priority incidents

## Technology Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js / Express.js
- **Database**: PostgreSQL
- **AI Service**: Python with TensorFlow, DistilBERT, and YOLOv8

## Architecture

The platform follows a microservices architecture with three main components:

1. **Client**: React application for user-facing interfaces
2. **Backend Server**: Express.js API server handling business logic and database operations
3. **AI Service**: Python service running machine learning models for emergency scoring

![Architecture Diagram](docs/architecture.png)

## AI Emergency Scoring

The platform uses a composite scoring system to prioritize reports:

```
Emergency Score = (text_severity × 0.4) + (media_severity × 0.5) + (user_credibility × 0.1)
```

Three models are used for analysis:
- **Spam Detection**: XGBoost classifier trained on historical report data
- **Text Analysis**: DistilBERT for violence keyword identification
- **Image Analysis**: YOLOv8 for detection of violence-related objects

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v14+) for local development
- Python 3.9+ for AI service development

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/safeguard.git
cd safeguard
```

2. Start the application with Docker Compose:
```bash
docker-compose up
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000

For more detailed instructions, see the [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md).

## Project Structure

```
safeguard/
├── client/               # React frontend
├── server/               # Node.js backend
├── ai_service/           # Python AI service
├── database/             # PostgreSQL schema and migrations
├── docs/                 # Documentation
└── docker-compose.yml    # Development environment setup
```

## Contributors

This project was developed as part of Hack4Bengal hackathon.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 