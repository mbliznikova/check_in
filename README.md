# Check-in

Multi-platform attendance and class management frontend for studios and schools.

Check-in helps studio and school owners run their daily operations: check students in through a kiosk terminal, track attendance, manage class schedules, pricing, and track payments — all from a single platform that supports multiple locations under one account.

The backend (Django + DRF, PostgreSQL) lives in a [separate repository](https://github.com/mbliznikova/check_in_backend).

## Screenshots

| Kiosk check-in | Attendance | Payments |
|---|---|---|
| ![Kiosk check-in screen](screenshots/check-in.png) | ![Attendance screen](screenshots/attendance.png) | ![Payments screen](screenshots/payments.png) |

| Classes | Week calendar |
|---|---|
| ![Classes screen](screenshots/classes.png) | ![Week calendar](screenshots/week-calendar.png) |

## Features

- **Kiosk check-in** — dedicated kiosk mode for unattended tablet terminals, restricted to check-in only
- **Class scheduling** — define recurring classes with weekly schedules and browse dated occurrences in a week-view and day-view calendar
- **Attendance tracking** — per-class attendance history with student and class snapshots
- **Attendance confirmation** — teachers confirm or adjust check-ins, 24 hours policy is considered
- **Payment management** — per-class pricing, payment records, and monthly summaries
- **Multi-school support** — switch between schools, each school's data is fully isolated
- **Staff management** — invite staff by email, manage roles and access from within the app
- **Role-based access** — four-tier permission model (owner → admin → teacher → kiosk) controls which tabs and actions are available

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native, Expo |
| Language | TypeScript |
| Routing | Expo Router (file-based) |
| Auth | Clerk (`@clerk/clerk-expo`) |
| Platforms | iOS, Android, Web |
| Analytics | Mixpanel |

## Architecture

### Role-based navigation

Tab visibility is resolved at runtime from the `/me/` API response. The kiosk role sees only the check-in tab. Teacher, admin, and owner see the full tab bar. No client-side role logic is duplicated — the server is the source of truth.

### Centralized API client

`api/client.tsx` is the single entry point for all requests. It automatically attaches the Clerk Bearer token and the `X-School-ID` header (from context), and blocks requests behind a `schoolReady` promise so no screen fires before the school context is loaded.

### Custom hooks for data layers

Business logic and API calls are extracted into three domain hooks — `useClassData`, `useClassSchedules`, and `useClassOccurrences` — keeping screen components thin orchestrators rather than data managers.

### Platform-specific components

Native UI elements (tab bar background, SF Symbols icons) use `.ios.tsx` / `.web.ts` file variants so the shared component tree stays clean across platforms.

## Status

In active development. Production launch coming soon.
