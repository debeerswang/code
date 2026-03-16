"use client";

import { useEffect, useState } from "react";
import type { StravaActivity } from "@/lib/strava";
import { StatCard } from "./StatCard";
import { ActivityChart } from "./ActivityChart";
import { ActivityList } from "./ActivityList";
import { SportBreakdown } from "./SportBreakdown";

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

function metersToKm(m: number) {
  return m / 1000;
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
    existing.distance += metersToKm(a.distance);
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
    existing.distance += metersToKm(a.distance);
    sports.set(a.type, existing);
  }

  return Array.from(sports.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);
}

export function DashboardClient({
  athleteName,
  athleteProfile,
}: DashboardClientProps) {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/strava/activities?per_page=100");
        if (res.ok) {
          setActivities(await res.json());
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
      <div className="flex items-center justify-between mb-8">
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
              {activities.length} recent activities
            </p>
          </div>
        </div>
        <a
          href="/api/auth/logout"
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          Disconnect
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="📏"
          label="Total Distance"
          value={`${metersToKm(totalDistance).toFixed(1)} km`}
          subtitle={`${(metersToKm(totalDistance) * 0.621371).toFixed(1)} mi`}
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
      <ActivityList activities={activities.slice(0, 20)} />
    </div>
  );
}
