# Verification

## Run

Start with `make up`. The frontend is at http://localhost:3000 and the API at http://localhost:8080.

With Compose running:

```sh
docker compose exec web npm test
docker compose exec web npm run build
docker compose exec api go test ./...
python3 scripts/verify_capacity.py
```

The Python check uses only the standard library. It independently sums each seed assignment day by day with Decimal and compares every returned allocation cell. It checks the initial range, a partial week, and a two-year range. It reads the fixed seed; run against the seeded assignment data.

Optional live write verification:

```sh
python3 scripts/verify_capacity.py --exercise-edit
```

This temporarily changes person 5 to 32.5 weekly hours, checks persistence and unchanged assigned hours, rejects invalid input, checks a missing person, and restores the original capacity in a finally block.

## Observed results

- Eight frontend tests execute with `passWithNoTests: false`: date boundaries, stale responses, zero capacity, failed saves/retry, saved-but-refresh-failed, duplicate-save protection, and bounded number formatting. Production TypeScript/Vite build passes.
- Go date and invalid-body validation tests pass. The live Python check matched 54,500 cells across its three requests, including 52,500 cells over 105 weeks.
- Real browser: previous/next navigation, custom two-year range, scrolling to the final person, sticky names, and 13–19 mounted person rows. Successful edits hit the real API. Injected HTTP failures checked draft retention and the separate refresh-error state. The scroll offset stayed fixed through save/refresh/retry.
- CSS widths 1280 and 390: inspected the loaded grid and date controls. Saved a capacity of 1e100; scientific display and exact numeric accessible labels avoided cell/page overflow. Restored Eli's capacity to zero afterward. Closing the editor returned keyboard focus to its edit button.
- React Doctor and the UI detector were run. The final UI review closed its two findings: a capture taken during loading, and long capacity values overflowing cells.

## Limits

- No authentication or authorization: this is a local demonstration API. No capacity history; current weekly hours apply to all weeks. No holiday calendar.
- Server pagination and horizontal column virtualization are deferred. All people and selected weeks arrive in one response. Row virtualization limits mounted rows, not payload size. No production-scale performance claim is made.
- PostgreSQL keeps exact decimal sums. JSON numeric values become JavaScript numbers in the frontend; sub-display precision is not an arbitrary-precision UI. Display rounds to two decimal places, marks small nonzero hours as <0.01, and uses scientific notation for large values.
- Independent tabs or managers can overwrite the same person's hours; no version check is provided. An interrupted network request may have reached the server; retry sends an absolute weekly-hours value.
- Browser failure checks used injected HTTP responses. No physical mobile device or screen reader session was used.

`DECISIONS.md` remains for the human to write. Fixed data and build/run files were not changed.
