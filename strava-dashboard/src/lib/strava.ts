const STRAVA_API_BASE = "https://www.strava.com/api/v3";
const STRAVA_AUTH_BASE = "https://www.strava.com/oauth";

export function getAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/strava`,
    response_type: "code",
    scope: "read,activity:read_all,profile:read_all",
  });
  return `${STRAVA_AUTH_BASE}/authorize?${params}`;
}

export async function exchangeToken(code: string) {
  const res = await fetch(`${STRAVA_AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error("Token exchange failed");
  return res.json();
}

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${STRAVA_AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error("Token refresh failed");
  return res.json();
}

export async function getAthleteStats(accessToken: string, athleteId: number) {
  const res = await fetch(`${STRAVA_API_BASE}/athletes/${athleteId}/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function getActivities(accessToken: string, page = 1, perPage = 30, after?: number, before?: number) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (after !== undefined) params.set("after", String(after));
  if (before !== undefined) params.set("before", String(before));
  const res = await fetch(`${STRAVA_API_BASE}/athlete/activities?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
}

export async function getAthlete(accessToken: string) {
  const res = await fetch(`${STRAVA_API_BASE}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch athlete");
  return res.json();
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  suffer_score?: number;
  kudos_count: number;
}

export interface StravaClubActivity {
  athlete: { firstname: string; lastname: string };
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date_local?: string;
  start_date?: string;
}

export interface StravaClub {
  id: number;
  name: string;
  profile: string;
  description: string;
  sport_type: string;
  city: string;
  state: string;
  country: string;
  member_count: number;
}

export async function getClub(accessToken: string, clubId: string) {
  const res = await fetch(`${STRAVA_API_BASE}/clubs/${clubId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch club");
  return res.json() as Promise<StravaClub>;
}

export async function getClubActivities(accessToken: string, clubId: string, page = 1, perPage = 200) {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const res = await fetch(`${STRAVA_API_BASE}/clubs/${clubId}/activities?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch club activities");
  return res.json() as Promise<StravaClubActivity[]>;
}

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
  city: string;
  state: string;
  country: string;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: StravaAthlete;
}
