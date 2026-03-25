# Synchria Pilot

Minimal one-campus pilot app for weekly matched conversations.

## Product shape
- User pages:
  - `/` (welcome + mechanism)
  - `/auth` (register/login)
  - `/setup` (weekly setup, editable until Tuesday 11:59 PM)
  - `/status` (this week only: status + meeting + feedback)
  - `/history` (match history + personal discussion-entry history)
- Admin page:
  - `/admin`

## Weekly timeline
- Tuesday 11:59 PM: setup closes
- Late Tuesday / early Wednesday: matching run + notifications
- Thu/Fri/Sat: meetings
- Post-meeting: feedback + optional new prompt proposals

## Auth + privacy
- Account + password required for participant pages.
- Session cookie is HTTP-only.
- Setup, status, history, and feedback APIs now use authenticated user identity (no email query/body inputs).

## Stack
- Next.js App Router + TypeScript
- Supabase (Postgres)
- Resend (optional email)
- Whereby links generated per group

## 1) Configure env
Copy `.env.example` to `.env.local` and fill:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_DASHBOARD_KEY`
- `CRON_SECRET` (for scheduled matching run)
- Optional for emails:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`

## 2) Create / update DB tables
Run SQL in `supabase/schema.sql` inside Supabase SQL editor.

Important: run the updated schema again so auth tables (`pilot_users`, `pilot_sessions`) and new columns are created.

## 3) Install + run
```bash
npm install
npm run dev
```

## 4) Use the app
- Students:
  - create account / login at `/auth`
  - submit/edit setup at `/setup` (until Tuesday 11:59 PM)
  - check this week and submit feedback at `/status`
  - check match/discussion history at `/history`
- Founder:
  - open `/admin`
  - enter `ADMIN_DASHBOARD_KEY`
  - click `Run Matching + Send Emails`

## API routes
- `GET /api/cycle`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/setup`
- `POST /api/setup`
- `GET /api/status`
- `GET /api/history`
- `POST /api/feedback`
- `GET /api/admin/overview` (admin key required)
- `POST /api/admin/run-matching` (admin key/cron secret required)

## Deploy (Vercel)
1. Push repo to GitHub.
2. Import to Vercel.
3. Add all env vars in project settings.
4. Deploy.

## Optional scheduled matching (late Tuesday / early Wednesday)
- Configure cron to `POST /api/admin/run-matching` with header:
  - `Authorization: Bearer <CRON_SECRET>`

## Notes
- If `RESEND_API_KEY` is missing, email sends are skipped and logged.
- Matching algorithm is intentionally simple for pilot phase.
- Matching reason is a placeholder explanation for now.
