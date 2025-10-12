package main

import (
	"NaimBiswas/task-scheduler/internal/api"
	"NaimBiswas/task-scheduler/internal/cache"
	"NaimBiswas/task-scheduler/internal/config"
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/jackc/pgx/v5/stdlib"
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

	redisCache := cache.NewRedisCache(cfg.RedisURL)
	defer redisCache.Close()

	r := gin.Default()
	// Register handlers
	handler := api.NewHandler(db)
	api.RegisterRouter(r, handler)
	

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Welcome to the Task Scheduling API"})
	})
	r.Run(":"+cfg.Port)
}
