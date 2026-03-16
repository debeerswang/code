"use client";

import type { StravaActivity } from "@/lib/strava";

interface ActivityListProps {
  activities: StravaActivity[];
}

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

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters.toFixed(0)}m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

function formatPace(speedMs: number, type: string): string {
  if (type === "Ride" || type === "VirtualRide") {
    return `${(speedMs * 3.6).toFixed(1)} km/h`;
  }
  if (speedMs === 0) return "-";
  const paceSecsPerKm = 1000 / speedMs;
  const paceMin = Math.floor(paceSecsPerKm / 60);
  const paceSec = Math.floor(paceSecsPerKm % 60);
  return `${paceMin}:${paceSec.toString().padStart(2, "0")} /km`;
}

export function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-lg font-semibold">Recent Activities</h3>
      </div>
      <div className="divide-y divide-gray-800">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 px-6 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {sportIcons[activity.type] || "🏅"}
                </span>
                <div>
                  <div className="font-medium">{activity.name}</div>
                  <div className="text-gray-500 text-sm">
                    {new Date(activity.start_date_local).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-6 text-sm text-right">
                <div>
                  <div className="text-gray-400">Distance</div>
                  <div className="font-medium">
                    {formatDistance(activity.distance)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Time</div>
                  <div className="font-medium">
                    {formatDuration(activity.moving_time)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Pace</div>
                  <div className="font-medium">
                    {formatPace(activity.average_speed, activity.type)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Elev</div>
                  <div className="font-medium">
                    {activity.total_elevation_gain.toFixed(0)}m
                  </div>
                </div>
                {activity.average_heartrate && (
                  <div>
                    <div className="text-gray-400">HR</div>
                    <div className="font-medium">
                      {Math.round(activity.average_heartrate)} bpm
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
