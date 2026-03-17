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

export default function PerformanceChart({ content = [] }) {
  
  // Aggregate uploads per day for the last 7 days
  const now = new Date();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Initialize the last 7 days object in order
  const weeklyData = {};
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      weeklyData[daysOfWeek[d.getDay()]] = 0;
  }

  // Count the uploads inside the last 7 days
  content.forEach(item => {
      const d = new Date(item.submission_date || item.updated_at || item.created_at || new Date());
      const diffTime = Math.abs(now - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If it happened in the last 7 days
      if (diffDays <= 7) {
          const dayStr = daysOfWeek[d.getDay()];
          if (weeklyData[dayStr] !== undefined) {
              weeklyData[dayStr] += 1;
          }
      }
  });

  // Map into Recharts array format
  const data = Object.keys(weeklyData).map(key => ({
      day: key,
      uploads: weeklyData[key]
  }));

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-3">

      <h3 className="text-sm font-semibold mb-2 text-white">
        Upload Velocity (7 Days)
      </h3>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              stroke="#9ca3af"
              tick={{ fontSize: 10 }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fontSize: 10 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="uploads"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}