"use client";

import { useEffect, useState } from "react";
import type { StravaActivity } from "@/lib/strava";
import { StatCard } from "./StatCard";
import { ActivityChart } from "./ActivityChart";
import { ActivityList } from "./ActivityList";
import { ActivityDetail } from "./ActivityDetail";
import { SportBreakdown } from "./SportBreakdown";
import { ClubDashboard } from "./ClubDashboard";

interface DashboardClientProps {
  athleteName: string;
  athleteProfile: string;
}

interface WeeklyData {
  week: string;
  distance: number;
  count: number;
}

interface SportData {
  name: string;
  count: number;
  distance: number;
}

function metersToMi(m: number) {
  return m / 1609.344;
}

function getWeeklyData(activities: StravaActivity[]): WeeklyData[] {
  const weeks = new Map<string, { distance: number; count: number }>();

  for (const a of activities) {
    const date = new Date(a.start_date_local);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const existing = weeks.get(key) || { distance: 0, count: 0 };
    existing.distance += metersToMi(a.distance);
    existing.count += 1;
    weeks.set(key, existing);
  }

  return Array.from(weeks.entries())
    .map(([week, data]) => ({ week, ...data }))
    .reverse();
}

function getSportBreakdown(activities: StravaActivity[]): SportData[] {
  const sports = new Map<string, { count: number; distance: number }>();

  for (const a of activities) {
    const existing = sports.get(a.type) || { count: 0, distance: 0 };
    existing.count += 1;
    existing.distance += metersToMi(a.distance);
    sports.set(a.type, existing);
  }

  return Array.from(sports.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);
}

type TimeWindow = "4W" | "3M" | "6M" | "1Y" | "All" | "Custom";

const TIME_WINDOWS: { label: string; value: TimeWindow }[] = [
  { label: "4 Weeks", value: "4W" },
  { label: "3 Months", value: "3M" },
  { label: "6 Months", value: "6M" },
  { label: "1 Year", value: "1Y" },
  { label: "All Time", value: "All" },
  { label: "Custom", value: "Custom" },
];

function getPresetTimestamps(window: TimeWindow): { after?: number; before?: number } {
  const now = Date.now();
  const days: Partial<Record<TimeWindow, number>> = {
    "4W": 28,
    "3M": 90,
    "6M": 180,
    "1Y": 365,
  };
  const d = days[window];
  return d !== undefined ? { after: Math.floor((now - d * 86400 * 1000) / 1000) } : {};
}

function toUnix(dateStr: string): number {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DashboardClient({
  athleteName,
  athleteProfile,
}: DashboardClientProps) {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("3M");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState(todayStr());
  const [appliedCustom, setAppliedCustom] = useState<{ from: string; to: string } | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null);
  const [activeTab, setActiveTab] = useState<"me" | "club">("me");

  async function fetchAllActivities(after?: number, before?: number) {
    const all: StravaActivity[] = [];
    let page = 1;
    while (true) {
      const params = new URLSearchParams({ per_page: "200", page: String(page) });
      if (after !== undefined) params.set("after", String(after));
      if (before !== undefined) params.set("before", String(before));
      const res = await fetch(`/api/strava/activities?${params}`);
      if (!res.ok) break;
      const batch: StravaActivity[] = await res.json();
      all.push(...batch);
      if (batch.length < 200) break;
      page++;
    }
    return all;
  }

  useEffect(() => {
    if (timeWindow === "Custom") return;
    async function load() {
      setLoading(true);
      try {
        const { after } = getPresetTimestamps(timeWindow);
        setActivities(await fetchAllActivities(after));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeWindow]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!appliedCustom) return;
    const { from, to } = appliedCustom;
    async function load() {
      setLoading(true);
      try {
        const after = from ? toUnix(from) : undefined;
        const before = to ? toUnix(to) + 86399 : undefined;
        setActivities(await fetchAllActivities(after, before));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [appliedCustom]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-lg animate-pulse">
          Loading your activities...
        </div>
      </div>
    );
  }

  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
  const totalTime = activities.reduce((sum, a) => sum + a.moving_time, 0);
  const totalElevation = activities.reduce(
    (sum, a) => sum + a.total_elevation_gain,
    0
  );
  const totalKudos = activities.reduce((sum, a) => sum + a.kudos_count, 0);
  const weeklyData = getWeeklyData(activities);
  const sportData = getSportBreakdown(activities);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {athleteProfile && (
            <img
              src={athleteProfile}
              alt={athleteName}
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{athleteName}&apos;s Dashboard</h1>
            <p className="text-gray-400 text-sm">
              {activities.length} activities
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Tabs */}
          <div className="flex bg-gray-800 rounded-full p-1 gap-1">
            <button
              onClick={() => setActiveTab("me")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === "me" ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              My Activities
            </button>
            <button
              onClick={() => setActiveTab("club")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === "club" ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Snow Wolves
            </button>
          </div>
          <a
            href="/api/auth/logout"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Disconnect
          </a>
        </div>
      </div>

      {/* Club Tab */}
      {activeTab === "club" && <ClubDashboard />}

      {/* My Activities Tab */}
      {activeTab === "me" && (
        <>
          {/* Time Window Selector */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {TIME_WINDOWS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTimeWindow(value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  timeWindow === value
                    ? "bg-orange-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
            {timeWindow === "Custom" && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={customFrom}
                  max={customTo || todayStr()}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="bg-gray-800 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-700 focus:outline-none focus:border-orange-500"
                />
                <span className="text-gray-500 text-sm">to</span>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  max={todayStr()}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="bg-gray-800 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-700 focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={() => setAppliedCustom({ from: customFrom, to: customTo })}
                  disabled={!customFrom}
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-orange-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-400 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon="📏"
              label="Total Distance"
              value={`${metersToMi(totalDistance).toFixed(1)} mi`}
              subtitle={`${(metersToMi(totalDistance) * 1.60934).toFixed(1)} km`}
            />
            <StatCard
              icon="⏱️"
              label="Total Time"
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
              icon="👍"
              label="Total Kudos"
              value={`${totalKudos}`}
              subtitle="Keep it up!"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2">
              <ActivityChart data={weeklyData} title="Weekly Distance" />
            </div>
            <SportBreakdown data={sportData} />
          </div>

          {/* Activity List */}
          <ActivityList activities={activities.slice(0, 20)} onSelect={setSelectedActivity} />

          {/* Activity Detail Modal */}
          {selectedActivity && (
            <ActivityDetail
              activity={selectedActivity}
              onClose={() => setSelectedActivity(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
