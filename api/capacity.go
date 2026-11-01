package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type capacityPerson struct {
	ID             int             `json:"id"`
	Name           string          `json:"name"`
	WeeklyHours    json.RawMessage `json:"weeklyHours"`
	AllocatedHours json.RawMessage `json:"allocatedHours"`
}

type capacityResponse struct {
	From   string           `json:"from"`
	To     string           `json:"to"`
	Weeks  []string         `json:"weeks"`
	People []capacityPerson `json:"people"`
}

func (s *server) handleCapacity(w http.ResponseWriter, r *http.Request) {
	from, to, err := capacityRange(r.URL.Query().Get("from"), r.URL.Query().Get("to"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	result := capacityResponse{From: from.Format(time.DateOnly), To: to.Format(time.DateOnly), Weeks: []string{}, People: []capacityPerson{}}
	for week := from; !week.After(to); week = week.AddDate(0, 0, 7) {
		result.Weeks = append(result.Weeks, week.Format(time.DateOnly))
	}
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	rows, err := s.db.Query(ctx, capacitySQL, result.From, result.To)
	if err != nil {
		log.Printf("capacity query: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not load capacity. Try again."})
		return
	}
	defer rows.Close()
	for rows.Next() {
		var person capacityPerson
		var hours string
		if err := rows.Scan(&person.ID, &person.Name, &hours, &person.AllocatedHours); err != nil {
			log.Printf("capacity row: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not read capacity. Try again."})
			return
		}
		person.WeeklyHours = json.RawMessage(hours)
		result.People = append(result.People, person)
	}
	if err := rows.Err(); err != nil {
		log.Printf("capacity rows: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not load capacity. Try again."})
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	writeJSON(w, http.StatusOK, result)
}

// Group equal date spans before expanding weeks. Every row still contributes its hours.
const capacitySQL = `
WITH weeks AS (
 SELECT d::date AS week_start
 FROM generate_series($1::date::timestamp, $2::date::timestamp, interval '1 week') d
), spans AS MATERIALIZED (
 SELECT person_id, start_date, end_date, sum(hours_per_day) AS hours
 FROM assignments
 WHERE start_date <= $2::date AND end_date >= $1::date
 GROUP BY person_id, start_date, end_date
), totals AS (
 SELECT a.person_id, w.week_start,
   sum(a.hours * (
     SELECT count(*) FROM generate_series(
       greatest(a.start_date, w.week_start)::timestamp,
       least(a.end_date, w.week_start + 6)::timestamp, interval '1 day'
     ) day WHERE extract(isodow FROM day) <= 5
   )) AS hours
 FROM spans a JOIN weeks w
 ON a.start_date <= w.week_start + 6 AND a.end_date >= w.week_start
 GROUP BY a.person_id, w.week_start
)
SELECT p.id, p.name, p.weekly_hours::text,
 jsonb_agg(coalesce(t.hours, 0) ORDER BY w.week_start)
FROM people p CROSS JOIN weeks w
LEFT JOIN totals t ON t.person_id = p.id AND t.week_start = w.week_start
GROUP BY p.id, p.name, p.weekly_hours
ORDER BY p.name, p.id`
