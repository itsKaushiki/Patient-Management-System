# Patient Management System

A comprehensive microservices-based patient management system built with Spring Boot and Next.js, featuring role-based access control, real-time audit logging, and modern UI with dark mode support.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Default Credentials](#default-credentials)

---

## 🎯 Overview

This Patient Management System is a production-ready microservices application designed for healthcare facilities. It provides comprehensive patient record management, billing integration, real-time activity tracking, and role-based access control for different user types (Admin, Doctor, Receptionist).

---

## ✨ Features

### Backend Features
- **Microservices Architecture**: 5 independent services (Auth, Patient, Billing, Analytics, API Gateway)
- **Role-Based Access Control (RBAC)**: Three roles with granular permissions
  - **ADMIN**: Full system access, user management
  - **DOCTOR**: View and update patients
  - **RECEPTIONIST**: View and create patients
- **JWT Authentication**: Secure token-based authentication with role validation
- **Event-Driven Architecture**: Kafka-based event streaming for patient operations
- **Persistent Audit Logging**: PostgreSQL-backed audit trail for all patient activities
- **gRPC Communication**: High-performance inter-service communication
- **API Gateway**: Centralized routing with JWT validation
- **Protocol Buffers**: Efficient message serialization

### Frontend Features
- **Modern Next.js 15 UI**: Server-side rendering with App Router
- **Dark Mode**: System preference detection with localStorage persistence
- **Real-Time Activity Timeline**: Auto-refreshing audit log (5s interval)
- **User Management**: Admin-only interface for role assignment
- **Responsive Design**: Mobile-friendly CSS modules
- **Type-Safe Development**: Full TypeScript support

### Patient Management
- Complete CRUD operations for patient records
- Optional medical fields (Gender, Blood Group)
- Patient search and filtering
- Detailed patient profiles
- Activity history per patient

---

## 🛠 Tech Stack

### Backend
- **Java 21** with **Spring Boot 3.4.1**
- **PostgreSQL 15** (3 databases)
- **Apache Kafka** with Zookeeper
- **Protocol Buffers** (protobuf)
- **gRPC** for synchronous communication
- **Spring Cloud Gateway**
- **Spring Security** with JWT
- **Hibernate JPA**
- **Maven** (wrapper included)

### Frontend
- **Next.js 15** with App Router
- **TypeScript**
- **React 18**
- **Axios** for HTTP requests
- **CSS Modules** for styling

### Infrastructure
- **Docker Compose** for orchestration
- **Colima** (Docker runtime for macOS)

---

## 📁 Project Structure

```
java-spring-microservices/
├── api-gateway/                    # Spring Cloud Gateway (Port 4004)
│   ├── src/main/java/com/pm/apigateway/
│   │   ├── filter/                 # JWT validation filter
│   │   └── dto/                    # Data transfer objects
│   └── src/main/resources/
│       ├── application.yml         # Gateway routing configuration
│       └── application-local.yml   # Local profile settings
│
├── auth-service/                   # Authentication Service (Port 4001)
│   ├── src/main/java/com/pm/authservice/
│   │   ├── controller/             # REST endpoints (login, register, validate)
│   │   ├── service/                # Business logic (AuthService, UserService)
│   │   ├── model/                  # User entity, Role enum
│   │   ├── dto/                    # Request/Response DTOs
│   │   ├── repository/             # JPA repositories
│   │   └── util/                   # JWT utility
│   └── src/main/resources/
│       └── application-local.properties
│
├── patient-service/                # Patient Management (Port 4000)
│   ├── src/main/java/com/pm/patientservice/
│   │   ├── controller/             # Patient CRUD endpoints
│   │   ├── service/                # Business logic
│   │   ├── model/                  # Patient entity
│   │   ├── dto/                    # Request/Response DTOs
│   │   ├── repository/             # JPA repositories
│   │   ├── kafka/                  # Kafka producer
│   │   ├── grpc/                   # gRPC client (billing)
│   │   ├── mapper/                 # Entity-DTO mappers
│   │   └── exception/              # Custom exceptions
│   └── src/main/resources/
│       └── application-local.properties
│
├── billing-service/                # Billing Management (Port 4003, gRPC 9090)
│   ├── src/main/java/com/pm/billingservice/
│   │   ├── grpc/                   # gRPC server implementation
│   │   └── service/                # Billing logic
│   └── src/main/resources/
│       └── application-local.properties
│
├── analytics-service/              # Audit Logging (Port 4002)
│   ├── src/main/java/com/pm/analyticsservice/
│   │   ├── controller/             # Audit API endpoints
│   │   ├── kafka/                  # Kafka consumer
│   │   ├── model/                  # AuditEvent entity
│   │   ├── dto/                    # AuditEventDTO
│   │   └── repository/             # JPA repository
│   └── src/main/resources/
│       └── application-local.properties
│
├── frontend/                       # Next.js Frontend (Port 3001)
│   ├── app/
│   │   ├── dashboard/              # Dashboard page
│   │   ├── patients/               # Patient CRUD pages
│   │   │   ├── [id]/               # Patient details & edit
│   │   │   └── new/                # Create patient
│   │   ├── activity/               # Activity timeline
│   │   ├── admin/users/            # User management (ADMIN only)
│   │   ├── login/                  # Login page
│   │   └── register/               # Registration page
│   ├── components/
│   │   ├── ThemeToggle.tsx         # Dark mode toggle
│   │   ├── UserProfile.tsx         # User info display
│   │   └── DeleteModal.tsx         # Confirmation modal
│   ├── lib/
│   │   ├── axios.ts                # Axios client configuration
│   │   ├── auth.ts                 # Auth utilities
│   │   ├── activity.ts             # Activity API calls
│   │   └── theme.ts                # Theme management
│   └── styles/
│       └── globals.css             # Global styles & CSS variables
│
├── proto/                          # Protocol Buffer definitions
│   └── patient.proto               # Patient event schema
│
├── docker-compose.yml              # Infrastructure orchestration
├── start                           # Service startup script
├── stop                            # Service shutdown script
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Java 21** or higher
- **Node.js 18+** and npm
- **Docker** and Docker Compose (or Colima for macOS)
- **Maven** (wrapper included)

### 1. Clone the Repository
```bash
git clone https://github.com/itsKaushiki/Patient-Management-System.git
cd Patient-Management-System
```

### 2. Start Infrastructure (Databases + Kafka)
```bash
docker-compose up -d
```

This starts:
- PostgreSQL (auth-service-db) on port **5432**
- PostgreSQL (patient-service-db) on port **5433**
- PostgreSQL (analytics-service-db) on port **5434**
- Kafka on port **9092**
- Zookeeper on port **2181**

### 3. Start Backend Services
```bash
./start
```

This starts all 5 microservices:
- **auth-service**: http://localhost:4001
- **patient-service**: http://localhost:4000
- **billing-service**: http://localhost:4003 (gRPC: 9090)
- **analytics-service**: http://localhost:4002
- **api-gateway**: http://localhost:4004

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3001

### 5. Access the Application
Open http://localhost:3001/login

---

## 🏗 Architecture

### Communication Patterns

```
┌─────────────┐
│   Frontend  │ (Next.js - Port 3001)
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────┐
│   API Gateway   │ (Port 4004)
└────────┬────────┘
         │ JWT Validation & Routing
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
   │   Auth   │  │ Patient  │  │Analytics │  │ Billing  │
   │ Service  │  │ Service  │  │ Service  │  │ Service  │
   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
        │             │              │             │
        ▼             ▼              ▼             ▼
   ┌─────────┐  ┌─────────┐    ┌─────────┐       │
   │Auth DB  │  │Patient  │    │Analytics│       │
   │(5432)   │  │DB(5433) │    │DB(5434) │       │
   └─────────┘  └────┬────┘    └────┬────┘       │
                     │              │             │
                     │ Kafka Events │             │
                     └──────┬───────┘             │
                            ▼                     │
                      ┌──────────┐                │
                      │  Kafka   │                │
                      │  (9092)  │                │
                      └──────────┘                │
                                                  │
                     gRPC (Port 9090) ────────────┘
```

### Event Flow
1. **Patient Created/Updated/Deleted** → Patient Service sends Kafka event
2. **Kafka Consumer** → Analytics Service receives event
3. **Database Persistence** → Event stored in analytics_db
4. **Frontend Polling** → Dashboard fetches recent activities (5s interval)

---

## 📚 API Documentation

### Authentication Endpoints (via API Gateway)
```
POST   /auth/login              # Login
POST   /auth/register           # Register new user
POST   /auth/validate           # Validate JWT token
GET    /auth/users              # Get all users (ADMIN only)
PUT    /auth/users/{id}/role    # Update user role (ADMIN only)
```

### Patient Endpoints (via API Gateway)
```
GET    /api/patients            # Get all patients
POST   /api/patients            # Create patient (ADMIN, RECEPTIONIST)
GET    /api/patients/{id}       # Get patient by ID
PUT    /api/patients/{id}       # Update patient (ADMIN, DOCTOR)
DELETE /api/patients/{id}       # Delete patient (ADMIN only)
```

### Analytics Endpoints (via API Gateway)
```
GET    /analytics/audit/recent?limit=10        # Get recent activities
GET    /analytics/audit/patient/{patientId}    # Get patient history
```

---

## 🔑 Default Credentials

**Email**: `testuser@test.com`
**Password**: `password123`
**Role**: `ADMIN`

---

## 🎨 Features in Detail

### Role-Based Permissions

| Feature | ADMIN | DOCTOR | RECEPTIONIST |
|---------|-------|--------|--------------|
| View Patients | ✅ | ✅ | ✅ |
| Create Patients | ✅ | ❌ | ✅ |
| Update Patients | ✅ | ✅ | ❌ |
| Delete Patients | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| View Activity | ✅ | ✅ | ✅ |

### Audit Events
- **PATIENT_CREATED**: New patient registration
- **PATIENT_UPDATED**: Patient information modified
- **PATIENT_DELETED**: Patient record removed

All events include:
- Patient ID, Name, Email
- Event Type
- Timestamp
- Source Service

---

## 🛑 Stopping Services

### Stop Backend Services
```bash
./stop
```

### Stop Infrastructure
```bash
docker-compose down
```

### Stop Frontend
Press `Ctrl+C` in the terminal running `npm run dev`

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "feat: description"`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Create a Pull Request

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

## 📝 License

MIT License - feel free to use this project for learning and development purposes.

---

**Built with ❤️ using Spring Boot & Next.js**