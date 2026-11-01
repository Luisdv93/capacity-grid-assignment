# Capacity design session

Confirmed decisions only. Open questions remain outside the implementation scope until resolved.

## Confirmed

- Q1: Weeks run Monday through Sunday. Count assigned hours on Monday through Friday, including assignment start and end dates when they are working days. Do not subtract public holidays: no holiday calendar is provided.
- Q2: Expand selected dates to full containing weeks. Show the effective dates in the interface. Each column compares full-week allocation with full weekly capacity.
- Q3: Editing weekly hours changes the capacity used for all displayed weeks, including past weeks. Assigned hours do not change. Explain this effect in the editing interface. Capacity history is out of scope because the fixed schema has no effective dates.
- Q4: Sum every assignment row; do not deduplicate similar rows. Preserve calculation precision and round only for display. Over-allocation means assigned hours exceed capacity. With zero capacity, show assigned hours and any excess without an infinite percentage; zero assigned hours and zero capacity is not over-allocation.
- Q5: Confirm writes on the server before updating displayed figures. Prevent simultaneous saves for the same person, then refetch the current range. Preserve the draft on save failure and offer retry. Ignore stale range responses. Distinguish a failed save from a successful save followed by a failed refresh.
- Q6: Keep the assignment without authentication. Validate dates, range, person identifier, and JSON input. Weekly hours must be finite and non-negative; zero is valid. Do not add accounts, permissions, or schema changes. Any client with API access can edit; this is a local demonstration limitation.
- Q7: Start with the scaffold's three-week range. Previous/next moves the range by one week; custom dates are available. Limit the selected range to two calendar years, allowing full-week expansion at its edges. Scope assignment queries to the effective range. Return all people, including those without assignments; virtualize visible rows and allow horizontal week scrolling. Server pagination is deferred. Performance remains unverified until measured.
- Q8: Each cell shows assigned hours and capacity; over-allocation has a non-color indicator. Provide initial loading, retryable errors, and distinct missing-data and zero-hour states. Do not label previous-range data as current. The editor supports save/cancel, validation, pending state, clear results, and retained drafts on failure. Controls have accessible labels and visible focus. Preserve person/week references while scrolling.
- Q9: Verify calculations against independent expected values for overlaps, weekends, fractions, and zero capacity. Test rapid range changes and stale responses. Check saved capacity persists and updates dependent figures. Exercise save failure separately from successful save followed by refresh failure. Inspect the running seeded grid with keyboard navigation, scrolling, and a two-year range; record observed limits. A passing test command with no executed tests is not evidence.

## Session closure

All nine questions have confirmed answers. Overall design confirmation is pending before implementation. No application behavior or performance has been verified yet. Documentation commits are local; no feature code has been implemented.

## Evidence limits

- Repository inspection only. The application has not been run or verified in a browser.
- The API and UI contracts are stubs. No existing external consumers were found in this repository; consumers outside it are not verified.
