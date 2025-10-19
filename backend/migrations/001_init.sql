-- Create database
CREATE DATABASE task_scheduler;

-- Connect to the new database
\c task_scheduler

-- 1. Create the user
CREATE USER naimbiswas WITH PASSWORD 'pass';

-- 2. Grant full privileges on the database
GRANT ALL PRIVILEGES ON DATABASE task_scheduler TO naimbiswas;

-- 3. Grant privileges on the public schema
GRANT USAGE, CREATE ON SCHEMA public TO naimbiswas;

-- 4. Grant privileges on all existing tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO naimbiswas;

-- 5. Grant privileges on all existing sequences in public schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO naimbiswas;

-- 6. Grant privileges on all existing functions in public schema (optional)
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO naimbiswas;

-- 7. Set default privileges for future tables, sequences, and functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO naimbiswas;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON SEQUENCES TO naimbiswas;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON FUNCTIONS TO naimbiswas;

-- psql -U naimbiswas -d formcraft -f backend/migrations/001_init.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_name VARCHAR(255),
    rrule TEXT NOT NULL,
    time_zone VARCHAR(50) DEFAULT 'UTC',
    total_events BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date DATE NOT NULL,
    end_date DATE NOT NULl,
    frequency VARCHAR(20) CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'HOURLY')) NOT NULL
);

CREATE TABLE event_overrides (
    id UUID PRIMARY KEY  DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES schedules(id),
    event_datetime TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'in-progress', 'completed')) NOT NULL,
    UNIQUE(schedule_id, event_datetime)
);

CREATE INDEX idx_overrides_schedule_datetime ON event_overrides(schedule_id, event_datetime);