# Capacity design session

Confirmed decisions only. Open questions remain outside the implementation scope until resolved.

## Confirmed

- Q1: Weeks run Monday through Sunday. Count assigned hours on Monday through Friday, including assignment start and end dates when they are working days. Do not subtract public holidays: no holiday calendar is provided.
- Q2: Expand selected dates to full containing weeks. Show the effective dates in the interface. Each column compares full-week allocation with full weekly capacity.
- Q3: Editing weekly hours changes the capacity used for all displayed weeks, including past weeks. Assigned hours do not change. Explain this effect in the editing interface. Capacity history is out of scope because the fixed schema has no effective dates.

## Evidence limits

- Repository inspection only. The application has not been run or verified in a browser.
- The API and UI contracts are stubs. No existing external consumers were found in this repository; consumers outside it are not verified.
