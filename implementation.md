# Light Mode Theme Implementation

## Scope
This pass is intentionally limited to the light-mode visual layer. It does not change the dark theme values, the theme switch logic, or the Settings structure.

## Light-mode token set
The shared theme values now live in the light-mode override block inside [app/globals.css](app/globals.css):

- `--background` → soft off-white canvas
- `--background-secondary` → muted panel background
- `--background-elevated` → white elevated cards
- `--foreground` → near-black primary text
- `--foreground-secondary` → cool gray secondary text
- `--muted-foreground` / `--muted-foreground-strong` → subdued labels and metadata
- `--surface` / `--surface-hover` / `--surface-elevated` → card and control surfaces
- `--border` / `--border-subtle` → light dividers and outlines
- `--input-bg` / `--input-border` → form field styling
- `--primary` / `--primary-strong` / `--primary-soft` → red brand accents
- `--secondary` / `--accent` → supporting UI colors
- `--card-bg` → card surfaces
- `--success-*`, `--warning-*`, `--danger-*` → semantic status colors

These are only defined inside the `[data-theme="light"]` override, while the dark palette remains untouched in the base `:root` block.

## Where values are used
The first refactor pass applied these tokens to the account settings screen in [app/(dashboard)/dashboard/settings/page.tsx](app/(dashboard)/dashboard/settings/page.tsx), replacing hardcoded dark-mode colors such as:

- `bg-[#06080C]` → `bg-[color:var(--background)]`
- `text-white` → `text-[color:var(--foreground)]`
- `text-zinc-400` → `text-[color:var(--muted-foreground)]`
- `border-white/10` → `border-[color:var(--border)]`
- `bg-[#0E121A]/90` → `bg-[color:var(--surface-elevated)]`
- `bg-black/40` → `bg-[color:var(--background-secondary)]`
- `bg-red-500/10` → `bg-[color:var(--danger-bg)]`

This keeps the app themeable with a single token system without widening the task into a full theme-system rewrite.

## Before / after notes
Before:
- Several UI surfaces were hardcoded to near-black and white-only values that only worked in dark mode.
- Labels, borders, status pills, and buttons were using fixed dark palette values.
- The visual style was visually locked to the default dark theme.

After:
- Background, text, surface, and border colors are driven by CSS variables.
- The light theme derives from a softer YouTube-inspired palette without altering the dark theme defaults.
- The page remains consistent with the existing token model and avoids structural changes.

## Constraint reminder
This task intentionally does not:
- modify dark mode values
- change theme detection or switching behavior
- redesign Settings layout or add new settings controls
- change any system outside the visual light-mode pass
