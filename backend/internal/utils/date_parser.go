package utils

import (
	"fmt"
	"time"
)

// ParseUntilDate parses a date string in "YYYY-MM-DD" format
// and returns an RRULE UNTIL clause like ";UNTIL=20251013T235959Z"
func ParseUntilDate(dateStr string, format string) (string, error) {
	if dateStr == "" {
		return "", nil
	}

	endDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return "", fmt.Errorf("invalid date format: %v", err)
	}

	return endDate.Format(format), nil
}


func StartOfDay(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location())
}

func EndOfDay(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 23, 59, 59, int(time.Second-time.Nanosecond), t.Location())
}