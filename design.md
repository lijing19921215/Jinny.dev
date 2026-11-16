# DESIGN.md — Project Design System & Motion Ethos

> **Core Identity**: Portfolio of a thoughtful Frontend & Design Engineer.
> **Visual Metaphor**: An annotated, warm ivory engineering journal — quiet restraint on the surface, tactile physics and handcrafted vitality in the micro-interactions.
> **Language**: English-first (`lang="en"`). Concise, honest, zero corporate fluff.

---

## 1. Spatial & Layout System

- **Container Constraint**: Centered single-column layout strictly capped at `max-w-5xl` (`1024px` / `64rem`) with responsive padding (`px-5 sm:px-8 md:px-10`).
  - *Rule*: Never shrink desktop layout below `1024px` into cramped mobile containers.
- **Reading Comfort**: Long-form prose and paragraphs must be constrained to `max-w-[52ch]` to `max-w-[62ch]`.
- **Architectural Flow**: Vertical, single-axis narrative flow. Avoid cluttered multi-column Bento grids, heavy card matrices, or dashboard sidebars.

---

## 2. Color System (Warm Editorial Triad #6)

All components must consume these semantic CSS variables. Never hardcode arbitrary hex values.

| Token | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| `--canvas` | `#FEFCF8` | Warm ivory paper background (never pure `#FFFFFF` or dark mode) |
| `--surface` | `#FFFFFF` | Crisp pure white for cards, squircles, interactive panels |
| `--wash` | `#EDF4FF` | Soft sky-blue wash for hover fills, badges, and active backgrounds |
| `--wash-warm` | `#F6F5F0` | Subtle warm stone tint for secondary hover layers |
| `--ink` | `#0F172A` | Deep slate-black for primary titles, headings, and high-emphasis text |
| `--body` | `#374151` | Neutral reading text for descriptions and body copy |
| `--sepia` | `#786858` | Warm muted tone for dates, read-time, labels, and secondary metadata |
| `--border` | `#E5E7EB` | Hairline `1px` crisp structural dividers and borders |
| `--blue` | `#1E63D6` | Primary interactive cobalt blue for active links, buttons, and chapter labels |
| `--yellow` | `#FCE055` | Warm sunlight highlight, arc dashed lines, and `::selection` background |
| `--red` | `#EF4E5E` | Warm coral-red for live status dot, red koi accents, and sincere callouts |

---

## 3. Typography Hierarchy & Strict Usage Matrix

### 3.1 The Golden Rule
- **Use `Space Grotesk` for Identity & Skeleton**: Headlines, project names, roles/companies, and long-form essay reading.
- **Use `Paper Mono` for Telemetry & Soul**: Hero bio, dates, clock, tags, interactive button labels, sincere callouts, and code.

### 3.2 Element Mapping (Strictly Follow)
- `H1, H2, H3`: `Space Grotesk` (700 weight, `letter-spacing: -0.03em`).
- `Project Titles`: `Space Grotesk` (600 weight, `letter-spacing: -0.015em`).
- `Role / Experience Titles`: `Space Grotesk` (700 weight).
- `Long Essay / Article Prose`: `Space Grotesk` (400 weight, `line-height: 1.8`).
- `Hero Bio Paragraph`: `Paper Mono` with `font-feature-settings: "ss02", "ss03", "cv01"`.
- `Topbar Clock (HH:MM)`: `Paper Mono` with `tabular-nums`.
- `Dates / Timelines`: `Paper Mono` (right-aligned, 600 weight).
- `Interactive Action Links & Buttons` (`resume ↗`, `stir words`, `hello@...`): `Paper Mono` (500 weight).
- `Badges & Tech Tags` (`Canvas + DOM`, `AI Skill`): `Paper Mono` (uppercase/compact).
- `Sincere / Honest Notes`: `Paper Mono` (12.5px, warm sepia, red border-left).
- `Code Snippets & ASCII`: `Paper Mono` with `font-feature-settings: "ss01", "zero"`.

---

## 4. Motion Philosophy & Kinetic Craft (For All Future Features)

The soul of this project is **"Quiet on rest, alive on touch."** Any new component added to this codebase must adhere to these four motion principles:

### 4.1 Physical Springs Over Linear Math
- **Strict Ban**: Never use `linear` or plain `ease` transitions for user interactions.
- **Standard Curve**: Always use natural spring physics with momentum and damping:
  - **CSS Spring**: `cubic-bezier(0.22, 1, 0.36, 1)` for smooth reveals, or `cubic-bezier(0.34, 1.56, 0.64, 1)` for bouncy micro-interactions.
  - **Motion (Framer Motion)**: `transition={{ type: "spring", stiffness: 320, damping: 22 }}`.

### 4.2 Tactile & Magnetic Feedback
Any newly added clickable or hoverable element must feel tangible:
- **Magnetic Pull**: Primary standalone buttons and toggles should gently pull toward the cursor by `2px–3px` on proximity.
- **Click Compression**: Interactive elements should compress (`transform: scale(0.92–0.94)`) on `:active`, releasing with a subtle spring overshoot.
- **Card/Layer Reactions**: Hovering over grouped items should favor physical metaphors (e.g., fanning out like paper sheets, subtle 3D tilt `±3deg`, or shifting shadows) over simple flat color changes.

### 4.3 Stationery & Natural Metaphors
- Visual effects must evoke real-world physical craft:
  - Text highlights should sweep in like a marker line (`scaleX(0) -> scaleX(1)`).
  - Signatures and line accents should draw themselves (`stroke-dashoffset`).
  - Fluid or organic motifs should feel like ripples or swimming motion rather than techno-glitches.

### 4.4 Hierarchy of Movement
- **Rule of Restraint**: Only **one** focal animated module allowed per viewport (e.g., the Fish-to-Birds hero).
- Secondary sections must rely on quiet, reactive micro-motions so the page never feels chaotic or distracting.
- Respect accessibility: Wrap all kinetic engines in `prefers-reduced-motion: reduce` fallbacks.

---

## 5. Construction Guidelines for Future Features

When creating new pages or modules (e.g., Blog, Modal, Showcase, Filter):
1. **New Projects/List Items**:
   - Provide a clean summary row at rest.
   - Reveal metadata/previews contextually upon interaction (e.g., fanning cards, sliding drawers) without cluttering the initial viewport.
2. **New Modals / Dialogs**:
   - Do not use harsh full-black backdrops. Use a warm blurred scrim.
   - Pop into view with spring scale `0.96 -> 1` and slight vertical lift `12px -> 0px`.
3. **Scroll Reveal Pattern**:
   - As sections enter the viewport, trigger a subtle blur-fade entrance (`opacity: 0, translateY: 14px, filter: blur(3px)` -> `opacity: 1, translateY: 0, filter: blur(0)`).
   - Once revealed, unobserve to save browser resources.

---

## 6. Anti-Patterns (Strictly Forbidden)

- **NO Dark Mode**: Do not generate a dark mode toggle or flip background to dark slate.
- **NO Generic SaaS Grids**: Do not assemble 3-column Bento box dashboards.
- **NO Clashing Accents**: Do not introduce green tags/pills or purple/cyan AI gradients.
- **NO Unformatted Clocks**: Topbar time must remain strictly `HH:MM` without jumping seconds or milliseconds.
- **NO Heavy Drop Shadows**: Replace blurry heavy box-shadows with clean `1px solid var(--border)` and crisp, low-opacity offsets (`0 4px 12px rgba(15,23,42,0.06)`).