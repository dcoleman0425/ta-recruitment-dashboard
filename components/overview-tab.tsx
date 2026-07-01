"use client";
import { TeamData } from "@/lib/types";
import { getMonthEntry, monthLabel } from "@/lib/months";
import { getTeamTotals, getDirectorIncentive, getQualityBonus } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";

interface Props { data: TeamData; }

function TrendBadge({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}{pct}%
    </span>
  );
}

export function OverviewTab({ data }: Props) {
  const { settings, recruiters } = data;
  const totals = getTeamTotals(recruiters, settings);
  const dir = getDirectorIncentive(data);
  const n = recruiters.length || 1;

  // Director prior-month payout (historical — use actual starts & quality)
  const prevDirCGRPayouts = recruiters.map(r => {
    const e = getMonthEntry(r.months, totals.prevKey);
    return { startsPay: e.starts * 25, qualityPay: getQualityBonus(e.quality) };
  });
  const prevAvgStartsPay  = prevDirCGRPayouts.reduce((s, r) => s + r.startsPay, 0) / n;
  const prevAvgQualityPay = prevDirCGRPayouts.reduce((s, r) => s + r.qualityPay, 0) / n;
  const prevDirTotal = Math.round((prevAvgStartsPay / 800) * 1050) + Math.round((prevAvgQualityPay / 200) * 450);

  const projPct = settings.teamTarget > 0 ? Math.round((totals.projectedEOM / settings.teamTarget) * 100) : 0;

  return (
    <div className="space-y-6">

      {/* ── Director Incentive Banner ── */}
      <Card className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white border-0 shadow-lg">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-12 w-12 opacity-60" />
              <div>
                <p className="text-sm font-medium opacity-75 uppercase tracking-wide">Your Director Bonus ({monthLabel(totals.curKey)} Projected)</p>
                <p className="text-5xl font-extrabold">${dir.total.toLocaleString()}</p>
                <p className="text-xs opacity-60 mt-1">Target: $1,500 · Uncapped · {monthLabel(totals.prevKey)} earned: ${prevDirTotal.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-8 text-sm">
              <div className="text-center">
                <p className="opacity-70 text-xs uppercase tracking-wide mb-1">Starts Rollup (70%)</p>
                <p className="text-2xl font-bold">${dir.startsPayout.toLocaleString()}</p>
                <p className="opacity-60 text-xs">{dir.startsAttainmentPct}% attainment</p>
                <p className="opacity-50 text-xs">Avg CGR: ${dir.avgCGRStartsPay} ÷ $800</p>
              </div>
              <div className="border-l border-white/20" />
              <div className="text-center">
                <p className="opacity-70 text-xs uppercase tracking-wide mb-1">Quality Rollup (30%)</p>
                <p className="text-2xl font-bold">${dir.qualityPayout.toLocaleString()}</p>
                <p className="opacity-60 text-xs">{dir.qualityAttainmentPct}% attainment</p>
                <p className="opacity-50 text-xs">Avg CGR: ${dir.avgCGRQualityPay} ÷ $200</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p className="opacity-60">Improve avg quality to 80%+</p>
              <p className="font-semibold opacity-90">→ Quality rollup jumps to $450</p>
            </div>
            <div>
              <p className="opacity-60">Team hits 100% of {monthLabel(totals.curKey)} target</p>
              <p className="font-semibold opacity-90">→ Starts rollup hits $1,050</p>
            </div>
            <div>
              <p className="opacity-60">Both unlocked</p>
              <p className="font-semibold opacity-90">→ Full $1,500 payout!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Pacing Alert ── */}
      <Card className={`border-l-4 ${totals.paceAbove ? "border-l-emerald-500 bg-emerald-50/50" : "border-l-red-500 bg-red-50/50"}`}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-6 w-6 ${totals.paceAbove ? "text-emerald-500" : "text-red-500"}`} />
              <div>
                <p className="font-bold text-slate-800 text-lg">
                  {totals.paceAbove ? `✅ Pacing ABOVE ${monthLabel(totals.curKey)} Target!` : `🔴 Pacing BELOW ${monthLabel(totals.curKey)} Target by ${totals.gapFromTarget} starts`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Projected EOM: <strong>{totals.projectedEOM}</strong> vs target <strong>{settings.teamTarget}</strong> · Day {settings.currentDay} of {totals.curTotalDays} · {totals.daysRemaining} days left
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-800">{projPct}%</p>
              <p className="text-xs text-muted-foreground">of target</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Month-over-Month Summaries ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Two months back (final) */}
        <Card className="border-t-4 border-t-slate-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">{monthLabel(totals.prev2Key)} (Final)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-muted-foreground">Total Starts</p>
                <p className="text-4xl font-bold text-slate-700">{totals.prev2Total}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Avg Quality</p>
                <p className="text-2xl font-bold text-slate-600">{totals.avgPrev2Quality}%</p>
              </div>
            </div>
            <div className="pt-2 border-t text-xs text-muted-foreground">
              <p>Avg {Math.round(totals.prev2Total / n * 10) / 10} starts/recruiter</p>
              <p>{recruiters.filter(r => getMonthEntry(r.months, totals.prev2Key).quality >= 80).length}/{n} recruiters hit 80% quality</p>
            </div>
          </CardContent>
        </Card>

        {/* Prior month (final) */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-600 uppercase tracking-wide flex items-center gap-2">
              {monthLabel(totals.prevKey)} (Final) <TrendBadge pct={totals.prev2ToPrevGrowth} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-muted-foreground">Total Starts</p>
                <p className="text-4xl font-bold text-blue-700">{totals.prevTotal}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Avg Quality</p>
                <p className="text-2xl font-bold text-blue-600">{totals.avgPrevQuality}%</p>
              </div>
            </div>
            <div className="pt-2 border-t text-xs text-muted-foreground">
              <p>Avg {Math.round(totals.prevTotal / n * 10) / 10} starts/recruiter</p>
              <p>{recruiters.filter(r => getMonthEntry(r.months, totals.prevKey).quality >= 80).length}/{n} recruiters hit 80% quality</p>
            </div>
          </CardContent>
        </Card>

        {/* Current month (in progress) */}
        <Card className="border-t-4 border-t-indigo-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-indigo-600 uppercase tracking-wide flex items-center gap-2">
              {monthLabel(totals.curKey)} (In Progress) <TrendBadge pct={totals.prevToCurProj} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-muted-foreground">Starts TD / Proj.</p>
                <p className="text-4xl font-bold text-indigo-700">{totals.curStartsTD}<span className="text-xl text-muted-foreground font-normal"> / {totals.projectedEOM}</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Avg Quality</p>
                <p className={`text-2xl font-bold ${totals.avgCurQuality >= 80 ? "text-emerald-600" : "text-red-600"}`}>
                  {totals.avgCurQuality}%
                </p>
              </div>
            </div>
            <div className="pt-2 border-t text-xs text-muted-foreground">
              <p>Day {settings.currentDay} of {totals.curTotalDays} · {totals.daysRemaining} days left</p>
              <p>Need ~{totals.startsNeededPerRecruiter}/recruiter/day to hit target</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Crushing It 🚀",  value: recruiters.filter(r => { const e = getMonthEntry(r.months, totals.curKey); const p = settings.currentDay > 0 ? Math.round((e.starts/settings.currentDay)*totals.curTotalDays) : 0; return p >= e.target; }).length, sub: "pacing ahead", color: "text-emerald-600" },
          { label: "Need a Push 🔴", value: recruiters.filter(r => { const e = getMonthEntry(r.months, totals.curKey); const p = settings.currentDay > 0 ? Math.round((e.starts/settings.currentDay)*totals.curTotalDays) : 0; return p < e.target * 0.8; }).length, sub: "at risk / behind", color: "text-red-600" },
          { label: "Quality ≥80% ✅",  value: recruiters.filter(r => getMonthEntry(r.months, totals.curKey).quality >= 80).length, sub: "earn quality bonus", color: "text-purple-600" },
          { label: "Quality <75% 🚨",  value: recruiters.filter(r => getMonthEntry(r.months, totals.curKey).quality < 75).length, sub: "zero quality bonus", color: "text-red-600" },
        ].map(s => (
          <Card key={s.label} className="text-center">
            <CardContent className="pt-4 pb-3">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}/{recruiters.length}</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
