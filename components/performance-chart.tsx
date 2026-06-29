"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { weeklyTrend, teamGoal } from "@/lib/data";

export function PerformanceChart() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">June Performance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={weeklyTrend}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Actual"]}
            />
            <ReferenceLine
              y={teamGoal}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{ value: "Goal", position: "right", fontSize: 11, fill: "#f59e0b" }}
            />
            <Area
              type="monotone"
              dataKey="totalActual"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#colorActual)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ActivityChart() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyTrend} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="interviews" name="Interviews" fill="#6366f1" radius={[3, 3, 0, 0]} />
            <Bar dataKey="offers" name="Offers" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="hires" name="Hires" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
