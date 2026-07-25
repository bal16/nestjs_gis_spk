# Building Assessment & DSS Backend (SPK GIS)

A NestJS backend service for a Decision Support System (DSS) supporting building condition assessments and maintenance prioritization using the Simple Additive Weighting (SAW) method combined with Geographic Information System (GIS) mapping capabilities.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Local Setup](#installation--local-setup)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Docker & Deployment Topology](#docker--deployment-topology)

---

## Overview

This application serves as the core backend engine for a Decision Support System (DSS / *Sistem Pendukung Keputusan*). It allows assessors and decision-makers to evaluate physical building conditions based on multiple criteria (building age, structure, architecture, MEP systems, utilities, and physical damage). 

Using the **Simple Additive Weighting (SAW)** algorithm, the backend computes preference scores and priority rankings for each building. These results are served to an interactive GIS frontend to assist in urban planning and maintenance scheduling.

---

## Key Features

- **Building Management (CRUD)**: Manage building records including geographic coordinates (latitude & longitude) and building metadata.
- **Physical Condition Assessment**: Record and manage detailed physical assessments across multiple structural and architectural criteria.
- **DSS Engine (SAW Method)**:
  - Customizable criteria weights and hierarchy configuration (benefit vs. cost criteria).
  - SAW calculation execution generating historical run logs (`saw_runs` & `saw_run_details`).
- **User Authentication**: Secure authentication with JWT access tokens, refresh tokens, and password hashing (`bcrypt`).
- **Interactive OpenAPI Documentation**: Embedded OpenAPI/Scalar documentation available in development mode.

---

## Tech Stack

- **Framework**: [NestJS v11](https://nestjs.com/) (Node.js framework)
- **Language**: TypeScript v5
- **Database**: PostgreSQL 16
- **ORM**: [Prisma v7](https://www.prisma.io/)
- **Authentication**: JWT & Passport
- **Logging**: Pino HTTP (`nestjs-pino`)
- **Validation**: `class-validator` & `class-transformer`
- **Documentation**: Scalar OpenAPI Reference (`@scalar/nestjs-api-reference`)
- **Package Manager**: `pnpm` / `bun`

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your environment:

- **Node.js**: v22.x or higher
- **pnpm**: v10.x or higher (or `npm` / `bun`)
- **PostgreSQL**: v16 or Docker for running a local container

### Installation & Local Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/bal16/nestjs_gis_spk.git
   cd be
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**  
   Copy the example environment file and update database credentials:
   ```bash
   cp .env.example .env
   ```

4. **Start PostgreSQL Database**  
   Using Docker Compose for local database setup:
   ```bash
   docker compose up -d
   ```

5. **Run Database Migrations & Generate Prisma Client**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

6. **Seed Initial Database Data**  
   Seed initial building data, assessment records, default SAW weight configurations, and admin accounts:
   ```bash
   pnpm db:seed
   # Or using Prisma CLI:
   # pnpm prisma db seed
   ```

7. **Start Development Server**
   ```bash
   pnpm start:dev
   ```
   The backend API will be available at `http://localhost:3001`.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm start:dev` | Starts the application in watch mode (auto-reload on code change) |
| `pnpm build` | Compiles TypeScript code into production JavaScript build in `dist/` |
| `pnpm start:prod` | Runs the compiled production build from `dist/main` |
| `pnpm test` | Runs Jest unit test suites |
| `pnpm test:e2e` | Runs End-to-End (E2E) integration test suites |
| `pnpm test:cov` | Generates unit test coverage reports |
| `pnpm db:generate` | Generates Prisma Client artifacts (`src/generated/prisma`) |
| `pnpm db:migrate` | Runs database migrations in development mode |
| `pnpm db:seed` | Seeds database with initial data |
| `pnpm db:studio` | Launches Prisma Studio GUI for database inspection |

---

## Project Structure

```
be/
├── docs/                      # OpenAPI specifications & API Reference
│   ├── API Reference.md       # Human-readable API documentation
│   ├── OpenApi.json           # OpenAPI JSON spec
│   └── OpenApi.yaml           # OpenAPI YAML spec
├── prisma/                    # Database schema, migrations, and seeds
│   ├── migrations/            # Prisma SQL migration history
│   ├── seeds/                 # Data seeding scripts
│   └── schema.prisma          # Database models definition
├── src/
│   ├── auth/                  # Authentication module (JWT, login, register, guards)
│   ├── building/              # Building & Assessment management module
│   ├── common/                # Shared utilities, env loaders, filters & responses
│   ├── dss/                   # SAW Decision Support System calculation engine
│   ├── generated/             # Auto-generated Prisma client
│   ├── infra/                 # Infrastructure adapters (Prisma Database Service)
│   ├── user/                  # User account management module
│   ├── app.module.ts          # Root NestJS application module
│   └── main.ts                # Application entry point & Scalar API setup
├── test/                      # E2E test suites & test configuration
├── .env.example               # Template environment variables
├── Dockerfile                 # Multi-stage production Docker build
├── docker-compose.yml         # Local PostgreSQL container configuration
├── package.json               # Dependencies and scripts registry
└── README.md                  # Project documentation
```

---

## API Documentation

- **Interactive API Documentation**: Available in development mode at `http://localhost:3001/api/docs` powered by Scalar OpenAPI.
- **Static API Reference**: Detailed endpoint reference with request/response schemas is available in [docs/API Reference.md](docs/API%20Reference.md).

---

## Testing

- **Run Unit Tests**:
  ```bash
  pnpm test
  ```
- **Run E2E Tests**:
  ```bash
  pnpm test:e2e
  ```
- **Generate Coverage Report**:
  ```bash
  pnpm test:cov
  ```
  Test reports are saved in `test/results/e2e.test_report.md` and `coverage/unit/`.

---

## Docker & Deployment Topology

### Local Development Database
For standalone backend development, run the local database container:
```bash
docker compose up -d
```
*(Uses `be/docker-compose.yml` to spin up a standalone PostgreSQL 16 container on port `5432`)*.

### Full-Stack Production Deployment (BE + FE + DB)
For full-stack deployment (Backend + Next.js Frontend + PostgreSQL), a root-level Docker Compose configuration is available at the parent directory (`../docker-compose.yml`):

```
spk-gis (root workspace)
├── be/                    # Backend (NestJS containerized via Node 22)
├── fe/                    # Frontend (Next.js containerized via Bun 1.3)
└── docker-compose.yml     # Workspace Compose (PostgreSQL + Backend + Frontend)
```

To run the complete full-stack application stack:
```bash
cd ..
docker compose up --build -d
```
This orchestrates:
1. `postgres` (Port 5432)
2. `backend` (Port 3001, depends on `postgres`)
3. `frontend` (Port 3000, depends on `backend`)
