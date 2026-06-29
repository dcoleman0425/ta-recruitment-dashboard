import { Recruiter, TeamSettings, TeamData } from "./types";

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

// ── Team totals ────────────────────────────────────────────────────────────

export function getTeamTotals(recruiters: Recruiter[], settings: TeamSettings) {
  const n = recruiters.length || 1;
  const juneStartsTD  = recruiters.reduce((s, r) => s + r.juneStartsTD, 0);
  const mayTotal      = recruiters.reduce((s, r) => s + r.mayStarts, 0);
  const aprilTotal    = recruiters.reduce((s, r) => s + r.aprilStarts, 0);
  const avgJuneQuality = recruiters.reduce((s, r) => s + r.juneQuality, 0) / n;
  const avgMayQuality  = recruiters.reduce((s, r) => s + r.mayQuality, 0) / n;
  const avgAprilQuality = recruiters.reduce((s, r) => s + r.aprilQuality, 0) / n;

  const projectedEOM = settings.currentDay > 0
    ? Math.round((juneStartsTD / settings.currentDay) * settings.totalDays)
    : 0;

  const daysRemaining = settings.totalDays - settings.currentDay;
  const startsNeededPerRecruiter = daysRemaining > 0
    ? Math.max(1, Math.ceil((settings.teamTarget - juneStartsTD) / n / daysRemaining))
    : 0;

  const aprToMayGrowth = aprilTotal > 0 ? ((mayTotal - aprilTotal) / aprilTotal) * 100 : 0;
  const mayToJuneProj  = mayTotal > 0   ? ((projectedEOM - mayTotal) / mayTotal) * 100 : 0;

  return {
    juneStartsTD, mayTotal, aprilTotal,
    projectedEOM, daysRemaining, startsNeededPerRecruiter,
    avgJuneQuality: Math.round(avgJuneQuality * 10) / 10,
    avgMayQuality:  Math.round(avgMayQuality * 10) / 10,
    avgAprilQuality: Math.round(avgAprilQuality * 10) / 10,
    paceAbove: projectedEOM >= settings.teamTarget,
    gapFromTarget: Math.abs(settings.teamTarget - projectedEOM),
    aprToMayGrowth: Math.round(aprToMayGrowth * 10) / 10,
    mayToJuneProj:  Math.round(mayToJuneProj * 10) / 10,
    avgStartsTD: Math.round((juneStartsTD / n) * 10) / 10,
  };
}

// ── Director rollup incentive (official plan) ──────────────────────────────
// Starts component  (70%): (Avg CGR starts payout  ÷ $800)  × $1,050
// Quality component (30%): (Avg CGR quality payout ÷ $200) × $450

export function getDirectorIncentive(data: TeamData) {
  const { recruiters, settings } = data;
  const n = recruiters.length || 1;

  const cgrPayouts = recruiters.map((r) => {
    const proj = getProjectedEOM(r.juneStartsTD, settings.currentDay, settings.totalDays);
    return { startsPay: proj * 25, qualityPay: getQualityBonus(r.juneQuality) };
  });

  const avgStartsPay  = cgrPayouts.reduce((s, r) => s + r.startsPay, 0) / n;
  const avgQualityPay = cgrPayouts.reduce((s, r) => s + r.qualityPay, 0) / n;

  const startsAttainment  = avgStartsPay  / 800;   // CGR starts target payout = $800
  const qualityAttainment = avgQualityPay / 200;   // CGR quality target payout = $200

  const startsPayout  = Math.round(startsAttainment  * 1050); // Dir starts target = $1,050
  const qualityPayout = Math.round(qualityAttainment * 450);  // Dir quality target = $450

  return {
    startsPayout, qualityPayout,
    total: startsPayout + qualityPayout,
    startsAttainmentPct:  Math.round(startsAttainment  * 100),
    qualityAttainmentPct: Math.round(qualityAttainment * 100),
    avgCGRStartsPay:  Math.round(avgStartsPay),
    avgCGRQualityPay: Math.round(avgQualityPay),
  };
}

// ── Misc helpers ───────────────────────────────────────────────────────────

export function getPrevMonthName(m: string): string {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const i = months.indexOf(m);
  return i > 0 ? months[i - 1] : months[11];
}

export function getMonthIndex(m: string): number {
  return ["January","February","March","April","May","June","July","August","September","October","November","December"].indexOf(m);
}
