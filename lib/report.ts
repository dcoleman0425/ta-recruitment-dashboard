import { TeamData } from "./types";
import { getMonthEntry, monthLabel, parseMonthKey } from "./months";
import {
  getProjectedEOM,
  getProjectedPayout,
  getStatus,
  getTeamTotals,
} from "./calculations";

export function generateReport(data: TeamData): string {
  const { settings, recruiters } = data;
  const totals = getTeamTotals(recruiters, settings);
  const curKey = totals.curKey;
  const { y, m } = parseMonthKey(curKey);

  const date = new Date(y, m - 1, settings.currentDay);
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const withProj = recruiters.map(r => {
    const e = getMonthEntry(r.months, curKey);
    const prevEntry = getMonthEntry(r.months, totals.prevKey);
    const proj = getProjectedEOM(e.starts, settings.currentDay, totals.curTotalDays);
    return {
      ...r,
      entry: e,
      prevEntry,
      proj,
      payout: getProjectedPayout(proj, e.quality),
      status: getStatus(proj, e.target),
    };
  });

  const crushing  = withProj.filter(r => r.status === "crushing");
  const onTrack   = withProj.filter(r => r.status === "on-track");
  const behind    = withProj.filter(r => r.status === "behind");
  const atRisk    = withProj.filter(r => r.status === "at-risk").sort((a, b) => a.entry.starts - b.entry.starts);
  const above80q  = recruiters.filter(r => getMonthEntry(r.months, curKey).quality >= 80);
  const below75q  = recruiters.filter(r => getMonthEntry(r.months, curKey).quality < 75);

  const byPayout  = [...withProj].sort((a, b) => b.payout - a.payout);
  const avgPayout = Math.round(byPayout.reduce((s, r) => s + r.payout, 0) / byPayout.length);
  const top       = [...withProj].sort((a, b) => b.entry.starts - a.entry.starts)[0];

  const avgQuality = totals.avgCurQuality.toFixed(1);
  const daysLeft   = totals.daysRemaining;
  const startsNeed = Math.max(0, Math.ceil((settings.teamTarget - totals.curStartsTD) / Math.max(1, daysLeft)));

  const LINE = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

  let r = "";
  r += `TEAM DAILY UPDATE — ${dayName}, ${dateStr}\n`;
  r += `${LINE}\n`;
  r += `Good morning team! Here's your daily pulse check for ${monthLabel(curKey)}.\n\n`;

  r += `🎯 TEAM SCORECARD (Month-to-Date | Day ${settings.currentDay} of ${totals.curTotalDays})\n`;
  r += `Total Caregiver Starts: ${totals.curStartsTD} | Projected EOM: ${totals.projectedEOM} | ${monthLabel(curKey)} Target: ${settings.teamTarget}\n`;
  r += `Avg Starts per Recruiter: ${(totals.curStartsTD / recruiters.length).toFixed(1)} | Avg Hire Quality: ${avgQuality}%\n`;
  r += `Days Remaining: ${daysLeft} | Pace Status: ${totals.projectedEOM >= settings.teamTarget ? "🟢 ON TARGET" : `🔴 BELOW target by ${settings.teamTarget - totals.projectedEOM}`}\n\n`;

  r += `🏆 SHOUTOUT OF THE DAY\n`;
  r += `${top.name} is leading with ${top.entry.starts} starts this month and ${top.entry.quality.toFixed(1)}% hire quality! 🌟\n\n`;

  if (crushing.length > 0) {
    r += `🚀 CRUSHING IT — Pacing Ahead of Commitment\n`;
    crushing.forEach(rec => {
      r += `• ${rec.name}: ${rec.entry.starts} starts TD | proj. ${rec.proj} → target ${rec.entry.target}\n`;
    });
    r += "\n";
  }

  if (onTrack.length > 0) {
    r += `✅ ON TRACK — Keep the Momentum!\n`;
    onTrack.forEach(rec => {
      r += `• ${rec.name}: ${rec.entry.starts} starts TD | proj. ${rec.proj} vs target ${rec.entry.target}\n`;
    });
    r += "\n";
  }

  if (atRisk.length > 0 || behind.length > 0) {
    r += `💪 NEEDS A PUSH — Let's Close the Gap!\n`;
    if (atRisk.length > 0) {
      r += `🔴 AT RISK:\n`;
      atRisk.forEach(rec => {
        r += `• ${rec.name}: ${rec.entry.starts} starts TD → projecting ${rec.proj} vs ${rec.entry.target} target (had ${rec.prevEntry.starts} in ${monthLabel(totals.prevKey)})\n`;
      });
    }
    if (behind.length > 0) {
      r += `⚠️ BEHIND:\n`;
      behind.forEach(rec => {
        r += `• ${rec.name}: ${rec.entry.starts} starts TD → projecting ${rec.proj} vs ${rec.entry.target} target\n`;
      });
    }
    r += "\n";
  }

  r += `⚠️ HIRE QUALITY FOCUS\n`;
  r += `Current Team Avg Quality: ${avgQuality}% ${parseFloat(avgQuality) >= 80 ? "✅" : "⚠️"}\n`;
  if (above80q.length > 0) {
    r += `• Above 80% threshold: ${above80q.map(x => x.name).join(", ")} ✅\n`;
  }
  if (below75q.length > 0) {
    r += `• Below 75% (no quality bonus): ${below75q.map(x => x.name).join(", ")}\n`;
  }
  r += "\n";

  r += `💰 ${monthLabel(curKey).toUpperCase()} INCENTIVE PROJECTIONS (at current pace)\n\n`;
  r += `Team Average Projected Payout: $${avgPayout} per recruiter\n`;
  byPayout.forEach(rec => {
    r += `• ${rec.name}: $${rec.payout} (${rec.proj} proj. starts / quality ${rec.entry.quality.toFixed(1)}%)\n`;
  });
  r += "\n";

  r += `🎯 TODAY'S CHALLENGE\n`;
  r += `Each recruiter: aim for at least ${Math.max(1, startsNeed)} new start(s) TODAY to hit the team target.\n`;

  return r;
}

// Legacy alias
export const generateDailyReport = generateReport;
