package api

import "github.com/gin-gonic/gin"

func RegisterRouter(r *gin.Engine, h *Handler) {
	r.GET("/dashboard", h.Dashboard)
	r.POST("/schedules", h.CreateSchedule)
	r.GET("/schedules", h.GetSchedules)
	r.GET("/schedules/:id/tasks", h.TaskList)
	r.PATCH("/schedules/:id/tasks", h.UpdateEventStatus)
}