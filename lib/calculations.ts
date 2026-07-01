import { Recruiter, TeamSettings, TeamData } from "./types";
import { getMonthEntry, prevMonthKey, daysInMonth } from "./months";

// ── Recruiter payout (official TheKey 2026 plan) ───────────────────────────
// $25 × CG 1st shifts + tiered quality bonus (uncapped)
// ──────────────────────────────────────────────────────────────────────────

export function getQualityBonus(quality: number): number {
  if (quality >= 90) return 400;
  if (quality >= 85) return 300;
  if (quality >= 80) return 200;
  if (quality >= 75) return 100;
  return 0;
}

export function getQualityTierLabel(quality: number): string {
  if (quality >= 90) return "Elite (+$400)";
  if (quality >= 85) return "High (+$300)";
  if (quality >= 80) return "Good (+$200)";
  if (quality >= 75) return "Meets (+$100)";
  return "Below threshold";
}

export function getQualityColor(quality: number): string {
  if (quality >= 80) return "text-emerald-600";
  if (quality >= 75) return "text-amber-600";
  return "text-red-600";
}

export function getQualityBadgeClass(quality: number): string {
  if (quality >= 80) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (quality >= 75) return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-red-100 text-red-800 border-red-200";
}

/** Payout for a completed month using actual starts */
export function getActualPayout(starts: number, quality: number): number {
  return starts * 25 + getQualityBonus(quality);
}

/** Projected EOM starts from current pace */
export function getProjectedEOM(startsToDate: number, currentDay: number, totalDays: number): number {
  if (currentDay === 0) return 0;
  return Math.round((startsToDate / currentDay) * totalDays);
}

/** Projected payout based on projected EOM starts */
export function getProjectedPayout(projectedStarts: number, quality: number): number {
  return projectedStarts * 25 + getQualityBonus(quality);
}

export function getStatus(projected: number, target: number): "crushing" | "on-track" | "behind" | "at-risk" {
  if (target === 0) return "on-track";
  const r = projected / target;
  if (r >= 1.0) return "crushing";
  if (r >= 0.8) return "on-track";
  if (r >= 0.6) return "behind";
  return "at-risk";
}

export function getStatusConfig(status: string) {
  const map: Record<string, { label: string; emoji: string; bg: string; text: string; border: string }> = {
    crushing:   { label: "Ahead",    emoji: "🚀", bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
    "on-track": { label: "On Track", emoji: "✅", bg: "bg-blue-100",    text: "text-blue-800",    border: "border-blue-200"    },
    behind:     { label: "Behind",   emoji: "⚠️", bg: "bg-amber-100",   text: "text-amber-800",   border: "border-amber-200"   },
    "at-risk":  { label: "At Risk",  emoji: "🔴", bg: "bg-red-100",     text: "text-red-800",     border: "border-red-200"     },
  };
  return map[status] ?? map["on-track"];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

// ── Team totals (generalized around whichever month is "current") ─────────

export function getTeamTotals(recruiters: Recruiter[], settings: TeamSettings) {
  const n = recruiters.length || 1;
  const curKey   = settings.currentMonthKey;
  const prevKey  = prevMonthKey(curKey);
  const prev2Key = prevMonthKey(prevKey);
  const curTotalDays = settings.months.find(m => m.key === curKey)?.totalDays ?? daysInMonth(curKey);

  const curStartsTD = recruiters.reduce((s, r) => s + getMonthEntry(r.months, curKey).starts, 0);
  const prevTotal    = recruiters.reduce((s, r) => s + getMonthEntry(r.months, prevKey).starts, 0);
  const prev2Total   = recruiters.reduce((s, r) => s + getMonthEntry(r.months, prev2Key).starts, 0);

  const avgCurQuality   = recruiters.reduce((s, r) => s + getMonthEntry(r.months, curKey).quality, 0) / n;
  const avgPrevQuality  = recruiters.reduce((s, r) => s + getMonthEntry(r.months, prevKey).quality, 0) / n;
  const avgPrev2Quality = recruiters.reduce((s, r) => s + getMonthEntry(r.months, prev2Key).quality, 0) / n;

  const projectedEOM = settings.currentDay > 0
    ? Math.round((curStartsTD / settings.currentDay) * curTotalDays)
    : 0;

  const daysRemaining = curTotalDays - settings.currentDay;
  const startsNeededPerRecruiter = daysRemaining > 0
    ? Math.max(1, Math.ceil((settings.teamTarget - curStartsTD) / n / daysRemaining))
    : 0;

  const prev2ToPrevGrowth = prev2Total > 0 ? ((prevTotal - prev2Total) / prev2Total) * 100 : 0;
  const prevToCurProj     = prevTotal > 0  ? ((projectedEOM - prevTotal) / prevTotal) * 100 : 0;

  const prev2Payout = recruiters.reduce((s, r) => {
    const e = getMonthEntry(r.months, prev2Key);
    return s + getActualPayout(e.starts, e.quality);
  }, 0);
  const prevPayout = recruiters.reduce((s, r) => {
    const e = getMonthEntry(r.months, prevKey);
    return s + getActualPayout(e.starts, e.quality);
  }, 0);
  const curEst = recruiters.reduce((s, r) => {
    const e = getMonthEntry(r.months, curKey);
    return s + getProjectedPayout(getProjectedEOM(e.starts, settings.currentDay, curTotalDays), e.quality);
  }, 0);

  return {
    curKey, prevKey, prev2Key, curTotalDays,
    curStartsTD, prevTotal, prev2Total,
    projectedEOM, daysRemaining, startsNeededPerRecruiter,
    avgCurQuality:   round1(avgCurQuality),
    avgPrevQuality:  round1(avgPrevQuality),
    avgPrev2Quality: round1(avgPrev2Quality),
    paceAbove:     projectedEOM >= settings.teamTarget,
    gapFromTarget: Math.abs(settings.teamTarget - projectedEOM),
    prev2ToPrevGrowth: round1(prev2ToPrevGrowth),
    prevToCurProj:     round1(prevToCurProj),
    avgStartsTD:       round1(curStartsTD / n),
    prev2Payout, prevPayout, curEst,
  };
}

// ── Director rollup incentive (official plan) ──────────────────────────────
// Starts component  (70%): (Avg CGR starts payout  ÷ $800)  × $1,050
// Quality component (30%): (Avg CGR quality payout ÷ $200) × $450

export function getDirectorIncentive(data: TeamData) {
  const { recruiters, settings } = data;
  const n = recruiters.length || 1;
  const curKey = settings.currentMonthKey;
  const curTotalDays = settings.months.find(m => m.key === curKey)?.totalDays ?? daysInMonth(curKey);

  const cgrPayouts = recruiters.map((r) => {
    const e = getMonthEntry(r.months, curKey);
    const proj = getProjectedEOM(e.starts, settings.currentDay, curTotalDays);
    return { startsPay: proj * 25, qualityPay: getQualityBonus(e.quality) };
  });

  const avgStartsPay  = cgrPayouts.reduce((s, r) => s + r.startsPay, 0) / n;
  const avgQualityPay = cgrPayouts.reduce((s, r) => s + r.qualityPay, 0) / n;

  const startsAttainment  = avgStartsPay  / 800;
  const qualityAttainment = avgQualityPay / 200;

  const startsPayout  = Math.round(startsAttainment  * 1050);
  const qualityPayout = Math.round(qualityAttainment * 450);

  return {
    startsPayout, qualityPayout,
    total: startsPayout + qualityPayout,
    startsAttainmentPct:  Math.round(startsAttainment  * 100),
    qualityAttainmentPct: Math.round(qualityAttainment * 100),
    avgCGRStartsPay:  Math.round(avgStartsPay),
    avgCGRQualityPay: Math.round(avgQualityPay),
  };
}
