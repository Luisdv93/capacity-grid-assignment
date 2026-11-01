package main

import (
	"errors"
	"time"
)

func capacityRange(start, end string) (time.Time, time.Time, error) {
	from, firstErr := time.Parse(time.DateOnly, start)
	to, lastErr := time.Parse(time.DateOnly, end)
	if firstErr != nil || lastErr != nil || from.Year() < 1 || to.Year() > 9998 {
		return time.Time{}, time.Time{}, errors.New("Use valid from and to dates in YYYY-MM-DD format.")
	}
	if to.Before(from) || to.After(from.AddDate(2, 0, 0)) {
		return time.Time{}, time.Time{}, errors.New("Choose an ordered date range of at most two years.")
	}
	from = from.AddDate(0, 0, -(int(from.Weekday())+6)%7)
	to = to.AddDate(0, 0, 6-(int(to.Weekday())+6)%7)
	return from, to, nil
}
