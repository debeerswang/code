import { NextResponse } from "next/server";
import { getClub, getClubActivities, type StravaClubActivity } from "@/lib/strava";
import { getSession } from "@/lib/session";

function activityDate(a: StravaClubActivity): Date | null {
  const s = a.start_date_local ?? a.start_date;
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

const MAX_PAGES = 25; // 25 × 200 = up to 5000 activities

async function fetchYTDActivities(accessToken: string, clubId: string): Promise<StravaClubActivity[]> {
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const all: StravaClubActivity[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await getClubActivities(accessToken, clubId, page, 200);
    if (batch.length === 0) break;

    // Include if no date (can't filter) or date is within this year
    const ytd = batch.filter((a) => {
      const d = activityDate(a);
      return d === null || d >= yearStart;
    });
    all.push(...ytd);

    // Stop if we've reached activities from before this year
    if (batch.some((a) => { const d = activityDate(a); return d !== null && d < yearStart; })) break;
  }

  return all;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const clubId = process.env.SNOW_WOLVES_CLUB_ID;
  if (!clubId) {
    return NextResponse.json({ error: "Club ID not configured" }, { status: 404 });
  }

  try {
    const [club, activities] = await Promise.all([
      getClub(session.access_token, clubId),
      fetchYTDActivities(session.access_token, clubId),
    ]);
    return NextResponse.json({ club, activities });
  } catch {
    return NextResponse.json({ error: "Failed to fetch club data" }, { status: 500 });
  }
}
