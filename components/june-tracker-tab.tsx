"use client";
import { TeamData } from "@/lib/types";
import { getProjectedEOM, getProjectedPayout, getStatus, getStatusConfig, getDirectorIncentive } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign } from "lucide-react";

interface Props { data: TeamData; }

export function JuneTrackerTab({ data }: Props) {
  const { settings, recruiters } = data;
  const dir = getDirectorIncentive(data);

  const enriched = recruiters.map(r => {
    const proj   = getProjectedEOM(r.juneStartsTD, settings.currentDay, settings.totalDays);
    const status = getStatus(proj, r.juneTarget);
    const cfg    = getStatusConfig(status);
    const payout = getProjectedPayout(proj, r.juneQuality);
    const pct    = Math.min(100, Math.round((r.juneStartsTD / r.juneTarget) * 100));
    const projPct = Math.round((proj / r.juneTarget) * 100);
    return { ...r, proj, status, cfg, payout, pct, projPct };
  }).sort((a,b) => b.projPct - a.projPct);

  const teamTarget = settings.teamTarget;
  const teamTD     = recruiters.reduce((s,r) => s + r.juneStartsTD, 0);
  const teamProjTD = enriched.reduce((s,r) => s + r.proj, 0);
  const teamPct    = Math.min(100, Math.round((teamTD / teamTarget) * 100));

  return (
    <div className="space-y-5">
      {/* Director bonus card */}
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
        <CardContent className="pt-4 pb-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 opacity-70" />
            <div>
              <p className="text-sm opacity-75">Your Projected Director Bonus</p>
              <p className="text-4xl font-extrabold">${dir.total.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-center">
            <div>
              <p className="opacity-60 text-xs">Starts (70%)</p>
              <p className="text-xl font-bold">${dir.startsPayout}</p>
              <p className="opacity-50 text-xs">{dir.startsAttainmentPct}% attainment</p>
            </div>
            <div>
              <p className="opacity-60 text-xs">Quality (30%)</p>
              <p className="text-xl font-bold">${dir.qualityPayout}</p>
              <p className="opacity-50 text-xs">{dir.qualityAttainmentPct}% attainment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team progress bar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-slate-800">Team June Target Progress</p>
              <p className="text-xs text-muted-foreground">{teamTD} starts TD · Proj. {teamProjTD} EOM · Target {teamTarget}</p>
            </div>
            <span className={`text-2xl font-bold ${teamProjTD >= teamTarget ? "text-emerald-600" : "text-red-600"}`}>
              {Math.round((teamProjTD / teamTarget) * 100)}%
            </span>
          </div>
          <Progress value={teamPct} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>{teamTarget / 2}</span>
            <span>{teamTarget}</span>
          </div>
        </CardContent>
      </Card>

      {/* Individual progress bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enriched.map(r => {
          const barValue = Math.min(100, r.pct);
          const projBarValue = Math.min(100, r.projPct);
          return (
            <Card key={r.id} className={`border-l-4 ${
              r.status === "crushing"   ? "border-l-emerald-500" :
              r.status === "on-track"   ? "border-l-blue-500" :
              r.status === "behind"     ? "border-l-amber-500" : "border-l-red-500"
            }`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">{r.name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium border ${r.cfg.bg} ${r.cfg.text} ${r.cfg.border}`}>
                        {r.cfg.emoji} {r.cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.juneStartsTD} TD · Proj. {r.proj} · Target {r.juneTarget} · {r.projPct}% of goal
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-700">${r.payout.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">est. payout</p>
                  </div>
                </div>

                {/* Starts bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Starts to date</span>
                    <span>{r.juneStartsTD} / {r.juneTarget}</span>
                  </div>
                  <Progress value={barValue} className="h-2" />
                </div>

                {/* Quality indicator */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Hire Quality</span>
                  <span className={`font-semibold ${r.juneQuality >= 80 ? "text-emerald-600" : r.juneQuality >= 75 ? "text-amber-600" : "text-red-600"}`}>
                    {r.juneQuality >= 80 ? "🟢" : r.juneQuality >= 75 ? "🟡" : "🔴"} {r.juneQuality.toFixed(1)}%
                    {r.juneQuality < 75 && " — no quality bonus!"}
                    {r.juneQuality >= 80 && r.juneQuality < 85 && " (+$200)"}
                    {r.juneQuality >= 85 && r.juneQuality < 90 && " (+$300)"}
                    {r.juneQuality >= 90 && " (+$400) 🔥"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
