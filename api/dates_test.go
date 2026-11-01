package main

import "testing"

func TestCapacityRange(t *testing.T) {
	for _, tc := range []struct {
		name, from, to, wantFrom, wantTo string
		invalid                          bool
	}{
		{"partial", "2026-01-07", "2026-01-09", "2026-01-05", "2026-01-11", false},
		{"year boundary", "2025-12-29", "2026-01-16", "2025-12-29", "2026-01-18", false},
		{"Sunday", "2026-01-11", "2026-01-11", "2026-01-05", "2026-01-11", false},
		{"missing", "", "2026-01-09", "", "", true},
		{"invalid date", "2026-02-30", "2026-03-01", "", "", true},
		{"reversed", "2026-01-09", "2026-01-07", "", "", true},
		{"too long", "2026-01-01", "2028-01-02", "", "", true},
		{"two years", "2026-01-01", "2028-01-01", "2025-12-29", "2028-01-02", false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			from, to, err := capacityRange(tc.from, tc.to)
			if tc.invalid {
				if err == nil {
					t.Fatal("expected invalid range")
				}
				return
			}
			if err != nil {
				t.Fatal(err)
			}
			if from.Format("2006-01-02") != tc.wantFrom || to.Format("2006-01-02") != tc.wantTo {
				t.Fatalf("got %s through %s", from, to)
			}
		})
	}
}
