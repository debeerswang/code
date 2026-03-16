import { NextResponse } from "next/server";
import { getAthleteStats } from "@/lib/strava";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const stats = await getAthleteStats(session.access_token, session.athlete.id);
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
