-- Create database
CREATE DATABASE task_scheduler;

-- Connect to the new database
\c task_scheduler

-- Create user and grant privileges
CREATE USER user WITH PASSWORD 'pass';
GRANT ALL PRIVILEGES ON DATABASE task_scheduler TO naimbiswas;
GRANT USAGE, CREATE ON SCHEMA public TO naimbiswas;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO naimbiswas;

-- psql -U naimbiswas -d formcraft -f server/src/models/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_name VARCHAR(255),
    rrule TEXT NOT NULL,
    time_zone VARCHAR(50) DEFAULT 'UTC',
    total_events BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date DATE NOT NULL,
    end_date DATE NOT NULl
);

CREATE TABLE event_overrides (
    id UUID PRIMARY KEY  DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES schedules(id),
    event_datetime TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'in-progress', 'completed')) NOT NULL,
    UNIQUE(schedule_id, event_datetime)
);

CREATE INDEX idx_overrides_schedule_datetime ON event_overrides(schedule_id, event_datetime);