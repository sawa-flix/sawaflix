"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { TrendingUp, Users, Eye, Clock, DollarSign, UploadCloud, FileText } from "lucide-react";

export default function AnalyticsClient({ content = [] }) {
    // Helper to normalize dates across tables
    const getDate = (item) => new Date(item.submission_date || item.updated_at || item.created_at || new Date());

    const now = new Date();
    
    // --- TIME FILTERING (Step 4) ---
    // Last 30 Days
    const last30DaysContent = content.filter(item => {
        return (now - getDate(item)) <= 30 * 24 * 60 * 60 * 1000;
    });
    // Previous 30 Days (for comparison)
    const prev30DaysContent = content.filter(item => {
        const diff = now - getDate(item);
        return diff > 30 * 24 * 60 * 60 * 1000 && diff <= 60 * 24 * 60 * 60 * 1000;
    });

    // Calculated Stats
    const totalUploads = content.length;
    const recentUploads = last30DaysContent.length;
    const prevUploads = prev30DaysContent.length;
    
    // Calculate percentage change (+ or -)
    const getChangeStr = (current, previous) => {
        if (previous === 0) return current > 0 ? "+100%" : "0%";
        const percent = ((current - previous) / previous) * 100;
        return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
    };
    
    const uploadChange = getChangeStr(recentUploads, prevUploads);
    
    // Simulate Revenue based off total volume (Fallback since DB doesn't track earnings yet)
    const currentRevenue = recentUploads * 15; // e.g. $15 per post simulated
    const prevRevenue = prevUploads * 15;
    const revenueChange = getChangeStr(currentRevenue, prevRevenue);


    // --- DATA AGGREGATION FOR CHART (Step 3) ---
    // Group uploads by month for the line chart
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const groupedUploads = {};

    // Initialize last 6 months to 0 to ensure chart looks continuous
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        groupedUploads[monthNames[d.getMonth()]] = 0;
    }

    content.forEach(item => {
        const d = getDate(item);
        // Only count if within the last 6-7 months (to match our initialized keys)
        if ((now - d) <= 180 * 24 * 60 * 60 * 1000) { 
            const monthStr = monthNames[d.getMonth()];
            if (groupedUploads[monthStr] !== undefined) {
                groupedUploads[monthStr] += 1;
            }
        }
    });

    const uploadsData = Object.keys(groupedUploads).map(key => ({
        name: key,
        uploads: groupedUploads[key]
    }));

    // Demo Graphic Data (Static Placeholder as user hasn't tracked viewers)
    const demographicData = [
        { name: "18-24", value: 400 },
        { name: "25-34", value: 300 },
        { name: "35-44", value: 300 },
        { name: "45+", value: 200 },
    ];
    const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"];

    // Top Content sorted by recency placeholder (Top 5)
    const topContent = [...content].sort((a, b) => getDate(b) - getDate(a)).slice(0, 5);

    return (
        <div className="p-6 space-y-6 bg-transparent min-h-screen text-white">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Detailed Analytics</h1>
                <p className="text-gray-400">Deep dive into your content performance and audience.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Uploads", value: totalUploads.toString(), icon: UploadCloud, change: uploadChange, color: "text-blue-400" },
                    { label: "Recent Uploads (30d)", value: recentUploads.toString(), icon: FileText, change: uploadChange, color: "text-purple-400" },
                    { label: "Avg. Watch Time", value: "N/A", icon: Clock, change: "0%", color: "text-orange-400" }, // Mock parameter based off missing DB specs
                    { label: "Estimated Revenue", value: `$${currentRevenue}`, icon: DollarSign, change: revenueChange, color: "text-green-400" },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#111827] border border-gray-800 p-5 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-2 rounded-lg bg-gray-800/50 ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs">
                            <span className={stat.change.startsWith('-') ? 'text-red-400' : 'text-green-400'}>
                                {stat.change}
                            </span>
                            <span className="text-gray-500 ml-2">vs previous 30 days</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Growth Chart */}
                <div className="lg:col-span-2 bg-[#111827] border border-gray-800 p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">Upload Velocity (Last 6 Months)</h3>
                        <select className="bg-gray-800 border-none rounded-lg text-sm p-2 outline-none">
                            <option>Last 6 Months</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={uploadsData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="uploads"
                                    stroke="#ef4444"
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Demographics (Placeholder) */}
                <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                       <span className="px-4 py-2 border border-yellow-500/50 bg-yellow-500/10 text-yellow-500 text-sm font-bold tracking-widest rounded-full uppercase">Coming Soon</span>
                    </div>

                    <h3 className="text-lg font-semibold mb-6">Audience Demographics</h3>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={demographicData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {demographicData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {demographicData.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                    <span className="text-gray-400">{item.name}</span>
                                </div>
                                <span className="font-medium">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Content Table/List */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <h3 className="text-lg font-semibold">Latest Uploads (Simulated Metrics)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-500 text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 font-bold">Title</th>
                                <th className="px-6 py-4 font-bold">Type</th>
                                <th className="px-6 py-4 font-bold">Date Uploaded</th>
                                <th className="px-6 py-4 font-bold">Engagement (Mock)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {topContent.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No content available to analyze.</td>
                                </tr>
                            ) : topContent.map((row, i) => (
                                <tr key={row.id || i} className="hover:bg-gray-800/30 transition">
                                    <td className="px-6 py-4 font-medium text-white">{row.title || row.dish_name || "Untitled"}</td>
                                    <td className="px-6 py-4 text-gray-400 capitalize">{row.type}</td>
                                    <td className="px-6 py-4 text-gray-400">{getDate(row).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                {/* generate a random mockup width just to make the UI look alive since we lack this data */}
                                                <div className="h-full bg-red-500" style={{ width: `${Math.max(30, 95 - (i * 15))}%` }} />
                                            </div>
                                            <span className="text-xs text-gray-400">Wait</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
