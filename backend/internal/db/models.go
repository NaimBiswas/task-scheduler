package db

import "time"

type Schedule struct {
	ID          string    `json:"id"`
	TaskName    string    `json:"task_name"`
	RRULE       string    `json:"rrule"`
	TotalEvents int64     `json:"total_events"`
	CreatedAt   time.Time `json:"created_at"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
}

type EventOverride struct {
	ID 		  string    `json:"id"`
	ScheduleID    string    `json:"schedule_id"`
	EventDatetime time.Time `json:"event_datetime"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	TaskName      string    `json:"task_name"`
}