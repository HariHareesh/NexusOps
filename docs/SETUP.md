# NexusOps X Setup Guide

## Prerequisites

Before running the project, make sure the following software is installed:

- Node.js (v18 or later)
- npm
- Git
- Visual Studio Code
- AWS CLI (for cloud deployment)
- Docker (optional)

---

# Clone the Repository

```bash
git clone https://github.com/HariHareesh/NexusOps.git
cd NexusOps
```

---

# Install Dependencies

Install root dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd Frotend
npm install
```

---

# Run the Frontend

```bash
npm run dev
```

The frontend will start at:

```
http://localhost:3000
```

---

# Backend

The Express API Gateway runs separately and routes requests to the appropriate AWS Lambda services.

Ensure the backend is running before accessing features that require API communication.

---

# AWS Services Used

The project integrates with:

- Amazon Cognito
- AWS Lambda
- Amazon EventBridge
- Amazon DynamoDB
- Amazon CloudWatch

Ensure your AWS credentials and required resources are configured before deploying cloud services.

---

# Folder Structure

```
NexusOps/
│
├── Frotend/
├── backend/
├── Services/
├── infrastructure/
├── docs/
└── package.json
```

---

# Development Notes

- Frontend communicates with the Express API Gateway.
- Business logic is implemented inside AWS Lambda services.
- Services communicate using Amazon EventBridge.
- DynamoDB stores application data.
- JWT authentication protects secured routes.

---

# Troubleshooting

## Frontend does not start

Run:

```bash
npm install
```

Then:

```bash
npm run dev
```

---

## Backend API not responding

- Verify the Express server is running.
- Check API endpoint configuration.
- Confirm AWS services are available if applicable.

---

# Version

Current Release: **v1.2.0**