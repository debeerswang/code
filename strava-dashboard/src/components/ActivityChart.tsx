"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface WeeklyData {
  week: string;
  distance: number;
  count: number;
}

interface ActivityChartProps {
  data: WeeklyData[];
  title: string;
}

export function ActivityChart({ data, title }: ActivityChartProps) {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="week"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "12px",
              color: "#fff",
            }}
            formatter={(value) => [`${Number(value).toFixed(1)} km`, "Distance"]}
          />
          <Bar
            dataKey="distance"
            fill="#FC4C02"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
