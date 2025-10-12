package db

import (
	"context"
	"database/sql"
	"time"
)

type Queries struct {
	DB *sql.DB
}

func NewQueries(db *sql.DB) *Queries {
	return &Queries{DB: db}
}

func (q *Queries) GetTotalEvents(ctx context.Context) (int64, error) {
	var totalEvents int64
	err := q.DB.QueryRowContext(ctx, "SELECT SUM(total_events) FROM schedules").Scan(&totalEvents)
	return totalEvents, err
}

func (q *Queries) GetCompletedCount(ctx context.Context) (int64, error) {
	var completed int64
	err := q.DB.QueryRowContext(ctx, "SELECT COUNT(*) FROM event_overrides WHERE status = 'completed'").Scan(&completed)
	return completed, err
}

func (q *Queries) GetOverdueCount(ctx context.Context, now time.Time) (int64, error) {
	var overdue int64
	err := q.DB.QueryRowContext(
		ctx,
		"SELECT COUNT(*) FROM event_overrides WHERE event_datetime < $1 AND status IN ('pending', 'in-progress')",
		now,
	).Scan(&overdue)
	return overdue, err
}

func (q *Queries) GetSchedulesRRULEs(ctx context.Context) ([]string, error) {
	rows, err := q.DB.QueryContext(ctx, "SELECT rrule FROM schedules")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rrules []string
	for rows.Next() {
		var rrule string
		if err := rows.Scan(&rrule); err != nil {
			continue
		}
		rrules = append(rrules, rrule)
	}
	return rrules, nil
}

func (q *Queries) CreateSchedule(ctx context.Context, id, taskName, rrule string, totalEvents int64) error {
	_, err := q.DB.ExecContext(
		ctx,
		"INSERT INTO schedules (id, task_name, rrule, total_events) VALUES ($1, $2, $3, $4)",
		id, taskName, rrule, totalEvents,
	)
	return err
}

func (q *Queries) UpdateEventStatus(ctx context.Context, id, scheduleID string, eventDatetime time.Time, status string) error {
	_, err := q.DB.ExecContext(
		ctx,
		"INSERT INTO event_overrides (id, schedule_id, event_datetime, status) VALUES ($1, $2, $3, $4) ON CONFLICT (schedule_id, event_datetime) DO UPDATE SET status = $4",
		id, scheduleID, eventDatetime, status,
	)
	return err
}