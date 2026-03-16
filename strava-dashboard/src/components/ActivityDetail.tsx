"use client";

import type { StravaActivity } from "@/lib/strava";

interface ActivityDetailProps {
  activity: StravaActivity;
  onClose: () => void;
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
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function formatDistance(meters: number): string {
  const miles = meters / 1609.344;
  if (miles < 0.1) return `${meters.toFixed(0)} m`;
  return `${miles.toFixed(2)} mi`;
}

function formatPace(speedMs: number, type: string): string {
  if (type === "Ride" || type === "VirtualRide" || type === "EBikeRide") {
    return `${(speedMs * 2.23694).toFixed(1)} mph`;
  }
  if (speedMs === 0) return "—";
  const paceSecsPerMile = 1609.344 / speedMs;
  const paceMin = Math.floor(paceSecsPerMile / 60);
  const paceSec = Math.floor(paceSecsPerMile % 60);
  return `${paceMin}:${paceSec.toString().padStart(2, "0")} /mi`;
}

interface StatRowProps {
  label: string;
  value: string;
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-800 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="font-medium text-sm">{value}</span>
    </div>
  );
}

export function ActivityDetail({ activity, onClose }: ActivityDetailProps) {
  const date = new Date(activity.start_date_local).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{sportIcons[activity.type] || "🏅"}</span>
            <div>
              <h2 className="font-semibold text-lg leading-tight">{activity.name}</h2>
              <p className="text-gray-400 text-sm mt-0.5">{date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors ml-4 mt-0.5"
          >
            ✕
          </button>
        </div>

        {/* Stats */}
        <div className="px-6 py-2">
          <StatRow label="Distance" value={formatDistance(activity.distance)} />
          <StatRow label="Moving Time" value={formatDuration(activity.moving_time)} />
          <StatRow label="Elapsed Time" value={formatDuration(activity.elapsed_time)} />
          <StatRow label="Avg Pace / Speed" value={formatPace(activity.average_speed, activity.type)} />
          <StatRow
            label="Max Speed"
            value={
              activity.type === "Ride" || activity.type === "VirtualRide"
                ? `${(activity.max_speed * 2.23694).toFixed(1)} mph`
                : formatPace(activity.max_speed, activity.type)
            }
          />
          <StatRow label="Elevation Gain" value={`${activity.total_elevation_gain.toFixed(0)} m`} />
          {activity.average_heartrate !== undefined && (
            <StatRow label="Avg Heart Rate" value={`${Math.round(activity.average_heartrate)} bpm`} />
          )}
          {activity.max_heartrate !== undefined && (
            <StatRow label="Max Heart Rate" value={`${Math.round(activity.max_heartrate)} bpm`} />
          )}
          {activity.suffer_score !== undefined && (
            <StatRow label="Suffer Score" value={String(activity.suffer_score)} />
          )}
          <StatRow label="Kudos" value={String(activity.kudos_count)} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800">
          <a
            href={`https://www.strava.com/activities/${activity.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium transition-colors"
          >
            View on Strava ↗
          </a>
        </div>
      </div>
    </div>
  );
}
