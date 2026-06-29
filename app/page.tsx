"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard } from "@/components/kpi-card";
import { TeamTable } from "@/components/team-table";
import { PerformanceChart, ActivityChart } from "@/components/performance-chart";
import { IncentivePlan } from "@/components/incentive-plan";
import { DailyInsights } from "@/components/daily-insights";
import { recruiters, weeklyTrend, monthlyGoal, teamGoal } from "@/lib/data";
import {
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Star,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const latest = weeklyTrend[weeklyTrend.length - 1];
  const totalActual = recruiters.reduce((s, r) => s + r.actual, 0);
  const totalCommitment = recruiters.reduce((s, r) => s + r.commitment, 0);
  const totalHires = recruiters.reduce((s, r) => s + r.hires, 0);
  const totalPipeline = recruiters.reduce((s, r) => s + r.pipeline, 0);
  const teamAttainment = Math.round((totalActual / totalCommitment) * 100);
  const monthlyPct = Math.round((latest.totalActual / monthlyGoal) * 100);
  const exceeding = recruiters.filter((r) => r.status === "exceeding").length;
  const atRisk = recruiters.filter((r) => r.status === "at-risk").length;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">TA Recruitment Dashboard</h1>
            <p className="text-xs text-muted-foreground">TheKey · Talent Acquisition</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{today}</p>
            <p className="text-xs font-medium text-indigo-600">June 2026 · Period in Progress</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard
            title="Team Actual"
            value={`$${(totalActual / 1000).toFixed(0)}k`}
            subtitle={`vs $${(totalCommitment / 1000).toFixed(0)}k commitment`}
            icon={DollarSign}
            color="blue"
            trendLabel={`${teamAttainment}% attainment`}
          />
          <KpiCard
            title="Monthly Goal"
            value={`${monthlyPct}%`}
            subtitle={`$${(monthlyGoal / 1000).toFixed(0)}k target`}
            icon={TrendingUp}
            color={monthlyPct >= 100 ? "green" : monthlyPct >= 80 ? "amber" : "red"}
            trendLabel={`$${((monthlyGoal - latest.totalActual) / 1000).toFixed(0)}k remaining`}
          />
          <KpiCard
            title="Recruiters"
            value="10"
            subtitle="Active team members"
            icon={Users}
            color="default"
            trendLabel={`${exceeding} exceeding · ${atRisk} at risk`}
          />
          <KpiCard
            title="Total Hires"
            value={totalHires.toString()}
            subtitle="This period"
            icon={CheckCircle}
            color="green"
          />
          <KpiCard
            title="Pipeline"
            value={totalPipeline.toString()}
            subtitle="Active candidates"
            icon={Activity}
            color="blue"
          />
          <KpiCard
            title="Team Goal"
            value={`$${(teamGoal / 1000).toFixed(0)}k`}
            subtitle="Internal target"
            icon={Star}
            color="amber"
            trendLabel={`$${((totalActual - teamGoal) / 1000).toFixed(1)}k ${totalActual >= teamGoal ? "above" : "below"}`}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PerformanceChart />
          <ActivityChart />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="team" className="space-y-4">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team Performance
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Daily Insights
            </TabsTrigger>
            <TabsTrigger value="incentive" className="gap-2">
              <Star className="h-4 w-4" />
              Incentive Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">All Recruiters — June 2026</h2>
                <span className="text-xs text-muted-foreground">{recruiters.length} members</span>
              </div>
              <TeamTable recruiters={recruiters} />
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <DailyInsights />
          </TabsContent>

          <TabsContent value="incentive">
            <IncentivePlan />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
