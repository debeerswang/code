"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface SportData {
  name: string;
  count: number;
  distance: number;
}

interface SportBreakdownProps {
  data: SportData[];
}

const COLORS = ["#FC4C02", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

export function SportBreakdown({ data }: SportBreakdownProps) {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <h3 className="text-lg font-semibold mb-4">Activity Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="count"
            nameKey="name"
            paddingAngle={3}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "12px",
              color: "#fff",
            }}
            formatter={(value, name) => [
              `${value} activities`,
              name,
            ]}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: "#9ca3af" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
