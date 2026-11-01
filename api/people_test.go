package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestUpdateRejectsInvalidInputBeforeDatabase(t *testing.T) {
	for _, tc := range []struct{ name, id, body string }{
		{"bad id", "no", `{"weeklyHours":40}`},
		{"negative id", "-1", `{"weeklyHours":40}`},
		{"missing hours", "1", `{}`},
		{"null hours", "1", `{"weeklyHours":null}`},
		{"negative hours", "1", `{"weeklyHours":-0.1}`},
		{"overflow", "1", `{"weeklyHours":1e999}`},
		{"string hours", "1", `{"weeklyHours":"40"}`},
		{"boolean hours", "1", `{"weeklyHours":true}`},
		{"extra field", "1", `{"weeklyHours":40,"name":"changed"}`},
		{"extra object", "1", `{"weeklyHours":40} {}`},
		{"oversize", "1", `{"weeklyHours":` + strings.Repeat("1", 5000) + `}`},
	} {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPatch, "/api/people/"+tc.id, strings.NewReader(tc.body))
			req.SetPathValue("id", tc.id)
			response := httptest.NewRecorder()
			(&server{}).handleUpdatePerson(response, req)
			if response.Code != http.StatusBadRequest {
				t.Fatalf("expected 400, got %d: %s", response.Code, response.Body.String())
			}
			if !strings.Contains(response.Header().Get("Content-Type"), "application/json") {
				t.Fatal("expected JSON error")
			}
		})
	}
}
