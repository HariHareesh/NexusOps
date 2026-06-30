# 🚀 NexusOps X – AI Infrastructure Command Platform

> **Version:** v1.2.0  
> **Status:** Stable Release

## Overview

NexusOps X is an AI-powered Infrastructure Command Platform that provides a centralized dashboard to monitor cloud infrastructure, visualize system health, track operational events, and deliver actionable insights. The project follows an event-driven microservices architecture and demonstrates modern cloud-native application development using AWS services.

---

# Features

## Authentication
- Secure user authentication
- JWT-based authorization
- Protected dashboard access

## Mission Control Dashboard
- Infrastructure overview
- Live operational metrics
- Quick access to platform modules

## Event Intelligence
- Monitor infrastructure events
- View recent operational activities

## Threat Sentinel
- Display security alerts
- Monitor potential threats
- Risk visibility

## Infrastructure Healer
- Infrastructure health monitoring
- Recovery recommendations
- Operational insights

## Topology Intelligence
- Infrastructure topology visualization
- Service relationship mapping

## CI/CD Intelligence
- Pipeline monitoring
- Deployment status
- Build information

## Data Nexus
- Infrastructure analytics
- Operational metrics
- Interactive dashboards

## Monitoring Dashboard
- Live Health Matrix
- Auto Refresh
- Alert Center
- Incident History
- Event Timeline
- Service Uptime
- Analytics Charts
- Monitoring Report Export

---

# Technology Stack

### Frontend

- Next.js
- React.js
- TypeScript
- CSS
- Recharts

### Backend

- Node.js
- Express.js

### Cloud

- AWS Lambda
- Amazon EventBridge
- Amazon DynamoDB
- Amazon Cognito
- Amazon CloudWatch

### Tools

- Git
- GitHub
- Visual Studio Code

---

# Architecture

```
User
   │
   ▼
Next.js Frontend
   │
   ▼
Express API Gateway
   │
   ▼
Amazon EventBridge
   │
   ├── Auth Service
   ├── Threat Sentinel
   ├── Infrastructure Healer
   ├── Topology Intelligence
   ├── CI/CD Intelligence
   ├── Data Nexus
   └── Monitoring Services
   │
   ▼
Amazon DynamoDB
```

---

# Project Structure

```
NexusOps
│
├── Frotend/
├── backend/
├── Services/
├── infrastructure/
├── docs/
└── package.json
```

---

# Getting Started

Clone the repository:

```bash
git clone https://github.com/HariHareesh/NexusOps.git
```

Install dependencies:

```bash
cd NexusOps
npm install

cd Frotend
npm install
```

Run the frontend:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Documentation

Additional documentation is available in the **docs** folder.

- ARCHITECTURE.md
- API_REFERENCE.md
- SETUP.md

---

# Screenshots

Project screenshots are available inside:

```
docs/screenshots/
```

---

# Current Version

**v1.2.0**

This release includes:

- Enterprise UI
- Monitoring Dashboard
- Incident Tracking
- Analytics Charts
- Service Uptime
- Monitoring Reports
- Responsive Design

---

# Future Improvements

- AI anomaly detection
- Predictive monitoring
- Notification integrations
- Role-based access control
- Advanced analytics

---

# Author

**Hari Harish**

B.Tech – Computer Science and Engineering

Lovely Professional University

GitHub: https://github.com/HariHareesh

---

# License

This project is intended for educational and portfolio purposes.