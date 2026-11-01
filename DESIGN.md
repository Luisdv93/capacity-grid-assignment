---
name: Capacity
description: A clear weekly view of assigned hours and team capacity.
colors:
  accent: "#235b45"
  accent-hover: "#194732"
  ink: "#263832"
  muted: "#53665e"
  page: "#f5f7f4"
  surface: "#fff"
  line: "#dce4dd"
  control-border: "#aabbb0"
  control-hover: "#eaf0e9"
  control-hover-border: "#678976"
  header: "#eef2ed"
  danger: "#9d2e26"
  over-surface: "#fff0e9"
  over-detail: "#963c30"
  empty-surface: "#fafbf9"
  editor-surface: "#edf4ee"
  editor-border: "#94b29f"
  focus: "#387d5b"
typography:
  headline:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "30px"
    fontWeight: 650
    letterSpacing: "-.025em"
  title:
    fontSize: "18px"
    fontWeight: 650
  body:
    fontSize: "13px"
  control:
    fontSize: "14px"
    fontWeight: 550
  label:
    fontSize: "12px"
    fontWeight: 600
rounded:
  control: "6px"
  panel: "8px"
spacing:
  control-gap: "8px"
  section-gap: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    typography: "{typography.control}"
    padding: "9px 12px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
  editor:
    backgroundColor: "{colors.editor-surface}"
    rounded: "{rounded.panel}"
    padding: "20px"
  capacity-cell-over:
    backgroundColor: "{colors.over-surface}"
    textColor: "{colors.danger}"
    padding: "12px 18px"
    height: "68px"
---

# Design System: Capacity

## Overview

**Creative North Star: "Operate"**

The interface supports weekly planning with a compact table, clear labels, and quiet green and neutral surfaces. Dark green marks primary actions. Warm red marks hours above capacity, with explicit text that states the excess.

**Key Characteristics:**
- Dense, readable weekly comparisons.
- Stable person and week context while scrolling.
- Direct editing with visible save and error states.

## Colors

Primary green identifies actions, editing links, and confirmed saves. Neutral surfaces separate the page, table headers, and data. Muted text carries dates and supporting details. Warm red and its pale surface identify over-capacity cells and errors.

**The Explicit Status Rule.** State over-capacity hours in text as well as color.

## Typography

Use the system sans-serif stack throughout. Tabular numerals keep hours aligned. The headline identifies the page; titles identify the editor and load states. Compact body text carries table values. Smaller labels carry capacity, dates, and availability. The headline reduces to (26px) on narrow screens.

## Layout

The centered page has a maximum width of (1600px). Desktop padding is (44px 40px 24px). The toolbar pairs week navigation with the range form. The over-capacity legend sits beside the range explanation directly above the table, wrapping beneath it on narrow screens. Its swatch matches the over-capacity cell surface. At (900px), controls wrap and the editor stacks. At (520px), the header and summary stack, the range action spans the form, and page side padding reduces to (12px). Week navigation spans the narrow screen in two equal columns. Narrow-screen controls are at least (44px) high, inputs use (16px) text, and the editor places its full-width input above two equal action columns.

The table scrolls in both directions. Its viewport is `min(60vh, 612px)`, with a minimum height of (300px). Week headers stay at the top; person cells stay on the left. Headers are (70px) high and rows are (68px) high. Rows are virtualized with five extra rows on each side. The table width is calculated from (260px) plus (182px) per week; the first header width changes to (170px) on narrow screens.

## Elevation & Depth

The interface has no shadows or animated transitions. Borders and pale surface changes separate regions. Sticky headers sit above data, and the loading panel covers retained table content during refresh. Keyboard focus uses a green outline (3px) with an offset (3px); person buttons place it inside the cell.

## Shapes

Controls use small rounded corners. Table, editor, and load panels use the larger panel radius. Table cells remain square and share thin dividers. The person button fills its row heading without a separate border.

## Components

- **Actions:** Dark green primary buttons apply a range or save hours. White secondary buttons navigate weeks, close the editor, or retry loading. Hover changes the surface. Disabled controls reduce opacity. Person names stay fully legible while editing, and their pencil icons dim while unavailable. Only an active save uses a progress cursor; hover treatments apply to hover-capable pointers.
- **Fields:** Native date inputs select the range. A number input edits weekly hours. Labels stay visible above fields; focus uses the shared outline. Errors appear beside the affected flow and describe the hours field through its accessible description. A failed network request does not mark a valid number as invalid.
- **Capacity table:** Each cell shows assigned hours, capacity, and hours available or over capacity. Empty allocation has a faint neutral surface. Long person names truncate; the full name remains in the title attribute. Each person cell is a full-width edit button with a persistent pencil at the right. Hover and keyboard focus emphasize the pencil; no separate Edit link is shown.
- **Inline editor:** A pale green panel opens above the grid. It states that capacity applies to every week. Saving disables its controls. Success and error messages use text and status roles. After a save attempt, focus returns to the hours field. Closing returns focus to the person control when it remains present.
- **Load states:** Bordered white panels show loading, empty data, or a load error. A load error offers a retry action. The loading bar is static.

## Do's and Don'ts

### Do:
- Do show hours and explicit availability or excess text together.
- Do retain visible labels and keyboard focus treatments.
- Do use the current weekly capacity wording consistently.

### Don't:
- Don't rely on color alone to mark over-capacity cells.
- Don't remove sticky person and week context from the scrolling table.
- Don't add shadows or decorative motion to this restrained interface.
