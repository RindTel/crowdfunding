---
name: FundForge
description: Crowdfunding that feels authored, not generated. Indie magazine meets campaign poster, with ledger-grade money.
colors:
  brand-500: "#14b8a6"
  brand-600: "#0d9488"
  brand-400: "#2dd4bf"
  brand-300: "#5eead4"
  brand-50: "#f0fdfa"
  navy-950: "#070f1f"
  navy-900: "#0e1c33"
  navy-800: "#1a2f4d"
  navy-700: "#243f68"
  ink: "#0e1c33"
  slate-900: "#0f172a"
  slate-600: "#475569"
  slate-500: "#64748b"
  slate-200: "#e2e8f0"
  slate-50: "#f8fafc"
  paper: "#ffffff"
  success: "#10b981"
  warning: "#f59e0b"
  danger: "#e11d48"
typography:
  display:
    fontFamily: "Sora, DM Sans, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 7vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Sora, DM Sans, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Sora, DM Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  accent:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
    fontStyle: "italic"
  label:
    fontFamily: "Sora, DM Sans, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.14em"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  full: "9999px"
spacing:
  section: "5.5rem"
  section-lg: "7.5rem"
  gutter: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-600}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.brand-500}"
  button-secondary:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  card-campaign:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.625rem 0.875rem"
  badge:
    backgroundColor: "{colors.brand-50}"
    textColor: "{colors.brand-600}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.625rem"
---

# Design System: FundForge

## 1. Overview

**Creative North Star: "The Campaign Press."**

FundForge is a working print-shop for ideas. Every campaign should read like a hand-set broadsheet or a screen-printed poster: big authored headlines, a human voice carried in italic serif, a single activist ink, and momentum you can feel. It is editorial first and a fintech app second, the inverse of the category default. Where most crowdfunding sites are flat dashboards with progress bars bolted on, FundForge treats each campaign as a piece someone made and the platform as the press that prints it.

The discipline that keeps it from becoming noise: loudness is paced, and money is sacred. Marketing and campaign surfaces get full poster energy; the tools where people move money (dashboard, admin, create/edit, the pledge flow) drop to a quiet, confident volume on the same type and color system. Goal, raised, progress, and pledge are always set in tabular Sora and never decorated into ambiguity. The result feels authored and urgent without ever feeling untrustworthy or template-stamped.

This system explicitly rejects: generic fintech / SaaS template energy (flat corporate blue, the hero-metric template, endless identical icon cards), AI-slop tells (gradient text, neon glow on everything, an eyebrow above every section, centered-hero-over-mesh, stock "make a difference" heroes), overdesign that costs legibility, and uniform loudness on every surface.

**Key Characteristics:**
- Editorial broadsheet typography pushed hard: oversized Sora display, mixed weights inside one headline, Instrument Serif italic as the human/story voice.
- One ink: Electric Teal carries every action, link, focus, money, and momentum signal. Deep Navy is the press-black.
- Campaign cards are the hero component and must feel alive, never like rows.
- Momentum is real data, never decoration.
- Same system at two volumes: loud on brand surfaces, calm on tools.

## 2. Colors

A disciplined two-ink system over warm-cool neutrals: one saturated brand color does all the talking, navy provides press-black depth, slate carries text and structure.

### Primary
- **Electric Teal** (`#14b8a6` core, `#0d9488` for primary buttons and money figures, `#2dd4bf` for highlights): the single action ink. CTAs, links, focus rings, progress fills, funded-money figures, and momentum signals. It marks the one thing that matters on a screen: backing the project. Its near-monopoly on saturation is the point; nothing else competes for "act here."

### Secondary
- **Deep Navy** (`#0e1c33` / `#070f1f`): press-black. Dark surfaces (sidebar, footers, dark campaign blocks, the pledge panel header), structural contrast, and the darkest display headings. In dark mode it becomes the page ground.

### Neutral
- **Ink** (`#0e1c33`): primary heading and high-emphasis text on light surfaces.
- **Slate 600 / 500** (`#475569` / `#64748b`): body and secondary text. Body must clear 4.5:1; do not drop body below slate-600 on white.
- **Slate 200 / 50** (`#e2e8f0` / `#f8fafc`): borders, dividers, hairlines, recessed fills.
- **Paper** (`#ffffff`): elevated card and surface ground in light mode.

### Status
- **Success** `#10b981`, **Warning** `#f59e0b`, **Danger** `#e11d48`: reserved for state. Status always pairs hue with an icon or label, never hue alone.

### Named Rules
**The One Ink Rule.** Teal is the only saturated color allowed to signal action. If a second saturated accent appears on a screen to compete for attention, it is wrong. Status colors are state, not accents.

**The Money-Is-Teal Rule.** Raised amounts and progress are always teal and always tabular (`font-variant-numeric: tabular-nums`). Goal and supporting figures are ink/slate. The eye learns: teal = momentum.

## 3. Typography

**Display / UI Font:** Sora (with DM Sans, system-ui fallback)
**Body Font:** DM Sans (with system-ui fallback)
**Accent Font:** Instrument Serif italic (with Georgia fallback)
**Mono Font:** JetBrains Mono (numbers in dense/admin contexts)

**Character:** Sora is a geometric grotesque with enough personality to carry poster-scale headlines; pushed to weight 800 with tight tracking it reads as authored, not corporate. DM Sans keeps body text humane and readable. Instrument Serif italic is the human hand: it carries the story voice, a creator's words, an emphasized phrase. The pairing contrasts on a real axis (geometric sans + humanist italic serif), never two similar sans.

### Hierarchy
- **Display** (Sora 800, `clamp(2.75rem, 7vw, 5.5rem)`, line-height 0.95, tracking -0.035em): hero and section-opening headlines on brand surfaces only. `text-wrap: balance`.
- **Headline** (Sora 700, `clamp(1.75rem, 3.5vw, 2.75rem)`, line-height 1.05): page and major section titles.
- **Title** (Sora 600, 1.125rem): card titles, panel headers, campaign names.
- **Body** (DM Sans 400, 1rem, line-height 1.65): prose and UI copy. Cap measure at 65–75ch.
- **Accent** (Instrument Serif italic, ~1.25rem+): story pull-quotes, emphasized words inside a Sora headline, human voice moments. Used sparingly and deliberately.
- **Label** (Sora 600, 0.6875rem, tracking 0.14em, uppercase): kickers, category tags, small caps metadata. Rationed (see rule).
- **Mono** (JetBrains Mono, 0.8125rem): admin tables, dense numeric contexts only.

### Named Rules
**The Mixed-Weight Headline Rule.** Emphasis inside a headline comes from weight, size, or an Instrument Serif italic swap of the *same phrase*, never from a color gradient. A headline can mix Sora 800 and a serif-italic word; it never uses `background-clip: text`.

**The Rationed Eyebrow Rule.** The small uppercase label above a heading is allowed at most once per ~3 sections, and never as automatic scaffolding above every block. The headline alone usually carries it. The `.eyebrow` class exists; its overuse is the tell, not the class.

**The Light-On-Dark Rule.** On navy/dark surfaces add 0.05–0.1 to line-height; light type reads lighter and needs the air.

## 4. Elevation

Mostly flat with intentional, hue-tinted lift. Surfaces sit on a faintly teal/navy-washed page so white cards read as elevated without heavy shadows. Shadows are tinted toward navy, never pure black, and respond to state (rest → hover) rather than decorating everything.

### Shadow Vocabulary
- **soft** (`0 1px 2px rgba(14,28,51,.04), 0 2px 8px rgba(14,28,51,.04)`): resting cards, quiet tool surfaces.
- **card** (`0 1px 3px rgba(14,28,51,.05), 0 8px 24px -8px rgba(14,28,51,.10)`): the canonical elevated card at rest.
- **lift** (`0 12px 32px -10px rgba(14,28,51,.22), 0 4px 12px -6px rgba(14,28,51,.10)`): hover state for interactive cards.
- **glow / glow-sm** (teal-tinted): reserved for the *primary* CTA only, and kept restrained. Not a default on every button.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest and lift on interaction. Depth comes from tonal layering (page wash → card) first, shadow second.

**The One-Glow Rule.** Teal glow signals the single most important action on a screen (the primary CTA, an active progress moment). Glow on every button is neon slop; remove it.

## 5. Components

### Buttons
- **Shape:** rounded-md (0.75rem) for md/lg, rounded-sm (0.5rem) for sm. One radius family across the app.
- **Primary:** teal-600 ground, white text, restrained teal glow that strengthens on hover to teal-500; `active:scale-[0.98]` for a physical press. The one loud button.
- **Secondary:** navy-900 ground, white text (press-black, confident, quieter than teal). Dark-mode: subtle white-alpha fill.
- **Ghost / Outline:** transparent / hairline border for tertiary actions; slate text that warms to navy on hover.
- **Hover/Focus:** 200ms ease-premium; always a visible `ring-2 ring-brand-400 ring-offset-2` focus-visible state.

### Badges / Chips
- **Style:** full-radius pill, 11px Sora label, tinted background + matching text + hairline border. Variants for category, status (success/warning/danger), and info (teal). Status pairs hue with an icon/label.
- **Category chips** on cards use the campaign's own accent restraint: tinted teal or neutral, never a rainbow.

### Cards / Containers
- **Corner Style:** rounded-xl (1.5rem) for campaign cards, rounded-2xl for surfaces.
- **Background:** paper (white) light / navy-900 dark.
- **Shadow:** `card` at rest, `lift` on hover for interactive cards; border hairline `slate-200/70` light, `white/10` dark.
- **Campaign card (signature):** full-bleed image with a navy scrim, creator avatar + name overlaid or directly beneath, title in Sora title weight, then a meaningful teal progress bar with raised (teal, tabular) and goal figures. Reads as a poster, never a database row. Hover lifts and warms the border to teal.

### Inputs / Fields
- **Style:** hairline slate border, paper ground, rounded-md, soft inner shadow, label set above the field (never placeholder-as-label).
- **Focus:** teal ring (`ring-4 ring-brand-100`) + teal-400 border. Dark: teal-500 alpha ring.
- **Error:** rose border + ring, error text below the field.

### Navigation (App Shell)
- **Topbar:** sticky frosted (backdrop-blur) header, single line, ≤72px tall. BrandMark left, theme toggle + notifications + "New campaign" CTA right.
- **Sidebar:** navy ground in dark / paper in light; active item carries a teal marker and tint, not a heavy fill.
- **States:** default slate, hover tint, active teal marker + ink text.

### Pledge / Donation Panel (signature)
A navy "press-black" header block over a paper body. Raised amount in large teal tabular Sora, progress bar, backer count, and a single loud teal CTA with the one allowed glow. This is where loud (poster) and calm (ledger) meet: expressive frame, unambiguous numbers.

## 6. Do's and Don'ts

### Do:
- **Do** lead every campaign with the creator: avatar, real name, and story before the numbers. Story first, numbers second, CTA third.
- **Do** push Sora to poster scale on brand surfaces (display up to ~5.5rem) and mix weights/serif-italic within a single headline for emphasis.
- **Do** keep teal as the only action ink and keep money figures teal and tabular.
- **Do** make progress bars communicate real momentum (real percentage, teal fill, restrained glow at the leading edge).
- **Do** drop to a calm volume on dashboard, admin, create/edit, and the pledge form: same tokens, less drama, maximum legibility.
- **Do** ship real campaign imagery (full-bleed, with navy scrim for text contrast); a colored block where a hero image belongs is a bug.
- **Do** maintain WCAG AA in both light and dark, and honor `prefers-reduced-motion`.

### Don't:
- **Don't** use gradient text (`background-clip: text` on a gradient). It is banned outright. Emphasize with weight, size, or serif-italic. (Retire `.text-gradient-brand`.)
- **Don't** put a tiny uppercase tracked eyebrow above every section. Ration to ~1 per 3 sections.
- **Don't** put neon teal glow on every button. Glow marks the single primary action only.
- **Don't** ship the generic fintech/SaaS template: flat corporate blue, the hero-metric template (big number + small label + supporting stats + gradient accent), or endless identical icon + heading + text card grids.
- **Don't** let campaign cards read as database rows. They are the hero; make them feel made by a person.
- **Don't** use em dashes in copy; use commas, colons, periods, or parentheses.
- **Don't** trade money clarity for drama. Goal, raised, progress, pledge are always unambiguous and honest.
- **Don't** be loud on every surface. Pace it; loudness is a tool, not a default.
- **Don't** use generic placeholder content (Jane Doe, Acme, "make a difference today").
