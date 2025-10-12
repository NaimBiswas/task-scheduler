# Scheduler Task Monorepo

## Problem Statement

The Quality Management System (QMS) requires a scalable solution to manage task schedules with recurring events, supporting long-term (e.g., 1000 years) and high-frequency (e.g., hourly) schedules without overwhelming the database. Key requirements include:
- **Schedule Creation**: Users can create schedules with task name, start date, end date, frequency (daily, weekly, monthly, hourly), and time of day, stored as compact recurrence rules (RRULE).
- **Dynamic Event Generation**: Generate events on-demand for a given date range (e.g., a month) without storing millions of events (e.g., 8.76M events for hourly over 1000 years).
- **Status Tracking**: Track event statuses (Pending, In Progress, Completed) using an overrides table to store only changes, ensuring minimal storage.
- **Dashboard Metrics**: Display Total Events (precomputed count per schedule), Completed events, and Overdue events (past events not marked Completed).
- **Scalability**: Handle millions of schedules and efficient queries for metrics and events.
- **UI**: Modern, responsive interface with Tailwind CSS, including pages for creating schedules, viewing schedules, and a dashboard.

## Solution Approach

The QMS is built as a monorepo with a Golang backend and Next.js frontend, leveraging:
- **Backend (Golang)**:
  - **RRULE**: Use `teambition/rrule-go` to parse and generate events from iCalendar RRULE strings, computing counts (e.g., Total Events) analytically to avoid enumerating millions of events.
  - **Database**: PostgreSQL with `schedules` (task metadata, RRULE, total_events) and `event_overrides` (status changes for specific events). Indexes ensure fast queries.
  - **API**: REST endpoints (`POST /schedules`, `GET /dashboard`, `GET /schedules/:id/events`, `PATCH /schedules/:id/events`) using Gin framework for high performance.
  - **Caching**: Optional Redis for caching dashboard metrics and event lists.
- **Frontend (Next.js)**:
  - Uses App Router for pages (`/dashboard`, `/schedules`, `/create-schedule`).
  - Tailwind CSS for modern, responsive UI with glassmorphism and animations (e.g., toasters for status updates).
  - TypeScript for type-safe API calls, shared with backend via `/shared/types`.
- **Monorepo**: Managed with Turborepo for task orchestration (build, dev, test, lint), ensuring efficient development and CI/CD workflows.
- **Scalability**: Store only RRULE and overrides, compute Total Events at schedule creation, and use bounded queries (e.g., max 90-day range) to prevent performance issues.

This approach ensures the system can handle 1000-year hourly schedules (8.76M events per schedule) with minimal storage, fast queries, and a user-friendly interface.

## Folder Structure

```
/qms-monorepo
├── /backend              # Golang backend for API and business logic
│   ├── /cmd              # Entry points
│   │   ├── /api          # Main API server
│   │   │   └── main.go   # HTTP server entry point
│   ├── /internal         # Private Go modules
│   │   ├── /api          # API handlers and routes
│   │   │   ├── handlers.go
│   │   │   └── routes.go
│   │   ├── /db           # Database logic
│   │   │   ├── models.go
│   │   │   └── queries.go
│   │   ├── /rrule        # RRULE parsing and event generation
│   │   │   └── rrule.go
│   │   └── /cache        # Redis caching logic
│   │       └── redis.go
│   ├── /migrations       # Database migrations
│   │   └── 001_init.sql  # Schema for schedules, event_overrides
│   └── go.mod            # Go dependencies
├── /frontend             # Next.js frontend
│   ├── /app              # App Router
│   │   ├── /dashboard    # Dashboard page
│   │   │   └── page.tsx
│   │   ├── /schedules    # Schedules list
│   │   │   └── page.tsx
│   │   ├── /create-schedule  # Schedule creation form
│   │   │   └── page.tsx
│   │   ├── globals.css   # Tailwind CSS
│   │   └── layout.tsx    # Root layout
│   ├── /components       # Reusable React components
│   │   ├── MetricCard.tsx
│   │   ├── ScheduleForm.tsx
│   │   └── Toaster.tsx
│   ├── /lib              # Frontend utilities
│   │   ├── api.ts        # API client
│   │   └── types.ts      # Shared types
│   ├── /public           # Static assets
│   ├── package.json      # Frontend dependencies
│   └── tsconfig.json     # TypeScript config
├── /shared               # Shared code
│   ├── /types            # Shared Go/TS types
│   │   └── types.go
│   │   └── types.ts
│   └── /scripts          # Shared scripts
├── /docker               # Docker configurations
│   ├── /backend
│   │   └── Dockerfile
│   ├── /frontend
│   │   └── Dockerfile
│   └── docker-compose.yml  # Local dev stack
├── /.github              # CI/CD
│   └── workflows
│       ├── ci.yml
│       └── deploy.yml
├── .gitignore
├── README.md             # This file
├── package.json          # Root-level monorepo scripts
├── turbo.json            # Turborepo config
└── go.work               # Go workspace
```

## Setup Guide

### Prerequisites
- **Node.js**: v22 or later
- **Go**: v1.24 or later
- **Docker**: For PostgreSQL and optional Redis
- **npm**: v10.9.3 or later
- **Git**: For version control

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/NaimBiswas/task-scheduler.git
   cd scheduler-task
   ```

2. **Install Root Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Backend (Go)**:
   - Initialize Go workspace:
     ```bash
     go work init ./backend
     ```
   - Install Go dependencies:
     ```bash
     cd backend
     go mod tidy
     ```
   - Install `golangci-lint` for linting:
     ```bash
     go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
     ```

4. **Set Up Frontend (Next.js)**:
   - Install frontend dependencies:
     ```bash
     cd frontend
     npm install
     ```

5. **Set Up Database**:
   - Start PostgreSQL using Docker:
     ```bash
     docker-compose up -d
     ```
     This starts PostgreSQL (port 5432) and Redis (port 6379, optional).
   - Apply migrations:
     ```bash
     psql -h localhost -U user -d qms -f backend/migrations/001_init.sql
     ```
     Default credentials: user=`user`, password=`pass`, database=`qms`.

6. **Environment Variables**:
   - Create `.env` in `/backend`:
     ```env
     DATABASE_URL=postgres://user:pass@localhost:5432/qms?sslmode=disable
     REDIS_URL=localhost:6379
     ```
   - Create `.env.local` in `/frontend`:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:3000
     ```

## Project Start Guide

1. **Start Development Environment**:
   - Run both backend and frontend:
     ```bash
     npm run dev
     ```
     - Backend: Runs on `http://localhost:3000` (Go API).
     - Frontend: Runs on `http://localhost:3001` (Next.js).

2. **Access the Application**:
   - **Dashboard**: `http://localhost:3001/dashboard` (shows Total Events, Completed, Overdue).
   - **Schedules List**: `http://localhost:3001/schedules`.
   - **Create Schedule**: `http://localhost:3001/create-schedule`.

3. **Test the System**:
   - Create a schedule via `POST /schedules` (or use `/create-schedule` form):
     ```json
     {
       "task_name": "Hourly Audit",
       "start_date": "2025-10-12",
       "end_date": "3025-10-12",
       "frequency": "hourly",
       "interval": 1,
       "time_of_day": "00:00"
     }
     ```
   - Update event statuses via `PATCH /schedules/:id/events` (e.g., mark as Completed).
   - Verify dashboard metrics update (e.g., Total Events ≈ 8.76M for hourly over 1000 years).

4. **Run Additional Commands**:
   - Build: `npm run build`
   - Test: `npm run test`
   - Lint: `npm run lint`
   - Format: `npm run format`

## Troubleshooting
- **Database Errors**: Ensure PostgreSQL is running (`docker ps`) and credentials match `.env`.
- **API Errors**: Check `http://localhost:3000/dashboard` returns JSON `{total_events, completed, overdue}`.
- **Frontend Errors**: Open browser console (F12) and check for network errors (e.g., wrong `NEXT_PUBLIC_API_URL`).
- **Go Issues**: Run `go mod tidy` in `/backend` if dependencies fail.

## Next Steps
- **CI/CD**: Set up `.deployment/workflows/ci.yml` for automated testing and deployment.
- **Caching**: Enable Redis in `/backend/internal/cache` for faster dashboard metrics.
- **Enhancements**: Add charts (Chart.js) to `/frontend/app/dashboard`, or integrate xAI Task entries for overdue reminders.

For further assistance, contact the development team or open an issue in the repository.