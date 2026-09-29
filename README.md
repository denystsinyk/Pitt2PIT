# Pitt2PIT

Pitt2PIT helps University of Pittsburgh students find airport carpools. The current backend foundation covers authenticated account profiles; ride requests and matching will come later.

## Current architecture

- Supabase Auth creates student accounts and manages passwords and email confirmation.
- The Go API verifies Supabase access tokens and owns reads and writes to `public.users`.
- Profiles contain a name, phone number, and preferred campus pickup location.
- Profile endpoints are `GET /api/profile` and `PUT /api/profile`. Both require `Authorization: Bearer <supabase-access-token>`.
- `GET /health` is an unauthenticated health check.

`PUT /api/profile` creates or updates the authenticated user's profile. The user ID and email come from the verified Supabase session; clients cannot choose another user's ID. The API only accepts `@pitt.edu` accounts.

## Local setup

1. Create a Supabase project and apply `supabase/migrations/001_create_users_table.sql` and `supabase/migrations/005_email_domain_restriction.sql`.
2. Copy `backend/.env.example` to `backend/.env` and set the Supabase project URL, anon key, and service role key. Keep the service role key private.
3. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL=http://localhost:8000` in the frontend environment.
4. Run the API from `backend/` with `go run .`.
5. Run the frontend from `frontend/` with `npm install` and `npm run dev`.

The API requires Go 1.22 or later. Configure `CORS_ORIGINS` as a comma-separated list of allowed frontend origins and `PORT` for the listening port.

## Deployment

Deploy the `backend/` directory as the service root. Railway builds the binary with `go build -o server .` and starts `./server`. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `CORS_ORIGINS` in the service environment. Set the frontend's `VITE_API_URL` to the deployed API origin.

## Deferred

The existing ride-group migrations and frontend screens are retained as historical scaffolding, but the Go API does not yet expose ride endpoints. Ride requests, matching, and group coordination are future work.
