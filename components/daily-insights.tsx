"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { recruiters, weeklyTrend, monthlyGoal } from "@/lib/data";
import { TrendingUp, TrendingDown, Users, CheckCircle, AlertCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function DailyInsights() {
  const latest = weeklyTrend[weeklyTrend.length - 1];
  const prev = weeklyTrend[weeklyTrend.length - 2];
  const weekGrowth = Math.round(((latest.totalActual - prev.totalActual) / prev.totalActual) * 100);
  const goalPct = Math.round((latest.totalActual / monthlyGoal) * 100);
  const remaining = monthlyGoal - latest.totalActual;

  const topPerformers = [...recruiters]
    .sort((a, b) => (b.actual / b.commitment) - (a.actual / a.commitment))
    .slice(0, 3);

  const atRisk = recruiters.filter((r) => r.status === "at-risk");

  const insights = [
    weekGrowth > 0
      ? `📈 Team actual grew by ${weekGrowth}% week-over-week — great momentum!`
      : `📉 Team actual dipped ${Math.abs(weekGrowth)}% week-over-week — check in with at-risk reps.`,
    `🎯 ${goalPct}% to monthly goal — $${remaining.toLocaleString()} still to close.`,
    `🏆 ${topPerformers[0].name} is leading with ${Math.round((topPerformers[0].actual / topPerformers[0].commitment) * 100)}% attainment this period.`,
    atRisk.length > 0
      ? `⚠️ ${atRisk.map((r) => r.name).join(", ")} ${atRisk.length === 1 ? "is" : "are"} at risk — consider check-ins or realigning commitments.`
      : `✅ All team members are on track or exceeding — great team momentum!`,
    `📋 ${latest.interviews} interviews conducted, ${latest.offers} offers extended, ${latest.hires} hires this week.`,
  ];

  return (
    <div className="space-y-6">
      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              {weekGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">Week-over-Week</span>
            </div>
            <p className={cn("text-2xl font-bold", weekGrowth >= 0 ? "text-emerald-600" : "text-red-500")}>
              {weekGrowth >= 0 ? "+" : ""}{weekGrowth}%
            </p>
            <p className="text-xs text-muted-foreground">vs. previous week</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">Monthly Goal</span>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{goalPct}%</p>
            <p className="text-xs text-muted-foreground">${remaining.toLocaleString()} to go</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">At-Risk Reps</span>
            </div>
            <p className={cn("text-2xl font-bold", atRisk.length > 0 ? "text-red-500" : "text-emerald-600")}>
              {atRisk.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {atRisk.length === 0 ? "All green 🎉" : atRisk.map((r) => r.name).join(", ")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI-style Insights */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Today's Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i}>
              <p className="text-sm leading-relaxed">{insight}</p>
              {i < insights.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">🏆 Top 3 This Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topPerformers.map((r, i) => {
            const pct = Math.round((r.actual / r.commitment) * 100);
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div key={r.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{medals[i]}</span>
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{pct}%</p>
                  <p className="text-xs text-muted-foreground">${r.actual.toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* At-Risk Alerts */}
      {atRisk.length > 0 && (
        <Card className="shadow-sm border-red-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {atRisk.map((r) => {
              const pct = Math.round((r.actual / r.commitment) * 100);
              const gap = r.commitment - r.actual;
              return (
                <div key={r.id} className="flex items-center justify-between bg-red-50 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.region} · {pct}% attainment</p>
                  </div>
                  <Badge variant="outline" className="text-red-600 border-red-300 bg-white">
                    ${gap.toLocaleString()} gap
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
