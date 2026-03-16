# Strava Dashboard

A Next.js dashboard that connects to your Strava account and displays personal activity stats as well as club-level data for the Snow Wolves club.

## Features

### My Activities Tab
- **Time window selector** — 4 Weeks, 3 Months, 6 Months, 1 Year, All Time, or a custom date range
- **Stats** — Total distance (miles), time, elevation gain, and kudos for the selected period
- **Weekly Distance Chart** — Bar chart showing distance per week
- **Sport Breakdown** — Pie chart of activity type distribution
- **Recent Activities** — Clickable list with pace, heart rate, and elevation; click any row to open a detail modal with a link to Strava

### Snow Wolves Club Tab
- **Week Panel** — Activities for any calendar week of the current year; navigate with prev/next arrows or the week dropdown; defaults to the current week
- **YTD Stats** — Year-to-date distance, time, elevation, and active member count
- **Weekly Distance Chart** — All weeks from Jan 1 to today
- **Sport Breakdown** — Activity type distribution across the club
- **YTD Leaderboard** — Members ranked by total distance with activity count, time, and elevation

## Setup

### 1. Create a Strava API Application

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application
3. Set the **Authorization Callback Domain** to `localhost` (for local dev)
4. Note your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any_random_string
SNOW_WOLVES_CLUB_ID=your_club_numeric_id
```

`SNOW_WOLVES_CLUB_ID` is the numeric ID found in the club's Strava URL:
`https://www.strava.com/clubs/YOUR_ID`

### 3. Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Connect with Strava** to authorize.

## Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Recharts** — data visualization
- **Strava API v3**
