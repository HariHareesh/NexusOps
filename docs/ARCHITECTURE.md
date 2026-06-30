# NexusOps X Architecture

## Overview

NexusOps X follows an event-driven microservices architecture designed to separate the user interface, API gateway, business logic, and cloud services. The system provides a centralized dashboard for monitoring cloud infrastructure while keeping services loosely coupled and scalable.

---

# High-Level Architecture

```
                User
                  │
                  ▼
        Next.js + React Frontend
                  │
                  ▼
         Express.js API Gateway
                  │
                  ▼
         Amazon EventBridge
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
 Auth Service  Threat      Monitoring
               Service       Service
      │           │           │
      ├───────────┼───────────┤
                  ▼
           Other Lambda Services
                  │
                  ▼
          Amazon DynamoDB
```

---

# Frontend

The frontend is built with **Next.js** and **React**.

Responsibilities:

- User authentication
- Dashboard UI
- Monitoring dashboard
- Analytics charts
- Incident history
- Report export
- Navigation
- Responsive layouts

The frontend communicates only with the Express API Gateway.

---

# API Gateway

The Express.js backend acts as the central gateway.

Responsibilities:

- Route incoming requests
- Validate requests
- Forward requests to AWS Lambda
- Return responses to the frontend

Business logic is not implemented inside the gateway.

---

# AWS Lambda Services

Each feature is implemented as an independent Lambda function.

Examples include:

- Authentication
- Event Intelligence
- Threat Sentinel
- Infrastructure Healer
- Topology Intelligence
- CI/CD Intelligence
- Data Nexus
- Monitoring

Each Lambda performs its own business logic independently.

---

# Amazon EventBridge

EventBridge enables asynchronous communication between services.

Benefits:

- Loose coupling
- Better scalability
- Event-driven workflows
- Simplified service integration

---

# Amazon DynamoDB

DynamoDB stores operational data such as:

- User information
- Infrastructure events
- Monitoring records
- Threat data
- Audit logs

---

# Authentication Flow

1. User logs in.
2. Request reaches Express Gateway.
3. Gateway invokes Authentication Lambda.
4. Authentication is validated.
5. JWT token is returned.
6. Frontend accesses protected pages.

---

# Monitoring Flow

1. Frontend requests service health.
2. Express Gateway forwards the request.
3. Monitoring Lambda checks service status.
4. Results are returned.
5. Dashboard updates automatically.

---

# Design Principles

- Event-driven architecture
- Microservices
- Scalable cloud design
- Separation of concerns
- Reusable frontend components
- Secure authentication
- Responsive UI