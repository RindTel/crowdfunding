# Product

## Register

brand

> Split surface, single default. FundForge is a product (people back campaigns, run campaigns, moderate them), but this engagement treats design as the differentiator on every surface, so the default register is `brand`. The tool screens (dashboard, admin, create/edit, donation flow) still serve the task first; apply `product` discipline locally on those without dropping the editorial voice.

## Users

Three audiences share one platform:

- **Backers** browse and fund campaigns. Context: scrolling, often on mobile, scanning for something that earns their money and attention. They need to feel a real person is behind a campaign, see momentum at a glance, and trust the money path before they commit.
- **Creators** launch and run campaigns. Context: focused work sessions writing a story, setting a goal, watching pledges land, replying to backers. They need their identity and story to be the loudest thing on the page, and the management tools to be calm and unambiguous.
- **Admins / moderators** keep the platform healthy. Context: triage and review. They need dense information legibly, fast.

The job to be done: turn belief into funded reality. Backers want to back something that feels alive and made by a human. Creators want to be seen, not slotted into a database row.

## Product Purpose

FundForge is a crowdfunding platform. It exists to make individual campaigns feel authored and alive, not templated, so backers fund with conviction and creators feel represented. Success looks like: a backer can tell a campaign was made by a person within two seconds of seeing its card; a creator feels their story (not the platform) is the star; and the money mechanics (goal, raised, progress, pledge) stay unambiguous and trustworthy even as the surrounding design gets loud.

## Brand Personality

Human, editorial, energetic. Indie magazine meets campaign poster, engineered with ledger-grade clarity where money is involved.

- **Three words:** authored, urgent, trustworthy.
- **Voice:** plain-spoken and specific. Verbs over adjectives. It talks like a person who made something, not a platform that hosts things.
- **Emotional goals:** conviction (this is worth backing), momentum (this is happening now), and confidence (my money is handled cleanly). Story first, numbers second, CTA third.

## Anti-references

The four guardrails the user named, enforced everywhere:

- **No generic fintech / SaaS template.** No flat corporate-blue dashboard energy, no hero-metric template (big number + small label + supporting stats + gradient accent), no endless grids of identical icon + heading + text cards. Campaign cards must read as alive, never as database rows.
- **No AI-slop tells.** No gradient text (`background-clip: text` on a gradient is banned outright), no neon outer-glow on everything, no tiny uppercase tracked eyebrow above every section, no centered-hero-over-mesh-gradient, no stock-photo "Make a difference today" hero energy, no generic Jane-Doe / Acme placeholder content.
- **Not overdesigned or unusable.** Legibility and speed win on tool screens. Never trade backer confidence or money-handling clarity for visual drama.
- **Not cluttered or loud everywhere.** Energy is deliberate and paced, not maximalist on every surface. Loudness is a tool used where it earns attention, not a default.

## Design Principles

1. **Authored, not generated.** Every campaign should feel like a person made it. Kill anything that looks template-stamped. Break the grid deliberately where it serves a campaign; never by reflex.
2. **Story first, numbers second, CTA third.** Emotional hierarchy is fixed. The creator's face, name, and story lead. Money figures support. The action closes.
3. **Loud where it earns it, calm where it's used.** Marketing and campaign surfaces get poster energy; the tools people use to move money stay quiet, legible, and fast. Same system, different volume.
4. **Momentum is meaningful.** Progress and funding signals communicate real movement, never decoration. A progress bar is a fact about a campaign, not a flourish.
5. **Trust is non-negotiable at the money.** Goal, raised, progress, and pledge are always unambiguous, always tabular, always honest. The design can be expressive; the numbers cannot lie or jitter.

## Accessibility & Inclusion

- **Target WCAG 2.1 AA.** Body text ≥4.5:1, large text ≥3:1, against its actual (often tinted or dark) background. Money figures and CTAs get extra contrast headroom.
- **Full dark mode parity.** Class-based dark mode is a first-class theme, not an afterthought; hierarchy and brand recognition must hold in both modes.
- **Respect `prefers-reduced-motion`.** All entrance, scroll, and ambient motion collapses to a static or crossfade alternative.
- **Keyboard + focus.** Visible branded focus rings on every interactive element; dialogs trap focus and restore it.
- **Color is never the only signal.** Status (funded, pending, danger) carries an icon or label in addition to hue, for color-blind users.
