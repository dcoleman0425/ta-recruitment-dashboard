"use client";
import { useState, useEffect } from "react";
import { TeamData } from "@/lib/types";
import { loadData } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/overview-tab";
import { TeamPerformanceTab } from "@/components/team-performance-tab";
import { JuneTrackerTab } from "@/components/june-tracker-tab";
import { ChartsTab } from "@/components/charts-tab";
import { DailyInsightsTab } from "@/components/daily-insights-tab";
import { UploadStatsTab } from "@/components/upload-stats-tab";
import { CommitmentsTab } from "@/components/commitments-tab";

export default function Home() {
  const [data, setData] = useState<TeamData | null>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100">
        <div className="text-center space-y-3">
          <div className="text-4xl">📊</div>
          <div className="text-lg font-semibold text-slate-700">Loading Dashboard…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              🏥 TA Recruitment Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              TheKey — June 2026 · Last updated: {new Date(data.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="bg-indigo-100 text-indigo-700 font-medium px-3 py-1 rounded-full">
              Day {data.settings.currentDay} of {data.settings.totalDays}
            </span>
            <span className="bg-slate-100 px-3 py-1 rounded-full">
              {data.recruiters.length} Recruiters
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="overview" className="space-y-5">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            {[
              { value: "overview",     label: "🏠 Overview" },
              { value: "team",         label: "👥 Team Performance" },
              { value: "tracker",      label: "📅 June Tracker" },
              { value: "charts",       label: "📈 Charts" },
              { value: "insights",     label: "⚡ Daily Insights" },
              { value: "upload",       label: "⬆️ Upload Stats" },
              { value: "commitments",  label: "⚙️ Commitments" },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm flex-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab data={data} />
          </TabsContent>

          <TabsContent value="team">
            <TeamPerformanceTab data={data} />
          </TabsContent>

          <TabsContent value="tracker">
            <JuneTrackerTab data={data} />
          </TabsContent>

          <TabsContent value="charts">
            <ChartsTab data={data} />
          </TabsContent>

          <TabsContent value="insights">
            <DailyInsightsTab data={data} />
          </TabsContent>

          <TabsContent value="upload">
            <UploadStatsTab data={data} onUpdate={setData} />
          </TabsContent>

          <TabsContent value="commitments">
            <CommitmentsTab data={data} onUpdate={setData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
