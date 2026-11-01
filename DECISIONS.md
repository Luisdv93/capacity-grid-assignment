# Decisions

Yours to write, not your AI's. Short is good — bullets are fine, and half a page is
plenty. We read this first.

## What did the spec not tell you?

There are things this brief doesn't specify. Which ones did you hit, what did you decide,
and why?

- Wether the week starts at sunday or monday. I chose monday and counted monday to friday. No holiday calendar.
- I expanded partial date ranges to full weeks so each column uses the same basis for comparison. 
- The schema saves `hours_per_day` but doesn't define a working calendar, holidays, weekends, etc. I applied the current value to all weeks, including past weeks.
- I chose to refresh the selected range after a confirmed save. This keeps the displayed figures consistent with the server.
- If the user selects a range that's not a full week, do we show the full week or only those days.
- The schema saves a weekly hours value per person but not the effective dates so changing those would affect past weeks
- I used row virtualization. This limits rendered rows, but it does not reduce response size or proves that's better for performance.
- 

## What did you notice that looked wrong?

Anything in the output that didn't match what you expected. Whether you fixed it or left
it, we want to know you saw it.

- No pagination for the list from the API side
- No prettier, eslint, biome, etc so the formatting for files looked weird at first glance.
- The over-capacity legend was too far from the grid. I moved it next to the range information.
- Repeated “Edit” links suggested a smaller click target, although the whole person cell was clickable. I replaced them with pencil icons.
- Some components were difficult to read. I requested manual cleanup and one React component per file.

## What did the AI get wrong that you caught?

One concrete example. Every real session has one.

- passWithNoTests: true on the vite config file , the AI wrote tests saying all of them were passing on the first try. Some of them failed after changing that.
- The AI initially blocked switching to another person while the editor was open. I asked to allow switching and preserve each person’s draft.

## What would you do differently with a week?

- Add pagination, right now it's working with virtualization 
- More UI polish, for example a Rage Date Picker, better UI/Typography hierarchy and an improved color palette.
- Weeks with 0 should have a more distinct design, more muted
- Weeks with the full 40 weeks should be green
