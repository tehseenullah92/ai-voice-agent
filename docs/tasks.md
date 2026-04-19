# Convaire — Product Design Tasks

## Critical

- [x] **Dashboard onboarding experience** — Replace the empty Overview page with a setup progress card (Connect Twilio → Sync Numbers → Create Campaign). Add stat cards (Active Campaigns, Calls Today, Answer Rate) showing 0 initially. Include a welcome banner with user name and a primary CTA that adapts based on setup state.
- [ ] **Responsive/mobile layout for dashboard** — The sidebar is fixed at 220px with no collapsible state. Below ~768px the app is unusable. Add a collapsible sidebar with a hamburger trigger at the `md` breakpoint using shadcn's `Sheet` for a slide-out mobile nav. This is the single biggest UX gap.
- [ ] **Fix or remove Forgot Password dead end** — The forgot-password page says "Email-based password reset is not set up yet." A link that leads to "we can't help you" is worse than no link. Either implement email-based password reset or remove the "Forgot password?" link from the login form entirely.

## High

- [x] **Empty states for all list pages** — Design purpose-built empty states for Campaigns list, Phone Numbers, and Call Logs. Each should have a centered icon/illustration, descriptive headline, body text, and a primary CTA (e.g. "Create your first campaign").
- [x] **Replace window.confirm with custom dialogs** — Swap native browser confirm dialogs for campaign delete, campaign restart, and Twilio disconnect with custom shadcn Dialog components that match the dark theme.
- [x] **Campaign wizard validation feedback** — Add inline per-field error messages when the user tries to advance a step. Show which fields are missing instead of silently disabling the Continue button.
- [x] **Remove or fix non-functional UI elements** — Either implement or remove: the header bell icon (notifications), voice preview play buttons in the wizard, and the header avatar (add a dropdown menu or remove it).
- [ ] **Add loading state to campaign wizard save/launch** — The `finish()` function has no pending state. Clicking "Save as Draft" or "Launch Campaign" shows no spinner or disabled state, inviting double-clicks. Add a `submitting` state that disables both buttons and shows a loading indicator on the active one.
- [ ] **Remove placeholder notification bell** — The header bell icon opens a permanently empty dropdown. Remove it entirely until notifications are implemented — a permanently empty feature feels broken, not upcoming.
- [ ] **Paginate campaign call logs** — The call logs table loads all calls at once. For campaigns with thousands of contacts this will break. Add server-side pagination or a "Load more" button, limiting the initial fetch to ~50 rows.
- [ ] **Improve post-launch feedback** — After clicking "Launch Campaign," the user is redirected to the campaigns list with a toast that's easily missed. Redirect to the campaign detail page (`/dashboard/campaigns/${id}`) instead, so the user can see the status change to "Active" and watch calls begin.

## Medium

- [x] **Login / Signup polish** — Add a logo or branded icon above "Convaire". Unify the tagline across auth pages. Add inline password strength indicator on signup. Add a "Forgot password?" link on login.
- [x] **Fix redundant navigation elements** — Deduplicate the avatar (header vs sidebar footer). Make one of them a dropdown with profile info, settings, and log out. Remove the other. Add a separator before Settings in the sidebar.
- [x] **Campaigns list loading & UX** — Replace "Loading…" text with shimmer skeleton rows. Add type icons or color coding to the Type column. Plan for search/filter as campaign count grows.
- [x] **Campaign wizard improvements** — Add a "Download sample CSV" link in the Contacts step. Hide the Back button on Step 1 instead of disabling it. Replace the disabled Switch on the Review step with a plain text "Yes/No" display.
- [x] **Phone Numbers loading & messaging** — Add a spinner to the loading state. Adapt the page description when Twilio isn't connected ("Connect your Twilio account to manage phone numbers").
- [x] **Settings page structure** — Add sections for Account (email, password change), Workspace (name, default timezone), and a danger zone (account deletion). Currently Settings is only Twilio.
- [ ] **Extract shared StatCard component** — There are two separate `StatCard` implementations (dashboard-overview.tsx and campaign-detail.tsx) that are visually similar but structurally different. Extract a single reusable `StatCard` into `components/dashboard/` to prevent drift and reduce maintenance.
- [ ] **Add descriptions to campaign types** — The type buttons (Outbound Sales, Appointment Reminder, etc.) are just labels with no context. Users won't know if choosing a type changes agent behavior or is just metadata. Add a one-line description under each type or a tooltip.
- [ ] **Calling hours input guardrails** — Users can set calling hours from 22:00 to 06:00 (overnight) or both to the same time with no warning. Show a validation warning if the window is under 1 hour or spans overnight, and validate that `callingTo > callingFrom`.
- [ ] **Unify brand mark across auth and favicon** — The auth pages use a generic `PhoneCall` Lucide icon. The favicon is a blue "C" lettermark. These don't match. Use the same mark consistently, or replace both with a proper wordmark.
- [ ] **Add keyboard shortcut to campaign search** — The search input in the campaigns list has no `Cmd+K` or `/` shortcut to focus it. For a power-user tool this is a quality-of-life miss.

## Low

- [x] **Visual design refinements** — Added `--success` and `--warning` CSS tokens with Tailwind config. Bumped `text-[11px]` to `text-[12px]` for body text in sidebar email, wizard review note, and stat card subtext.
- [x] **Add a favicon** — Created `app/icon.svg` (blue rounded square with "C" lettermark) and added `icons` to root layout metadata.
- [x] **Estimated duration accuracy** — Updated `formatEstimatedDuration` to accept calling window hours (`callingFrom`/`callingTo`) and calculate multi-day estimates based on daily calling window instead of assuming 24h/day.
- [x] **Breadcrumb on Dashboard home** — Changed the `/dashboard` breadcrumb label from "Dashboard" to "Overview" to eliminate redundancy with the page title.
- [ ] **Fix sidebar/breadcrumb naming inconsistency** — Sidebar nav label says "Dashboard" but the breadcrumb on that page says "Overview" and the header title says "Dashboard." Align the labeling across all three.
- [ ] **Audit small text contrast for WCAG AA** — `11px` stat card labels in `text-muted-foreground` (`#9ca3af`) on `bg-card/40` backgrounds are borderline for contrast. Bump to 12px and verify contrast ratios meet 4.5:1 minimum.
- [ ] **Add dark/light mode toggle** — The app hardcodes `dark` on `<html>`. `next-themes` is already installed but unused. Add a toggle in settings or the sidebar footer for users who prefer light mode.
- [ ] **Prevent campaign wizard/edit form drift** — `campaign-edit-form.tsx` and `campaign-wizard.tsx` maintain separate form implementations. The wizard exports `StepBasics`, `StepAgent`, `StepSchedule` for reuse — ensure the edit form actually reuses them so create and edit don't diverge.

## Future Considerations

- [ ] Campaign analytics dashboard with answer rate trends and call activity charts
- [ ] Inline audio player for call playback in the call detail dialog
- [ ] Campaign duplication (clone a campaign instead of rebuilding)
- [ ] Reusable contact list management across campaigns
- [ ] Activity feed / timeline on the dashboard
- [ ] Keyboard shortcuts for power users (beyond campaign search)
- [ ] Pagination for campaigns list
- [ ] Social login / SSO for B2B teams (Google OAuth, SAML)
