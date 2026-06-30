# NexusOps X API Reference

## Overview

This document describes the REST API endpoints used by the NexusOps X frontend to communicate with the Express API Gateway. The gateway forwards requests to the appropriate AWS Lambda services.

---

# Base URL

```
http://localhost:5000
```

---

# Authentication

## Health Check

| Method | Endpoint |
|---------|----------|
| GET | /api/auth/health |

Purpose

Returns the health status of the Authentication service.

---

# Dashboard

## Health Check

| Method | Endpoint |
|---------|----------|
| GET | /health |

Purpose

Returns the health status of the API Gateway.

---

# Event Intelligence

| Method | Endpoint |
|---------|----------|
| GET | /api/events/health |

Purpose

Checks the availability of the Event Intelligence service.

---

# Threat Sentinel

| Method | Endpoint |
|---------|----------|
| GET | /api/threats/health |

Purpose

Checks the health of the Threat Sentinel service.

---

# Infrastructure Healer

| Method | Endpoint |
|---------|----------|
| GET | /api/healer/health |

Purpose

Checks the health of the Infrastructure Healer service.

---

# Topology Intelligence

| Method | Endpoint |
|---------|----------|
| GET | /api/topology/health |

Purpose

Checks the availability of the Topology service.

---

# CI/CD Intelligence

| Method | Endpoint |
|---------|----------|
| GET | /api/cicd/health |

Purpose

Returns the current status of the CI/CD Intelligence service.

---

# Data Nexus

| Method | Endpoint |
|---------|----------|
| GET | /api/datanexus/health |

Purpose

Returns the health status of the Data Nexus service.

---

# Response Format

Successful response

```json
{
  "status": "healthy"
}
```

Error response

```json
{
  "status": "offline"
}
```

---

# Notes

- All requests are routed through the Express API Gateway.
- Business logic is implemented inside AWS Lambda services.
- Communication between services follows an event-driven architecture using Amazon EventBridge.
- JWT authentication is used for protected routes.