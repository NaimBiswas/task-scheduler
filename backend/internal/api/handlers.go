package api

import (
	"NaimBiswas/task-scheduler/internal/db"
	r_rule "NaimBiswas/task-scheduler/internal/rrule"
	"NaimBiswas/task-scheduler/internal/utils"
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/teambition/rrule-go"
)

type Handler struct {
	DB *sql.DB
}

type Schedule struct {
	ID          string `json:"id"`
	TaskName    string `json:"task_name"`
	RRULE       string `json:"rrule"`
	TotalEvents int64  `json:"total_events"`
	StartDate time.Time  `json:"start_date"`
	EndDate time.Time  `json:"end_date"`
	Frequency any `json:"frequency"`
}

type EventOverride struct {
	ID            string    `json:"id"`
	ScheduleID    string    `json:"schedule_id"`
	EventDatetime time.Time `json:"event_datetime"`
	Status        string    `json:"status"`
}

func NewHandler(db *sql.DB) *Handler {
	return &Handler{DB: db}
}


func (h *Handler) Dashboard(c *gin.Context) {
	var totalEvents int64
	err := h.DB.QueryRow("SELECT SUM(total_events) FROM schedules").Scan(&totalEvents)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"error": "Failed to fetch total events", "details": err.Error(), "totalEvents": 0, "in_progress": 0, "completed": 0, "overdue": 0})
		return
	}

	var in_progress int64
	err = h.DB.QueryRow("SELECT COUNT(*) FROM event_overrides WHERE status = 'in-progress'").Scan(&in_progress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch completed count", "details": err.Error()})
		return
	}
	var completed int64
	err = h.DB.QueryRow("SELECT COUNT(*) FROM event_overrides WHERE status = 'completed'").Scan(&completed)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch completed count"})
		return
	}

	var overdue int64
	err = h.DB.QueryRow(
		"SELECT COUNT(*) FROM event_overrides WHERE event_datetime < $1 AND status IN ('pending')",
		time.Now(),
	).Scan(&overdue)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch overdue count"})
		return
	}

	rows, err := h.DB.Query("SELECT rrule FROM schedules")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch schedules"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var rruleStr string
		if err := rows.Scan(&rruleStr); err != nil {
			continue
		}
		rule, err := rrule.StrToRRule(rruleStr)
		if err != nil {
			continue
		}
		start := rule.GetDTStart()
		now := time.Now()
		if start.Before(now) {
			count := len(rule.Between(start, now, true))
			overdue += int64(count)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"total_events": totalEvents,
		"completed":    completed,
		"overdue":      overdue,
		"in_progress":  in_progress,
	})
}


func (h *Handler) CreateSchedule(c *gin.Context) {
	var req struct {
		TaskName   string `json:"task_name"`
		StartDate  string `json:"start_date"`
		EndDate    string `json:"end_date"`
		Frequency  string `json:"frequency"`
		Interval   int    `json:"interval"`
		TimeOfDay  string `json:"time_of_day"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_date format"})
		return
	}

	timeOfDay, err := time.Parse("15:04", req.TimeOfDay)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid time_of_day format"})
		return
	}

	dtstart := startDate.Add(time.Hour*time.Duration(timeOfDay.Hour()) + time.Minute*time.Duration(timeOfDay.Minute())).Format("20060102T150405Z")
	
	parsedEndDate, _ := time.Parse("2006-01-02", req.EndDate)
	dateEnd := utils.EndOfDay(parsedEndDate).Format("20060102T150405Z")

	
	rruleStr := fmt.Sprintf(
		"FREQ=%s;DTSTART=%s;INTERVAL=%d;UNTIL=%s",
		req.Frequency,
		dtstart,
		req.Interval,
		dateEnd,
	)
	

	totalEvents, calError := r_rule.CalculateTotalEvents(req.StartDate, req.EndDate, req.Frequency, req.Interval)
	if calError != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": calError.Error()})
		return
	}

	fmt.Println("DTSTART:", rruleStr, "totalEvents:", totalEvents)

	_, err = h.DB.Exec(
		"INSERT INTO schedules (task_name, rrule, total_events, start_date, end_date, frequency) VALUES ($1, $2, $3, $4, $5, $6)",
		req.TaskName, rruleStr, totalEvents, req.StartDate, req.EndDate, req.Frequency,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create schedule", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"task_name":   req.TaskName,
		"total_events": totalEvents,
	})
}


func (h *Handler) GetSchedules(c *gin.Context) {
	rows, err := h.DB.Query("SELECT id, task_name, total_events, start_date, end_date, frequency FROM schedules")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tasks", "details": err.Error()})
		return
	}
	defer rows.Close()

	var schedules []Schedule
	for rows.Next() {
		var s Schedule
		if err := rows.Scan(&s.ID, &s.TaskName, &s.TotalEvents, &s.StartDate, &s.EndDate, &s.Frequency); err != nil {
			fmt.Println("Error scanning schedule:", err)
			break
		}
		schedules = append(schedules, s)
	}

	c.JSON(http.StatusOK, schedules)
}

func (h *Handler) UpdateEventStatus(c *gin.Context) {
	var req struct {
		ScheduleID    string    `json:"schedule_id"`
		EventDatetime string    `json:"event_datetime"`
		Status        string    `json:"status"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	eventDatetime, err := time.Parse(time.RFC3339, req.EventDatetime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event_datetime format"})
		return
	}

	_, err = h.DB.Exec(
		"INSERT INTO event_overrides (schedule_id, event_datetime, status) VALUES ($1, $2, $3) ON CONFLICT (schedule_id, event_datetime) DO UPDATE SET status = $3",
		req.ScheduleID, eventDatetime, req.Status,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event status", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event status updated"})
}



func (h *Handler) TaskList(c *gin.Context) {
	now := time.Now()
	scheduleID := c.Param("id")
	startOfMonthDate := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	firstOfNextMonth := time.Date(now.Year(), now.Month()+1, 1, 0, 0, 0, 0, now.Location())
	
	endOfMonthDate := firstOfNextMonth.Add(-time.Second)
	
	fmt.Println("Start of month:", startOfMonthDate, 
	"end of month:", endOfMonthDate, 
	"scheduleID:", endOfMonthDate.Sub(startOfMonthDate).Hours()/24,
	 "compare: ",90)


	if endOfMonthDate.Before(startOfMonthDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "end_date must be after start_date"})
		return
	}

	// Enforce max 90-day range to prevent performance issues
	if endOfMonthDate.Sub(startOfMonthDate) > (90 * 24 * time.Hour) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date range must not exceed 90 days"})
		return
	}

	var schedule db.Schedule
	err := h.DB.QueryRowContext(c.Request.Context(),
		"SELECT id, task_name, rrule, total_events, created_at FROM schedules WHERE id = $1",scheduleID).
		Scan(&schedule.ID, &schedule.TaskName, &schedule.RRULE, &schedule.TotalEvents, &schedule.CreatedAt)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found", "details": err.Error()})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch schedule", "details": err.Error()})
		return
	}

	rule, err := r_rule.ParseRRULE(schedule.RRULE)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid RRULE: " + err.Error()})
		return
	}

	// Fetch event overrides
	rows, err := h.DB.QueryContext(c.Request.Context(),
		"SELECT id, schedule_id, event_datetime, status FROM event_overrides WHERE schedule_id = $1",
		scheduleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch event overrides", "details": err.Error()})
		return
	}
	defer rows.Close()

	overrides := make(map[time.Time]db.EventOverride)
	for rows.Next() {
		var override db.EventOverride
		if err := rows.Scan(&override.ID, &override.ScheduleID, &override.EventDatetime, &override.Status); err != nil {
			fmt.Println("Error scanning override:", err)
			continue
		}
		overrides[override.EventDatetime] = override
	}

	// Generate events and apply overrides
	events := rule.Between(startOfMonthDate, endOfMonthDate, true)
	var result []db.EventOverride
	for _, eventTime := range events {
		if override, exists := overrides[eventTime]; exists {
			override.TaskName = schedule.TaskName
			result = append(result, override)
		} else {
			status := "pending"
			if eventTime.Before(time.Now()) {
				status = "overdue"
			}
			result = append(result, db.EventOverride{
				ScheduleID:    scheduleID,
				EventDatetime: eventTime,
				Status:        status,
				TaskName:   schedule.TaskName,
				CreatedAt:   schedule.CreatedAt,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{"events": result})
}