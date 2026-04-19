# Convaire — UI/UX Review Tasks

## Critical (Usability Blockers)

- [ ] **Mobile-responsive sidebar** — The sidebar is fixed at `w-[220px]` with `pl-[220px]` content offset and has no collapsible state or responsive breakpoint. Add a hamburger-triggered drawer below `md:`, and consider an icon-only collapsed mode at intermediate widths.
- [ ] **Wizard submit loading state** — The "Launch Campaign" and "Save as Draft" buttons in the campaign wizard have no spinner or disabled state during the async `finish()` call. Users can double-click and create duplicates. Add a `saving` state like the settings forms use.
- [ ] **Campaign table rows not clickable** — In `CampaignsList`, rows only have a "..." dropdown for navigation. Users expect to click a row to view details. Make entire rows clickable with `router.push` and add a visible hover state.

## High Priority (Friction Points)

- [ ] **Header breadcrumbs show generic "Detail"** — `getDashboardPageMeta` returns "Detail" for campaign pages instead of the actual campaign name. Pass the campaign name into the breadcrumb trail for better wayfinding.
- [ ] **Remove or label placeholder notifications bell** — The header bell icon opens a dropdown that permanently says "nothing new yet" with no way to dismiss. Either remove it until notifications are implemented or add a "(coming soon)" label.
- [ ] **Add brand icon to sidebar header** — The `AuthMark` (phone icon in rounded square) is used on auth pages but not in the dashboard sidebar. Place it next to "Convaire" for brand continuity.
- [ ] **Twilio warning banner uses hardcoded color** — The campaign wizard's Twilio-not-connected banner uses `text-amber-200` instead of design tokens. Replace with `text-foreground` or a semantic token so it works if a light mode is ever added.

## Medium Priority (Polish)

- [ ] **Settings page missing top-level heading** — `/dashboard/settings` jumps straight into the Account card with no page title + description, unlike Campaigns and Phone Numbers. Add a "Settings" heading with a brief description to match the pattern.
- [ ] **Deduplicate StatCard components** — `dashboard-overview.tsx` and `campaign-detail.tsx` each define their own `StatCard` with slightly different styling (`rounded-xl` vs `rounded-lg`, different padding). Extract a shared component to `components/ui/`.
- [ ] **Inconsistent form input heights** — Some wizard inputs explicitly set `h-9 bg-background` while others (especially `type="time"` in Schedule) rely on browser defaults. Standardize all inputs to `h-9 bg-background`.
- [ ] **Phone numbers page — upgrade number list** — The list of Twilio numbers is a plain `<ul>` below the select dropdown. Use the existing `Table` component with columns for Number, Friendly Name, and a "Default" badge indicator. This scales better and sets up for per-number actions.
- [ ] **Keyboard/focus management in wizard** — No auto-focus on step change, no `Enter` to advance, no `Escape` to go back. Auto-focus the first input on each step and add keyboard shortcuts for navigation.
- [ ] **Delete account uses raw Dialog instead of ConfirmDialog** — `delete-account-section.tsx` builds its own dialog instead of reusing the `ConfirmDialog` component used elsewhere. Refactor for consistency.

## Low Priority (Refinements)

- [ ] **Auth page mount animation** — Login/signup cards appear without entrance animation. Add a subtle `animate-in fade-in slide-in-from-bottom-2` to match the wizard transition polish.
- [ ] **Sidebar avatar personalization** — The `AvatarFallback` uses email initials on a flat muted background. Generate a gradient or color from the email hash for more personality.
- [ ] **Forgot-password page is a dead-end** — The page admits password reset isn't implemented and suggests creating a new account. Either hide the "Forgot password?" link from login or add a support contact email.
- [ ] **Table row hover visibility** — Campaign list and call log table rows have a very subtle hover state on the dark background. Increase to `hover:bg-accent/40` for better scannability.
- [ ] **Header height feels cramped** — Title + breadcrumbs in the `h-14` header with only `mt-0.5` between them is tight. Consider increasing to `h-16` or moving breadcrumbs above the title.

## Future Considerations

- [ ] Light mode support (the token system is mostly ready, but hardcoded colors like `text-amber-200` and `text-[#f22f46]` need replacing)
- [ ] Skeleton loading for campaign detail page (currently just a centered spinner)
- [ ] Transition animations between dashboard pages (e.g. shared layout transitions)
- [ ] Responsive table patterns for campaigns/calls on narrow viewports (card layout or horizontal scroll)
- [ ] Accessibility audit — skip links, ARIA live regions for toast notifications, focus trapping in dialogs
- [ ] Campaign wizard progress persistence (save draft state to localStorage so users don't lose work on accidental navigation)
