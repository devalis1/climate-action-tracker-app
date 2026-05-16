# Design System: Open Earth Native Module

This design system is based on live inspection of `openearth.org` and `openearth.org/projects/citycatalyst` on May 16, 2026, plus the site's published Webflow CSS.

## Visual Direction

The app should feel like a product module inside the Open Earth ecosystem: dark planetary hero sections, high-contrast blue and green accents, large rounded image masks, contour-map texture, generous whitespace, and scientific dashboard surfaces that stay readable.

CityCatalyst specifically uses a deep blue field with satellite imagery, circular crops, subtle topographic line art, and neon green headings over blue gradients.

## Exact Color Palette

Core tokens extracted from the Open Earth CSS:

- `brand-black`: `#090909`
- `brand-bg`: `#00001f`
- `brand-bg-deep`: `#01012d`
- `brand-surface`: `#14275f`
- `brand-blue`: `#2352dc`
- `brand-accent`: `#62f58a`
- `brand-white`: `#ffffff`
- `brand-border`: `#c2c2c2`
- `brand-muted`: `#758696`

Supporting gradients and overlays observed on the live pages:

- CityCatalyst blue field: `#2352dc` into `#14275f` / `#00001f`
- Project fade: `linear-gradient(#01012d 30%, transparent)`
- Green text gradient: `#cde6a5` to `#86e3ce`
- Warm highlight gradient: `#db3d27` to `#ffb877`
- Glass panel: `rgba(255,255,255,0.10)` from `#ffffff1a`
- Green glow: `rgba(98,245,138,0.60)` from `#62f58a99`
- Blue glow: `rgba(35,82,220,0.30)` from `#2352dc4d`

Recommended app usage:

- Page background: `brand-bg` / `brand-bg-deep`
- Main content surfaces: `brand-white` for analysis content, `brand-surface` for dark cards
- Primary actions: transparent pill with `brand-accent` border and text, or filled `brand-blue`
- Metrics and positive state: `brand-accent`
- Focus rings and active tabs: `brand-blue`
- Subtle borders on light surfaces: `brand-border`

## Typography Rules

Open Earth uses two primary type families:

- Headers, navigation, buttons, labels: `Archia`
- Body copy and explanatory paragraphs: `DM Sans`
- Data-heavy app sections: add a monospace stack for metrics, code-like IDs, model traces, inventory values, and confidence scores. Use `JetBrains Mono` locally because it already appears in sibling dashboard work and pairs cleanly with the Open Earth look.

Type scale guidance:

- Hero H1: `Archia`, 600, tight line-height, very large on desktop.
- Section H2: `Archia`, 600, 48-80px desktop depending on density.
- Card headings: `Archia`, 600, 20-30px.
- Body: `DM Sans`, 400, 16-24px.
- Data labels: `JetBrains Mono`, 500, 12-14px, uppercase or small caps only when helpful.

## UI Characteristics

- Borders are deliberate and thin. Use `1px` borders for tabs, outlines, inputs, and value cards.
- Corners are mixed: cards use small radii (`6px` to `10px`), while buttons and badges are fully pill-shaped (`999px`).
- Hero imagery often uses large circular masks and orbital/circular motifs.
- Use transparent overlays rather than heavy filled blocks: `#ffffff1a`, `#00000040`, and gradient overlays over imagery.
- Use contour/topographic background texture at low opacity for climate/geospatial context.
- Drop shadows are soft but visible on cards: Open Earth uses `7px 7px 15px #00000040`.
- Tabs are text-led, with inactive tabs faded and active tabs using `brand-blue` plus a bottom border.
- Avoid generic SaaS blue-gray defaults. The distinct identity is black-blue base, royal blue field, neon spring green accents, circular Earth imagery, and Archia headings.

## Component Rules

- Hero: dark or blue background, large Archia title, circular or semi-circular image mask, optional down arrow.
- Cards: either white editorial surfaces on textured backgrounds or dark translucent surfaces for metrics.
- Buttons: pill radius, Archia label, generous horizontal padding, visible border.
- Dashboard data: keep charts and metric panels readable, but use Open Earth accents for status and focus rather than generic green/red palettes.
- Empty states: explain the climate action workflow, not only the missing data.

## Tailwind Token Mapping

When `tailwind.config.ts` is created, expose these tokens:

- `brand-bg`: `#00001f`
- `brand-bg-deep`: `#01012d`
- `brand-surface`: `#14275f`
- `brand-black`: `#090909`
- `brand-blue`: `#2352dc`
- `brand-accent`: `#62f58a`
- `brand-muted`: `#758696`
- `brand-border`: `#c2c2c2`
- `brand-glass`: `#ffffff1a`
- `brand-shadow`: `#00000040`
- `brand-green-soft`: `#cde6a5`
- `brand-cyan-soft`: `#86e3ce`

Use `font-heading` for Archia, `font-sans` for DM Sans, and `font-mono` for JetBrains Mono or a system monospace fallback.
