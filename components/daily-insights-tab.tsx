"use client";
import { useState } from "react";
import { TeamData } from "@/lib/types";
import { getTeamTotals, getProjectedEOM, getQualityBonus, getStatus, getStatusConfig } from "@/lib/calculations";
import { generateReport } from "@/lib/report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props { data: TeamData; }

export function DailyInsightsTab({ data }: Props) {
  const [copied, setCopied] = useState(false);
  const { settings, recruiters } = data;
  const totals = getTeamTotals(recruiters, settings);

  const report = generateReport(data);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Shoutout picks: top 2 by starts, top 1 by quality
  const byStarts = [...recruiters].sort((a,b) => b.juneStartsTD - a.juneStartsTD);
  const byQuality = [...recruiters].sort((a,b) => b.juneQuality - a.juneQuality);

  // Needs push: behind/at-risk
  const needsPush = recruiters
    .map(r => ({
      ...r,
      proj: getProjectedEOM(r.juneStartsTD, settings.currentDay, settings.totalDays),
    }))
    .filter(r => {
      const st = getStatus(r.proj, r.juneTarget);
      return st === "behind" || st === "at-risk";
    });

  // Quality warriors: ≥ 85%
  const qualityWarriors = recruiters.filter(r => r.juneQuality >= 85);

  return (
    <div className="space-y-5">
      {/* Summary callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-indigo-700">{totals.juneStartsTD}</div>
            <div className="text-xs text-indigo-600 font-medium">Starts MTD (Day {settings.currentDay})</div>
            <div className="text-xs text-slate-500 mt-1">Projecting {totals.juneProjected} EOM</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-purple-700">
              {(recruiters.reduce((s,r) => s + r.juneQuality, 0) / recruiters.length).toFixed(1)}%
            </div>
            <div className="text-xs text-purple-600 font-medium">Avg Hire Quality</div>
            <div className="text-xs text-slate-500 mt-1">Target: ≥ 80%</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-green-700">{qualityWarriors.length}</div>
            <div className="text-xs text-green-600 font-medium">Quality Warriors (≥85%)</div>
            <div className="text-xs text-slate-500 mt-1">
              {qualityWarriors.map(r => r.name.split(" ")[0]).join(", ") || "None yet"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick intel cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">🏆 Stars of the Day</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">🚀 Top Starts:</span>{" "}
              {byStarts.slice(0,2).map(r => `${r.name.split(" ")[0]} (${r.juneStartsTD})`).join(" · ")}
            </div>
            <div>
              <span className="font-semibold">🎯 Top Quality:</span>{" "}
              {byQuality[0]?.name.split(" ")[0]} ({byQuality[0]?.juneQuality}%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">⚠️ Needs Push</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {needsPush.length === 0
              ? <span className="text-green-600 font-medium">Everyone is on track! 🎉</span>
              : <ul className="space-y-1">
                  {needsPush.map(r => {
                    const sc = getStatusConfig(getStatus(r.proj, r.juneTarget));
                    return (
                      <li key={r.id} className="flex items-center gap-2">
                        <span>{sc.emoji}</span>
                        <span className="font-medium">{r.name.split(" ")[0]}</span>
                        <span className="text-slate-500">
                          {r.juneStartsTD} starts → proj {r.proj} vs target {r.juneTarget}
                        </span>
                      </li>
                    );
                  })}
                </ul>
            }
          </CardContent>
        </Card>
      </div>

      {/* Generated report */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">📋 Copy-Ready Team Update</CardTitle>
          <Button size="sm" variant={copied ? "default" : "outline"} onClick={handleCopy}>
            {copied ? "✓ Copied!" : "Copy to Clipboard"}
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono whitespace-pre-wrap bg-slate-50 rounded-lg p-4 max-h-[500px] overflow-y-auto border border-slate-200 leading-relaxed">
            {report}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
