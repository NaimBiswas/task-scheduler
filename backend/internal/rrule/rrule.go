package r_rule

import (
	"fmt"
	"strings"
	"time"

	"github.com/teambition/rrule-go"
)

func ParseRRULE(rruleStr string) (*rrule.RRule, error) {
	return rrule.StrToRRule(rruleStr)
}

func CountOverdueEvents(rule *rrule.RRule, now time.Time) int {
	start := rule.GetDTStart()
	if start.Before(now) {
		return len(rule.Between(start, now, true))
	}
	return 0
}


func CalculateTotalEvents(startDateStr, endDateStr, frequency string, interval int) (int64, error) {
	if interval <= 0 {
		return 0, fmt.Errorf("interval must be greater than zero")
	}

	// Parse dates
	layout := "2006-01-02"
	startDate, err := time.Parse(layout, startDateStr)
	if err != nil {
		return 0, fmt.Errorf("invalid start_date format")
	}
	endDate, err := time.Parse(layout, endDateStr)
	if err != nil {
		return 0, fmt.Errorf("invalid end_date format")
	}
	if endDate.Before(startDate) {
		return 0, fmt.Errorf("end_date must be after start_date")
	}

	// Calculate duration
	duration := endDate.Sub(startDate)

	// Normalize frequency
	switch strings.ToUpper(frequency) {
	case "HOURLY":
		return int64(duration.Hours()) / int64(interval), nil
	case "DAILY":
		return int64(duration.Hours()) / (24 * int64(interval)), nil
	case "WEEKLY":
		return int64(duration.Hours()) / (24 * 7 * int64(interval)), nil
	case "MONTHLY":
		months := int64((endDate.Year()-startDate.Year())*12 + int(endDate.Month()) - int(startDate.Month()))
		return months / int64(interval), nil
	case "YEARLY":
		years := int64(endDate.Year() - startDate.Year())
		return years / int64(interval), nil
	default:
		return 0, fmt.Errorf("unsupported frequency: %s", frequency)
	}
}
