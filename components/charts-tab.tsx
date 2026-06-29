"use client";
import { TeamData } from "@/lib/types";
import { getProjectedEOM } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

interface Props { data: TeamData; }

export function ChartsTab({ data }: Props) {
  const { settings, recruiters } = data;

  // Per-recruiter data for starts chart
  const startsData = recruiters.map(r => ({
    name: r.name.split(" ")[0], // first name only for brevity
    "April": r.aprilStarts,
    "May": r.mayStarts,
    "June TD": r.juneStartsTD,
    "June Proj.": getProjectedEOM(r.juneStartsTD, settings.currentDay, settings.totalDays),
    target: r.juneTarget,
  })).sort((a,b) => b["May"] - a["May"]);

  // Per-recruiter data for quality chart
  const qualityData = recruiters.map(r => ({
    name: r.name.split(" ")[0],
    "April Quality": r.aprilQuality,
    "May Quality": r.mayQuality,
    "June Quality": r.juneQuality,
  })).sort((a,b) => b["June Quality"] - a["June Quality"]);

  // Team trend totals
  const trendData = [
    {
      month: "April",
      starts: recruiters.reduce((s,r) => s + r.aprilStarts, 0),
      avgQuality: Math.round(recruiters.reduce((s,r) => s + r.aprilQuality, 0) / recruiters.length * 10) / 10,
    },
    {
      month: "May",
      starts: recruiters.reduce((s,r) => s + r.mayStarts, 0),
      avgQuality: Math.round(recruiters.reduce((s,r) => s + r.mayQuality, 0) / recruiters.length * 10) / 10,
    },
    {
      month: "June Proj.",
      starts: Math.round(recruiters.reduce((s,r) => s + r.juneStartsTD, 0) / settings.currentDay * settings.totalDays),
      avgQuality: Math.round(recruiters.reduce((s,r) => s + r.juneQuality, 0) / recruiters.length * 10) / 10,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
          <p className="font-semibold text-slate-800 mb-1">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }}>
              {p.name}: <strong>{p.value}{p.name.includes("Quality") ? "%" : ""}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">

      {/* Team Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Team Starts Trend (Apr → May → Jun)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={260} stroke="#6366f1" strokeDasharray="4 4" label={{ value: "Target 260", position: "right", fontSize: 10, fill: "#6366f1" }} />
                <Bar dataKey="starts" name="Team Starts" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Team Avg Quality Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[55, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" label={{ value: "80% target", position: "right", fontSize: 10, fill: "#10b981" }} />
                <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "75% min", position: "right", fontSize: 10, fill: "#f59e0b" }} />
                <Bar dataKey="avgQuality" name="Avg Quality %" fill="#8b5cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Individual Starts Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Individual Starts — All 3 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={startsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="April"      fill="#94a3b8" radius={[3,3,0,0]} />
              <Bar dataKey="May"        fill="#3b82f6" radius={[3,3,0,0]} />
              <Bar dataKey="June TD"    fill="#6366f1" radius={[3,3,0,0]} />
              <Bar dataKey="June Proj." fill="#a5b4fc" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Individual Quality Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Individual Hire Quality — All 3 Months</CardTitle>
          <p className="text-xs text-muted-foreground">Dashed lines: 80% bonus threshold (green) and 75% min (amber)</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={qualityData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[55, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" />
              <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 4" />
              <Bar dataKey="April Quality"  fill="#94a3b8" radius={[3,3,0,0]} />
              <Bar dataKey="May Quality"    fill="#3b82f6" radius={[3,3,0,0]} />
              <Bar dataKey="June Quality"   fill="#8b5cf6" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
