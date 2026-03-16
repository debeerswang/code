"use client";

import { useEffect, useState } from "react";
import type { StravaClub, StravaClubActivity } from "@/lib/strava";
import { StatCard } from "./StatCard";
import { SportBreakdown } from "./SportBreakdown";
import { ActivityChart } from "./ActivityChart";

const sportIcons: Record<string, string> = {
  Run: "🏃",
  Ride: "🚴",
  Swim: "🏊",
  Walk: "🚶",
  Hike: "🥾",
  WeightTraining: "🏋️",
  Yoga: "🧘",
  Workout: "💪",
};

function metersToMi(m: number) {
  return m / 1609.344;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDistance(meters: number): string {
  const miles = meters / 1609.344;
  if (miles < 0.1) return `${meters.toFixed(0)} m`;
  return `${miles.toFixed(2)} mi`;
}

// Format a Date as "YYYY-MM-DD" using LOCAL date parts (avoids UTC timezone shift)
function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Returns Monday key for a dateStr. Treats the date portion as local to avoid TZ issues.
function getMondayKey(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  // Use only the YYYY-MM-DD portion so timezone suffixes don't shift the date
  const datePart = dateStr.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;
  const [y, mo, d] = datePart.split("-").map(Number);
  const date = new Date(y, mo - 1, d); // constructed in local time
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return localDateKey(new Date(y, mo - 1, d + diff));
}

function getMondayKeyFromDate(date: Date): string {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return localDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff));
}

// All Monday-keys from Jan 1 of this year up to and including current week
function getAllWeeksYTD(): { key: string; label: string }[] {
  const today = new Date();
  const year = today.getFullYear();
  const thisWeekKey = getMondayKeyFromDate(today);

  const weeks: { key: string; label: string }[] = [];
  // Find Monday on or before Jan 1
  const jan1 = new Date(year, 0, 1);
  const d = jan1.getDay();
  let cur = new Date(year, 0, 1 + (d === 0 ? -6 : 1 - d));

  while (localDateKey(cur) <= thisWeekKey) {
    const key = localDateKey(cur);
    const label = cur.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    weeks.push({ key, label });
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
  }
  return weeks;
}

interface LeaderboardEntry {
  name: string;
  activities: number;
  distance: number;
  elevation: number;
  time: number;
}

function getLeaderboard(activities: StravaClubActivity[]): LeaderboardEntry[] {
  const map = new Map<string, LeaderboardEntry>();
  for (const a of activities) {
    const name = `${a.athlete.firstname} ${a.athlete.lastname}`;
    const existing = map.get(name) ?? { name, activities: 0, distance: 0, elevation: 0, time: 0 };
    existing.activities += 1;
    existing.distance += a.distance;
    existing.elevation += a.total_elevation_gain;
    existing.time += a.moving_time;
    map.set(name, existing);
  }
  return Array.from(map.values()).sort((a, b) => b.distance - a.distance);
}

export function ClubDashboard() {
  const [club, setClub] = useState<StravaClub | null>(null);
  const [activities, setActivities] = useState<StravaClubActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeekKey, setSelectedWeekKey] = useState(getMondayKeyFromDate(new Date()));

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/strava/club");
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Failed to load club");
          return;
        }
        const data = await res.json();
        setClub(data.club);
        setActivities(data.activities);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-gray-400 text-lg animate-pulse">Loading year-to-date club data…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-gray-400">{error}</p>
        {error === "Club ID not configured" && (
          <p className="text-gray-600 text-sm">
            Set <code className="text-orange-400">SNOW_WOLVES_CLUB_ID</code> in your{" "}
            <code className="text-orange-400">.env.local</code> to enable this tab.
          </p>
        )}
      </div>
    );
  }

  // Week grouping
  const thisWeekKey = getMondayKeyFromDate(new Date());
  const allWeeks = getAllWeeksYTD();

  // Weekly totals map
  const weekTotals = new Map<string, { distance: number; count: number }>(
    allWeeks.map(({ key }) => [key, { distance: 0, count: 0 }])
  );
  for (const a of activities) {
    const key = getMondayKey(a.start_date_local ?? a.start_date);
    const slot = key ? weekTotals.get(key) : undefined;
    if (slot) {
      slot.distance += metersToMi(a.distance);
      slot.count += 1;
    }
  }

  const weeklyChartData = allWeeks.map(({ key, label }) => {
    const slot = weekTotals.get(key)!;
    return { week: label, distance: parseFloat(slot.distance.toFixed(1)), count: slot.count };
  });

  // Selected week
  const selectedWeekActivities = activities.filter(
    (a) => getMondayKey(a.start_date_local ?? a.start_date) === selectedWeekKey
  );
  const selectedWeekDistance = selectedWeekActivities.reduce((s, a) => s + a.distance, 0);
  const selectedWeekTime = selectedWeekActivities.reduce((s, a) => s + a.moving_time, 0);

  const selectedWeekIdx = allWeeks.findIndex((w) => w.key === selectedWeekKey);

  // YTD totals
  const totalDistance = activities.reduce((s, a) => s + a.distance, 0);
  const totalTime = activities.reduce((s, a) => s + a.moving_time, 0);
  const totalElevation = activities.reduce((s, a) => s + a.total_elevation_gain, 0);
  const leaderboard = getLeaderboard(activities);

  const sportData = Array.from(
    activities.reduce((map, a) => {
      const existing = map.get(a.type) ?? { name: a.type, count: 0, distance: 0 };
      existing.count += 1;
      existing.distance += metersToMi(a.distance);
      map.set(a.type, existing);
      return map;
    }, new Map<string, { name: string; count: number; distance: number }>())
  )
    .map(([, v]) => v)
    .sort((a, b) => b.count - a.count);

  const yearLabel = new Date().getFullYear();

  return (
    <div>
      {/* Club Header */}
      {club && (
        <div className="flex items-center gap-4 mb-6">
          {club.profile && (
            <img src={club.profile} alt={club.name} className="w-12 h-12 rounded-full object-cover" />
          )}
          <div>
            <h2 className="text-xl font-bold">{club.name}</h2>
            <p className="text-gray-400 text-sm">
              {club.member_count} members · {club.city}, {club.country}
            </p>
          </div>
        </div>
      )}

      {/* Week Panel */}
      <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-6 mb-8">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedWeekKey(allWeeks[selectedWeekIdx - 1]?.key)}
              disabled={selectedWeekIdx === 0}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            <select
              value={selectedWeekKey}
              onChange={(e) => setSelectedWeekKey(e.target.value)}
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:outline-none focus:border-orange-500"
            >
              {allWeeks.map(({ key, label }) => {
                const sun = new Date(key);
                sun.setDate(sun.getDate() + 6);
                const rangeLabel = `${label} – ${sun.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
                return (
                  <option key={key} value={key}>
                    {key === thisWeekKey ? `This week (${rangeLabel})` : rangeLabel}
                  </option>
                );
              })}
            </select>
            <button
              onClick={() => setSelectedWeekKey(allWeeks[selectedWeekIdx + 1]?.key)}
              disabled={selectedWeekIdx === allWeeks.length - 1}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
            {selectedWeekKey !== thisWeekKey && (
              <button
                onClick={() => setSelectedWeekKey(thisWeekKey)}
                className="text-xs text-orange-400 hover:text-orange-300 ml-1 transition-colors"
              >
                Today
              </button>
            )}
          </div>
          <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
            {selectedWeekActivities.length} {selectedWeekActivities.length === 1 ? "activity" : "activities"}
          </span>
        </div>

        {selectedWeekActivities.length === 0 ? (
          <p className="text-gray-500 text-sm">No activities logged this week.</p>
        ) : (
          <>
            <div className="flex gap-6 mb-4 text-sm">
              <div>
                <div className="text-gray-400">Distance</div>
                <div className="font-semibold text-lg">{formatDistance(selectedWeekDistance)}</div>
              </div>
              <div>
                <div className="text-gray-400">Time</div>
                <div className="font-semibold text-lg">{formatDuration(selectedWeekTime)}</div>
              </div>
              <div>
                <div className="text-gray-400">Members</div>
                <div className="font-semibold text-lg">
                  {new Set(selectedWeekActivities.map((a: StravaClubActivity) => `${a.athlete.firstname} ${a.athlete.lastname}`)).size}
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-800 rounded-xl overflow-hidden border border-gray-800">
              {selectedWeekActivities.map((a: StravaClubActivity, i: number) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span>{sportIcons[a.type] ?? "🏅"}</span>
                    <div>
                      <div className="font-medium text-sm">{a.name}</div>
                      <div className="text-gray-500 text-xs">
                        {a.athlete.firstname} {a.athlete.lastname} ·{" "}
                        {(a.start_date_local ?? a.start_date)
                          ? new Date(a.start_date_local ?? a.start_date!).toLocaleDateString("en-US", {
                              weekday: "short", month: "short", day: "numeric",
                            })
                          : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-right">
                    <div>
                      <div className="text-gray-400 text-xs">Dist</div>
                      <div className="font-medium">{formatDistance(a.distance)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Time</div>
                      <div className="font-medium">{formatDuration(a.moving_time)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Elev</div>
                      <div className="font-medium">{a.total_elevation_gain.toFixed(0)}m</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* YTD Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="📏"
          label={`${yearLabel} Distance`}
          value={`${metersToMi(totalDistance).toFixed(1)} mi`}
          subtitle={`${(metersToMi(totalDistance) * 1.60934).toFixed(1)} km`}
        />
        <StatCard
          icon="⏱️"
          label={`${yearLabel} Time`}
          value={`${Math.floor(totalTime / 3600)}h ${Math.floor((totalTime % 3600) / 60)}m`}
          subtitle={`${activities.length} activities`}
        />
        <StatCard
          icon="⛰️"
          label="Elevation Gain"
          value={`${totalElevation.toFixed(0)}m`}
          subtitle={`${(totalElevation * 3.28084).toFixed(0)} ft`}
        />
        <StatCard
          icon="👥"
          label="Active Members"
          value={`${leaderboard.length}`}
          subtitle={`${yearLabel} YTD`}
        />
      </div>

      {/* Weekly Distance Chart + Sport Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <ActivityChart data={weeklyChartData} title={`Weekly Distance — ${yearLabel}`} />
        </div>
        <SportBreakdown data={sportData} />
      </div>

      {/* YTD Leaderboard */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-semibold">YTD Leaderboard</h3>
          <p className="text-gray-500 text-sm mt-0.5">{activities.length} activities since Jan 1</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                <th className="text-left px-6 py-3">#</th>
                <th className="text-left px-4 py-3">Athlete</th>
                <th className="text-right px-4 py-3">Activities</th>
                <th className="text-right px-4 py-3">Distance</th>
                <th className="text-right px-4 py-3">Time</th>
                <th className="text-right px-6 py-3">Elevation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {leaderboard.map((entry, i) => (
                <tr key={entry.name} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-3 text-gray-500 font-medium">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{entry.name}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{entry.activities}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{formatDistance(entry.distance)}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{formatDuration(entry.time)}</td>
                  <td className="px-6 py-3 text-right text-gray-300">{entry.elevation.toFixed(0)}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
