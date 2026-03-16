"use client";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: string;
}

export function StatCard({ label, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-gray-400 text-sm font-medium">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {subtitle && <div className="text-gray-500 text-sm mt-1">{subtitle}</div>}
    </div>
  );
}
