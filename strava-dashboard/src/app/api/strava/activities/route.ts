import { NextRequest, NextResponse } from "next/server";
import { getActivities } from "@/lib/strava";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const page = Number(request.nextUrl.searchParams.get("page") || "1");
  const perPage = Number(request.nextUrl.searchParams.get("per_page") || "50");

  try {
    const activities = await getActivities(session.access_token, page, perPage);
    return NextResponse.json(activities);
  } catch {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
