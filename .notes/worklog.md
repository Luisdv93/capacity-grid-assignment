# Worklog

Running notes on how this got built — decisions, assumptions, dead ends, and anything
left unfinished. Append as you go; a line or two per entry is right.

---

- Design interview: user confirmed Monday-based weeks, weekday-only allocation with inclusive dates, and expansion to full weeks. Current weekly capacity applies to past weeks too; the fixed schema cannot preserve capacity history. See `.notes/design-session.md`.
- Design interview: user confirmed summing all assignments, safe zero-capacity display, server-confirmed saves with current-range refresh and stale-response protection, and validated endpoints without authentication. Save failures and refresh failures must be distinct.
- Design interview: user confirmed three-week initial view, one-week navigation, custom ranges up to two years, row virtualization, and deferred server pagination. Accessibility, explicit loading/error states, independent calculation checks, failure-path tests, and running-grid inspection are acceptance criteria. Overall design confirmation is pending before implementation.

- Implemented the weekly query with PostgreSQL numeric sums. Equal assignment spans are grouped before week expansion, while every row contributes. Initial live values include Ana 40/0/30 h, Bo 0/32/8 h, Dee 0/45/40 h, and Eli 0/20/0 h across the initial three weeks.
- Added strict date/body validation and server-confirmed capacity edits. The UI keeps editor drafts outside virtual rows and hides stale figures during refresh while retaining the table's scroll position. Browser inspection caught a negative-zero label; fixed before delivery.
