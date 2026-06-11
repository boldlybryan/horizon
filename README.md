# Horizon

Drop static HTML/CSS/JS folders or zip files and deploy them to Vercel with custom `{slug}.navistone.dev` aliases.

## Setup

1. Copy `.env.example` to `.env.local` and fill in values.
2. Install dependencies:

```bash
npm install
```

3. Start the dev server:

```bash
npm run dev
```

## Required environment

- `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID`
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `HORIZON_BASE_DOMAIN` (default: `navistone.dev`)

Optional:

- `GOOGLE_ALLOWED_DOMAIN` to restrict sign-in to a Workspace domain
- `DISABLE_AUTH=true` — skip Google OAuth entirely (trusted internal use only)
- `DEV_USER_EMAIL` / `DEV_USER_NAME` — identity used in deployment meta when auth is disabled

## Google OAuth redirect

Add this redirect URI in Google Cloud Console:

- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://your-horizon-domain/api/auth/callback/google`
