# Worklog

Running notes on how this got built — decisions, assumptions, dead ends, and anything
left unfinished. Append as you go; a line or two per entry is right.

---

- Design interview: user confirmed Monday-based weeks, weekday-only allocation with inclusive dates, and expansion to full weeks. Current weekly capacity applies to past weeks too; the fixed schema cannot preserve capacity history. See `.notes/design-session.md`.
- Design interview: user confirmed summing all assignments, safe zero-capacity display, server-confirmed saves with current-range refresh and stale-response protection, and validated endpoints without authentication. Save failures and refresh failures must be distinct.
