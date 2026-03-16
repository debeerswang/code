# Code

A collection of projects and utilities.

## Projects

### [Strava Dashboard](./strava-dashboard)

A Next.js dashboard that connects to your Strava account and visualizes your fitness data.

- **OAuth integration** with Strava for secure account connection
- **Stats overview** — total distance, time, elevation gain, kudos
- **Weekly distance chart** — bar chart of distance trends over time
- **Sport breakdown** — donut chart of activity type distribution (Run, Ride, Swim, etc.)
- **Recent activities** — detailed list with pace, heart rate, elevation, and duration

#### Quick Start

```bash
cd strava-dashboard
cp .env.local.example .env.local
# Add your Strava API credentials to .env.local
npm install
npm run dev
```

See the [Strava Dashboard README](./strava-dashboard/README.md) for full setup instructions.

#### Tech Stack

- Next.js 16 (App Router) / TypeScript
- Tailwind CSS v4
- Recharts
- Strava API v3
