"use client";
import { useState, useEffect } from "react";
import { TeamData } from "@/lib/types";
import { getMonthEntry, monthLabel } from "@/lib/months";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveData } from "@/lib/store";

interface Props {
  data: TeamData;
  onUpdate: (data: TeamData) => void;
}

export function UploadStatsTab({ data, onUpdate }: Props) {
  const curKey = data.settings.currentMonthKey;
  const trackedMonths = [...data.settings.months].sort((a, b) => b.key.localeCompare(a.key)); // newest first
  const [editingKey, setEditingKey] = useState(curKey);
  const isCurrentMonth = editingKey === curKey;

  const [currentDay, setCurrentDay] = useState(data.settings.currentDay);
  const [stats, setStats] = useState<Record<string, { starts: number; quality: number }>>(
    Object.fromEntries(
      data.recruiters.map(r => {
        const e = getMonthEntry(r.months, editingKey);
        return [r.id, { starts: e.starts, quality: e.quality }];
      })
    )
  );
  const [saved, setSaved] = useState(false);

  // Reload the stats form whenever the user switches which month they're editing
  useEffect(() => {
    setStats(Object.fromEntries(
      data.recruiters.map(r => {
        const e = getMonthEntry(r.months, editingKey);
        return [r.id, { starts: e.starts, quality: e.quality }];
      })
    ));
  }, [editingKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (id: string, field: "starts" | "quality", raw: string) => {
    const val = parseFloat(raw) || 0;
    setStats(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: field === "quality" ? Math.min(100, Math.max(0, val)) : Math.max(0, val) },
    }));
  };

  const handleSave = () => {
    const updated: TeamData = {
      ...data,
      settings: isCurrentMonth ? { ...data.settings, currentDay } : data.settings,
      recruiters: data.recruiters.map(r => {
        const e = getMonthEntry(r.months, editingKey);
        return {
          ...r,
          months: {
            ...r.months,
            [editingKey]: {
              ...e,
              starts: stats[r.id]?.starts ?? e.starts,
              quality: stats[r.id]?.quality ?? e.quality,
            },
          },
        };
      }),
      lastUpdated: new Date().toISOString(),
    };
    saveData(updated);
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const teamTotal = Object.values(stats).reduce((s, v) => s + v.starts, 0);
  const avgQuality = Object.values(stats).length
    ? (Object.values(stats).reduce((s, v) => s + v.quality, 0) / Object.values(stats).length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-5">
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="pt-4 pb-3 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 whitespace-nowrap">Editing month:</label>
            <select
              value={editingKey}
              onChange={e => setEditingKey(e.target.value)}
              className="h-8 text-sm rounded-md border border-slate-300 bg-white px-2"
            >
              {trackedMonths.map(m => (
                <option key={m.key} value={m.key}>
                  {monthLabel(m.key)}{m.key === curKey ? " (active)" : " (final)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xl font-bold text-indigo-700">{teamTotal}</div>
            <div className="text-xs text-indigo-600">Team Starts {isCurrentMonth ? "MTD" : "(Final)"}</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-700">{avgQuality}%</div>
            <div className="text-xs text-purple-600">Avg Quality</div>
          </div>
          {isCurrentMonth && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600 whitespace-nowrap">Business Day:</label>
              <Input
                type="number"
                value={currentDay}
                min={1}
                max={31}
                onChange={e => setCurrentDay(parseInt(e.target.value) || data.settings.currentDay)}
                className="w-16 h-7 text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {isCurrentMonth ? "📥 Enter Today's MTD Numbers" : "📝 Edit Final Numbers"} — {monthLabel(editingKey)}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {isCurrentMonth
              ? `Update each recruiter's ${monthLabel(editingKey)} starts and hire quality. Data saves in your browser.`
              : `${monthLabel(editingKey)} is closed out — use this to correct or finalize each recruiter's actual starts and hire quality for that month.`}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-4 font-medium text-slate-600">Recruiter</th>
                  <th className="text-center py-2 px-3 font-medium text-slate-600">{monthLabel(editingKey)} Starts</th>
                  <th className="text-center py-2 px-3 font-medium text-slate-600">Hire Quality %</th>
                  <th className="text-center py-2 px-3 font-medium text-slate-600">Quality Band</th>
                </tr>
              </thead>
              <tbody>
                {data.recruiters.map(r => {
                  const q = stats[r.id]?.quality ?? 0;
                  const band =
                    q >= 90 ? { label: "≥90% → $400", cls: "text-emerald-700 bg-emerald-50" }
                    : q >= 85 ? { label: "85–89% → $300", cls: "text-green-700 bg-green-50" }
                    : q >= 80 ? { label: "80–84% → $200", cls: "text-teal-700 bg-teal-50" }
                    : q >= 75 ? { label: "75–79% → $100", cls: "text-amber-700 bg-amber-50" }
                    : { label: "<75% → $0", cls: "text-red-700 bg-red-50" };
                  return (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 pr-4 font-medium">{r.name}</td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          value={stats[r.id]?.starts ?? 0}
                          min={0}
                          onChange={e => handleChange(r.id, "starts", e.target.value)}
                          className="w-20 h-7 text-sm text-center mx-auto"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          value={stats[r.id]?.quality ?? 0}
                          min={0}
                          max={100}
                          step={0.1}
                          onChange={e => handleChange(r.id, "quality", e.target.value)}
                          className="w-20 h-7 text-sm text-center mx-auto"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${band.cls}`}>
                          {band.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className={saved ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
          size="lg"
        >
          {saved ? "✓ Saved! All tabs updated." : `Save ${monthLabel(editingKey)} & Update Dashboard`}
        </Button>
      </div>
    </div>
  );
}
