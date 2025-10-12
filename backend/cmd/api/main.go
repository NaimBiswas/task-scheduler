package main

import (
	"NaimBiswas/task-scheduler/internal/config"
	"database/sql"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/teambition/rrule-go"
)

type Schedule struct {
	ID          string `json:"id"`
	TaskName    string `json:"task_name"`
	RRULE       string `json:"rrule"`
	TotalEvents int64  `json:"total_events"`
}

func main() {
	cfg := config.Load()
	db, err := sql.Open("pgx", cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}else {
		log.Println("Connected to the database successfully.")
	}
	defer db.Close()

	r := gin.Default()

	r.GET("/dashboard", func(c *gin.Context) {
		// Total events
		var totalEvents int64
		err := db.QueryRow("SELECT SUM(total_events) FROM schedules").Scan(&totalEvents)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch total events"})
			return
		}

		// Completed events
		var completed int64
		err = db.QueryRow("SELECT COUNT(*) FROM event_overrides WHERE status = 'completed'").Scan(&completed)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch completed count"})
			return
		}

		// Overdue events
		var overdue int64
		err = db.QueryRow(
			"SELECT COUNT(*) FROM event_overrides WHERE event_datetime < $1 AND status IN ('pending', 'in-progress')",
			time.Now(),
		).Scan(&overdue)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch overdue count"})
			return
		}

		// Add overdue from schedules without overrides
		rows, err := db.Query("SELECT rrule FROM schedules")
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
		})
	})

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Welcome to the Task Scheduling API"})
	})
	r.Run(":8080")
}
