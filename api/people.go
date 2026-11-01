package main

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"
)

func (s *server) handleUpdatePerson(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 32)
	if err != nil || id <= 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Use a valid person identifier."})
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 4096)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	var body struct {
		WeeklyHours json.RawMessage `json:"weeklyHours"`
	}
	if err := decoder.Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Send a JSON object with weeklyHours as a number."})
		return
	}
	var extra any
	if err := decoder.Decode(&extra); err != io.EOF || (len(body.WeeklyHours) == 0 || string(body.WeeklyHours) == "null") {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Send one JSON object with weeklyHours."})
		return
	}
	var number json.Number
	if body.WeeklyHours[0] == '"' || json.Unmarshal(body.WeeklyHours, &number) != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Weekly hours must be a JSON number."})
		return
	}
	hours, err := number.Float64()
	if err != nil || math.IsInf(hours, 0) || math.IsNaN(hours) || hours < 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Weekly hours must be a finite number of zero or more."})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	var saved string
	err = s.db.QueryRow(ctx, `UPDATE people SET weekly_hours = $1::numeric WHERE id = $2 RETURNING weekly_hours::text`, number.String(), id).Scan(&saved)
	if errors.Is(err, pgx.ErrNoRows) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "This person no longer exists."})
		return
	}
	if err != nil {
		log.Printf("update person: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not save weekly hours. Try again."})
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	writeJSON(w, http.StatusOK, map[string]any{"id": id, "weeklyHours": json.RawMessage(saved)})
}
