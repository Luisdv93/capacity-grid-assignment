# Capacity design session

Confirmed decisions only. Open questions remain outside the implementation scope until resolved.

## Confirmed

- Q1: Weeks run Monday through Sunday. Count assigned hours on Monday through Friday, including assignment start and end dates when they are working days. Do not subtract public holidays: no holiday calendar is provided.
- Q2: Expand selected dates to full containing weeks. Show the effective dates in the interface. Each column compares full-week allocation with full weekly capacity.
- Q3: Editing weekly hours changes the capacity used for all displayed weeks, including past weeks. Assigned hours do not change. Explain this effect in the editing interface. Capacity history is out of scope because the fixed schema has no effective dates.
- Q4: Sum every assignment row; do not deduplicate similar rows. Preserve calculation precision and round only for display. Over-allocation means assigned hours exceed capacity. With zero capacity, show assigned hours and any excess without an infinite percentage; zero assigned hours and zero capacity is not over-allocation.
- Q5: Confirm writes on the server before updating displayed figures. Prevent simultaneous saves for the same person, then refetch the current range. Preserve the draft on save failure and offer retry. Ignore stale range responses. Distinguish a failed save from a successful save followed by a failed refresh.
- Q6: Keep the assignment without authentication. Validate dates, range, person identifier, and JSON input. Weekly hours must be finite and non-negative; zero is valid. Do not add accounts, permissions, or schema changes. Any client with API access can edit; this is a local demonstration limitation.

## Evidence limits

- Repository inspection only. The application has not been run or verified in a browser.
- The API and UI contracts are stubs. No existing external consumers were found in this repository; consumers outside it are not verified.
