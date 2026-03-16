# Strava Dashboard

A Next.js dashboard that connects to your Strava account and displays your activity stats, weekly trends, and performance data.

## Features

- **Strava OAuth** — Securely connect your Strava account
- **Activity Stats** — Total distance, time, elevation gain, and kudos
- **Weekly Distance Chart** — Bar chart showing distance trends by week
- **Sport Breakdown** — Pie chart showing activity type distribution
- **Recent Activities** — Detailed list with pace, heart rate, and elevation

## Setup

### 1. Create a Strava API Application

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application
3. Set the **Authorization Callback Domain** to `localhost` (or your production domain)
4. Note your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Strava credentials:

```
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any_random_string
```

### 3. Install and Run

```bash
cd strava-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Connect with Strava** to authorize.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Recharts** for data visualization
- **Strava API v3**
