"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", views: 120 },
  { day: "Tue", views: 180 },
  { day: "Wed", views: 240 },
  { day: "Thu", views: 190 },
  { day: "Fri", views: 260 },
  { day: "Sat", views: 320 },
  { day: "Sun", views: 280 },
];

export default function PerformanceChart() {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">

      <h3 className="text-lg font-semibold mb-4">
        Performance Over Time
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1f2937" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#ef4444"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
