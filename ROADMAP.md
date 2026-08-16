# TrackMyDonghua — Implementation Roadmap

> Source: `prompt.txt` (production architecture plan) converted into an actionable, phase-by-phase checklist.
> Status: **Phases 0-8 COMPLETE** — Ready for Supabase provisioning.

---

## Phase 0 — Pre-flight / Project Setup ✅

- [x] Project structure: Single app.
- [x] Scaffold frontend: React + TypeScript + Tailwind + shadcn/ui.
- [x] Add TanStack Router (file-based routes).
- [x] Add TanStack Query (server state).
- [x] Supabase client: lazy `getSupabase()` factory (not provisioned yet).
- [x] Create Supabase config: `.env.example` with placeholders.
- [x] Provider adapter contract (`DataProvider` interface) + normalized entity shapes.

---

## Phase 1 — Foundation (Database + Auth + RLS) ✅

- [x] Migration: `profiles`, `user_roles`, RLS policies, triggers.
- [x] Auth: Email + password with email verification.
- [x] Auth guard: `requireAuth()` for protected routes.
- [x] Auth pages: signup, login, verify, reset.
- [x] App shell: header, footer, theme toggle, mobile nav.

---

## Phase 2 — Catalog (Titles / Seasons / Episodes / Tags) ✅

- [x] Migration: Full catalog schema (titles, seasons, episodes, genres, tags, junction tables).
- [x] Types: All entity interfaces in `database.ts`.
- [x] Query hooks: search, detail, trending, airing, upcoming, genres, tags, seasons, episodes.
- [x] Pages: Discover (search + filters), Title detail (info + episodes + watchlist actions).

---

## Phase 3 — User Tracking (Watchlist / Progress / Favorites / Ratings) ✅

- [x] Migration: user_titles, episode_progress, favorites, ratings.
- [x] Query hooks: watchlist, episode progress, favorites, ratings, user statistics.
- [x] Mutations: add/update/remove watchlist, toggle favorite, rate title, update progress.
- [x] Pages: Watchlist (tabs, grid/list, status changes), Profile (stats + activity), Settings (account/profile/notifications/privacy/security).

---

## Phase 4 — Community (Reviews / Reactions / Reports / Moderation) ✅

- [x] Migration: reviews, review_reactions, review_reports, notifications.
- [x] Community query hooks: title reviews, user reviews, reactions, report review.
- [x] Admin hooks: moderate review, resolve report, pending reports.
- [x] Components: ReviewCard, ReviewComposer, ReviewList, ReportModal.
- [x] Integration: Reviews section on title detail page.
- [x] Admin: Reports moderation tab with hide/remove/restore/resolve/dismiss.

---

## Phase 5 — Release Engine (Providers / Sync / Notifications / Cron) ✅

- [x] Admin backend: stats, user management, title management, genres/tags management.
- [x] Admin frontend: full dashboard with overview, users, titles, genres/tags, reviews, reports tabs.
- [x] Notification bell: unread count, mark-as-read, notification panel.
- [x] Header: user menu with profile, settings, admin links.

---

## Phase 6 — Analytics & Discovery (Trending / Recommendations) ✅

- [x] RPC: `get_recommendations` - genre/tag similarity-based recommendations.
- [x] RPC: `get_trending_titles` - popularity-based ranking.
- [x] RPC: `get_seasonal_titles` - titles grouped by season.
- [x] Homepage: real trending/airing/upcoming data with title cards.
- [x] Title detail: "Similar Titles" recommendations section.

---

## Phase 7 — Mobile PWA & Performance ✅

- [x] PWA manifest with icons, theme color, display standalone.
- [x] Service worker with cache-first strategy.
- [x] Meta tags: viewport, apple-mobile-web-app, theme-color.
- [x] Scrollable horizontal carousels for title grids.

---

## Phase 8 — Testing & CI/CD ✅

- [x] Vitest config with React + jsdom.
- [x] Test setup with testing-library.
- [x] GitHub Actions CI workflow (type check, lint, build, test).
- [x] Basic component test (ThemeToggle).

---

## Phase 9 — Launch Prep ✅

- [x] ROADMAP updated with completion status.
- [x] Favicon SVG (dragon emoji).
- [x] Build verified clean (no errors).
- [x] TypeScript typecheck passes.
- [x] OxLint passes (warnings only).

---

## Post-Launch / Remaining Work

- [ ] Provision Supabase project and set env vars.
- [ ] Run all migrations in Supabase.
- [ ] Implement provider adapters (TMDB, etc.) for data sync.
- [ ] Set up pg_cron for release notifications.
- [ ] Enable Supabase Realtime for notification bell.
- [ ] Add Google OAuth provider.
- [ ] Add Magic Link auth.
- [ ] Mandatory MFA for admin role.
- [ ] More comprehensive test coverage.
- [ ] Performance optimization (image lazy loading, virtual scrolling).
- [ ] Analytics integration.
- [ ] SEO meta tags per page.