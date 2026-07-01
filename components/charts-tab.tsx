"use client";
import { TeamData } from "@/lib/types";
import { getMonthEntry, monthShort } from "@/lib/months";
import { getProjectedEOM } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

interface Props { data: TeamData; }

export function ChartsTab({ data }: Props) {
  const { settings, recruiters } = data;
  const curKey = settings.currentMonthKey;
  const curTotalDays = settings.months.find(m => m.key === curKey)?.totalDays ?? settings.currentDay;
  const monthKeys = [...settings.months].sort((a, b) => a.key.localeCompare(b.key)).map(m => m.key);
  // Show at most the last 4 tracked months (3 historical + current) so bar charts stay readable
  const displayKeys = monthKeys.slice(-4);

  const labelFor = (k: string) => k === curKey ? `${monthShort(k)} Proj.` : monthShort(k);
  const valueFor = (r: TeamData["recruiters"][number], k: string) => {
    const e = getMonthEntry(r.months, k);
    return k === curKey ? getProjectedEOM(e.starts, settings.currentDay, curTotalDays) : e.starts;
  };

  // Per-recruiter data for starts chart
  const startsData = recruiters.map(r => {
    const row: Record<string, string | number> = { name: r.name.split(" ")[0] };
    displayKeys.forEach(k => { row[labelFor(k)] = valueFor(r, k); });
    row.target = getMonthEntry(r.months, curKey).target;
    return row;
  }).sort((a, b) => (b[labelFor(curKey)] as number) - (a[labelFor(curKey)] as number));

  // Per-recruiter data for quality chart
  const qualityData = recruiters.map(r => {
    const row: Record<string, string | number> = { name: r.name.split(" ")[0] };
    displayKeys.forEach(k => { row[`${monthShort(k)} Quality`] = getMonthEntry(r.months, k).quality; });
    return row;
  }).sort((a, b) => (b[`${monthShort(curKey)} Quality`] as number) - (a[`${monthShort(curKey)} Quality`] as number));

  // Team trend totals
  const trendData = displayKeys.map(k => {
    const isCur = k === curKey;
    const startsTotal = recruiters.reduce((s, r) => s + getMonthEntry(r.months, k).starts, 0);
    const starts = isCur && settings.currentDay > 0
      ? Math.round((startsTotal / settings.currentDay) * curTotalDays)
      : startsTotal;
    const avgQuality = Math.round(recruiters.reduce((s, r) => s + getMonthEntry(r.months, k).quality, 0) / recruiters.length * 10) / 10;
    return { month: isCur ? `${monthShort(k)} Proj.` : monthShort(k), starts, avgQuality };
  });

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

  const monthRangeLabel = displayKeys.map(k => monthShort(k)).join(" → ");
  const barColors = ["#94a3b8", "#3b82f6", "#6366f1", "#a5b4fc"];
  const qualityColors = ["#94a3b8", "#3b82f6", "#8b5cf6", "#c4b5fd"];

  return (
    <div className="space-y-6">

      {/* Team Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Team Starts Trend ({monthRangeLabel})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={settings.teamTarget} stroke="#6366f1" strokeDasharray="4 4" label={{ value: `Target ${settings.teamTarget}`, position: "right", fontSize: 10, fill: "#6366f1" }} />
                <Bar dataKey="starts" name="Team Starts" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
                <Bar dataKey="avgQuality" name="Avg Quality %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Individual Starts Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Individual Starts — {monthRangeLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={startsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {displayKeys.map((k, i) => (
                <Bar key={k} dataKey={labelFor(k)} fill={barColors[i % barColors.length]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Individual Quality Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Individual Hire Quality — {monthRangeLabel}</CardTitle>
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
              {displayKeys.map((k, i) => (
                <Bar key={k} dataKey={`${monthShort(k)} Quality`} fill={qualityColors[i % qualityColors.length]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
