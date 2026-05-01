---
name: Video Upload Learning App
description: Focused course and video learning interface for assigned training.
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.145 0 0)"
  primary: "oklch(0.205 0 0)"
  primary-foreground: "oklch(0.985 0 0)"
  secondary: "oklch(0.97 0 0)"
  secondary-foreground: "oklch(0.205 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  accent: "oklch(0.97 0 0)"
  accent-foreground: "oklch(0.205 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  border: "oklch(0.922 0 0)"
  input: "oklch(0.922 0 0)"
  ring: "oklch(0.708 0 0)"
typography:
  display:
    fontFamily: "Inter Variable, sans-serif"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "normal"
rounded:
  sm: "calc(0.625rem * 0.6)"
  md: "calc(0.625rem * 0.8)"
  lg: "0.625rem"
  xl: "calc(0.625rem * 1.4)"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem"
  surface-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
---

# Design System: Video Upload Learning App

## 1. Overview

**Creative North Star: "The Quiet Study Desk"**

The design system should feel like a focused learning workspace where the video, lesson order, and progress state are always easier to see than the interface chrome. The current implementation uses a shadcn/Tailwind foundation, Inter Variable typography, OKLCH neutral tokens, lucide icons, subtle motion, and compact app surfaces.

The system rejects generic SaaS dashboards, decorative gradients, vague hero metrics, predictable blue-card layouts, and visually busy course marketplaces. It should stay practical and composed: learners should know what to watch next, what has been completed, and whether a video is ready.

**Key Characteristics:**
- Neutral-first surfaces with one restrained action color.
- Inter typography with clear weight contrast and compact labels.
- Tonal layering and borders before heavy shadows.
- Direct navigation between courses, course details, and playback.
- Useful status messaging for loading, empty, draft, uploaded, unprocessed, and completed states.

## 2. Colors

The current palette is a restrained OKLCH neutral system. It is intentionally quiet so video content and progress states carry the attention.

### Primary
- **Ink Action** (`oklch(0.205 0 0)`): Primary actions, selected filters, playback emphasis, and strong text-like affordances.

### Neutral
- **Canvas White** (`oklch(1 0 0)`): Page background and default card surfaces.
- **Reading Ink** (`oklch(0.145 0 0)`): Primary text and high-emphasis UI copy.
- **Soft Panel** (`oklch(0.97 0 0)`): Secondary controls, muted backgrounds, side panels, placeholders, and subtle hover states.
- **Measured Text** (`oklch(0.556 0 0)`): Muted labels, helper text, course metadata, and secondary video information.
- **Quiet Border** (`oklch(0.922 0 0)`): Dividers, input outlines, card boundaries, and page separators.

### Semantic
- **Destructive Red** (`oklch(0.577 0.245 27.325)`): Destructive or failed states only. Do not use it as decoration.
- **Focus Ring Grey** (`oklch(0.708 0 0)`): Keyboard focus and interactive outlines through the shared ring token.

### Named Rules

**The Video First Rule.** Keep saturated color rare on playback screens. The interface should frame the lesson, not compete with it.

**The No Generic SaaS Rule.** Do not introduce decorative blue gradients, hero metrics, or bright dashboard accents unless a future product decision explicitly changes the brand direction.

## 3. Typography

**Display Font:** Inter Variable, sans-serif  
**Body Font:** Inter Variable, sans-serif  
**Label/Mono Font:** Inter Variable, sans-serif

**Character:** The type system is plain, readable, and practical. Hierarchy should come from size and weight, not decorative treatment.

### Hierarchy
- **Display** (700, route-scale headings, 1.15 line-height): Rare. Use for major page titles such as course overview pages.
- **Headline** (700, `1.875rem`, 1.2 line-height): Page headings and major section starts.
- **Title** (600, `1.25rem`, 1.3 line-height): Card titles, course titles, dialog titles, and video list section labels.
- **Body** (400, `1rem`, 1.5 line-height): Descriptions and readable explanatory text. Keep long text to 65-75ch.
- **Label** (500, `0.875rem`, 1.25 line-height): Buttons, filters, metadata, badges, and compact controls.

### Named Rules

**The Scannable Lesson Rule.** Video titles, course names, and progress labels must remain readable at a glance. Avoid tiny low-contrast metadata when it communicates learning state.

## 4. Elevation

The current system is flat by default and uses tonal layering, borders, radius, and sticky headers to create structure. Heavy shadows are not part of the established language. Motion from Framer Motion appears on page/list entrance, but depth should remain restrained.

### Shadow Vocabulary
- **None at Rest** (`box-shadow: none`): Default for cards, lists, headers, dialogs, and panels unless a component from the shared UI package provides a built-in shadow.
- **Tonal Elevation** (`background: card/50`, `background: card/30`, `border: border`): Use for sticky headers, course summaries, playback sidebars, and elevated panels.

### Named Rules

**The Flat By Default Rule.** Surfaces should be separated with spacing, borders, and tone first. Add shadow only when a component must visibly float above the workflow.

## 5. Components

### Buttons

- **Shape:** Rounded medium to large, based on the shared radius scale (`calc(0.625rem * 0.8)` to `0.625rem`).
- **Primary:** Ink Action background with Primary Foreground text, used for clear creation or continuation actions.
- **Hover / Focus:** Use tokenized hover states and visible ring focus. Do not remove outlines.
- **Ghost:** Transparent background for navigation, icon actions, back buttons, and secondary controls.

### Chips

- **Style:** Current filters use rounded pill controls with primary selected state and secondary unselected state.
- **State:** Selected chips should be visibly distinct without relying on color alone. Pair selected color with weight or shape treatment when practical.

### Cards / Containers

- **Corner Style:** Large rounded surfaces are common (`rounded-xl`) for course summaries and video rows.
- **Background:** Use `card`, `card/50`, `card/30`, or `secondary` depending on hierarchy.
- **Shadow Strategy:** Follow the flat by default rule. Borders and tonal shifts carry most separation.
- **Border:** Use `border` and subtle hover border changes. Avoid colored side-stripe borders.
- **Internal Padding:** Use `1rem` for dense rows, `1.5rem` for course summaries and larger panels.

### Inputs / Fields

- **Style:** Use shared shadcn-style fields from `packages/ui`, with border and input tokens.
- **Focus:** Keep visible ring treatment from the global base styles.
- **Error / Disabled:** Error states should include text or icon support, not color alone.

### Navigation

- **Style:** Sticky top headers use a translucent card tone with backdrop blur and a bottom border.
- **Default / Hover / Active:** Keep navigation controls direct and compact. Back actions should use ghost icon buttons. Active video list items should use a full-surface tone, icon/state change, or text weight. Avoid relying on a thick colored left border.
- **Mobile Treatment:** Preserve access to the current course title, current video title, and back navigation without truncating the primary task.

### Video Player

The player is the highest-priority surface. Playback should remain visually dominant, with course/video metadata and the playlist acting as support. Unprocessed videos need useful fallback messaging that states the video is not ready and gives enough context for recovery.

## 6. Do's and Don'ts

### Do:

- **Do** keep learner continuity visible: current course, current video, completion state, and resume state should be easy to find.
- **Do** use the existing OKLCH token system in `packages/ui/src/styles/globals.css`.
- **Do** keep body copy readable and cap long prose at 65-75ch.
- **Do** make empty, loading, and unavailable video states actionable or explanatory.
- **Do** preserve keyboard focus rings and motion reduction expectations.

### Don't:

- **Don't** create generic SaaS dashboards, decorative gradients, vague hero metrics, or predictable blue-card layouts.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored side stripe on cards, list items, callouts, alerts, or active rows.
- **Don't** use gradient text, glassmorphism as default styling, or decorative glow effects around ordinary controls.
- **Don't** let course creation/admin controls dominate learner playback screens unless the task is explicitly for creator workflows.
- **Don't** communicate course status, completion, upload state, or playback availability with color alone.
