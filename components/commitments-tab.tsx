"use client";
import { useState } from "react";
import { TeamData } from "@/lib/types";
import { saveData } from "@/lib/store";
import { getMonthEntry, monthLabel, nextMonthKey, startNextMonth } from "@/lib/months";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  data: TeamData;
  onUpdate: (data: TeamData) => void;
}

export function CommitmentsTab({ data, onUpdate }: Props) {
  const curKey = data.settings.currentMonthKey;
  const [targets, setTargets] = useState<Record<string, number>>(
    Object.fromEntries(data.recruiters.map(r => [r.id, getMonthEntry(r.months, curKey).target]))
  );
  const [qualityTargets, setQualityTargets] = useState<Record<string, number>>(
    Object.fromEntries(data.recruiters.map(r => [r.id, getMonthEntry(r.months, curKey).qualityTarget]))
  );
  const [teamTarget, setTeamTarget] = useState(data.settings.teamTarget);
  const [teamQualityTarget, setTeamQualityTarget] = useState(data.settings.teamQualityTarget);
  const [saved, setSaved] = useState(false);
  const [monthStarted, setMonthStarted] = useState(false);

  const handleSave = () => {
    const updated: TeamData = {
      ...data,
      settings: { ...data.settings, teamTarget, teamQualityTarget },
      recruiters: data.recruiters.map(r => {
        const e = getMonthEntry(r.months, curKey);
        return {
          ...r,
          months: {
            ...r.months,
            [curKey]: {
              ...e,
              target: targets[r.id] ?? e.target,
              qualityTarget: qualityTargets[r.id] ?? e.qualityTarget,
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

  const handleStartNextMonth = () => {
    const updated = startNextMonth(data);
    saveData(updated);
    onUpdate(updated);
    const newKey = updated.settings.currentMonthKey;
    setTargets(Object.fromEntries(updated.recruiters.map(r => [r.id, getMonthEntry(r.months, newKey).target])));
    setQualityTargets(Object.fromEntries(updated.recruiters.map(r => [r.id, getMonthEntry(r.months, newKey).qualityTarget])));
    setMonthStarted(true);
    setTimeout(() => setMonthStarted(false), 3000);
  };

  const upcoming = nextMonthKey(curKey);
  const trackedMonths = [...data.settings.months].sort((a, b) => a.key.localeCompare(b.key));

  return (
    <div className="space-y-6">

      {/* Month management */}
      <Card className="border-indigo-200 bg-indigo-50/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">🗓️ Month Management</CardTitle>
          <p className="text-xs text-muted-foreground">
            Currently tracking <strong>{monthLabel(curKey)}</strong> as the active month. When the month closes out, start the next one —
            recruiter targets carry forward automatically and all prior months stay archived for comparison.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {trackedMonths.map(m => (
              <span
                key={m.key}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                  m.key === curKey
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                {monthLabel(m.key)}{m.key === curKey ? " · active" : ""}
              </span>
            ))}
          </div>
          <Button
            onClick={handleStartNextMonth}
            className={monthStarted ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
          >
            {monthStarted ? `✓ ${monthLabel(upcoming)} is now active!` : `Start Tracking ${monthLabel(upcoming)} →`}
          </Button>
        </CardContent>
      </Card>

      {/* Individual targets */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">🎯 {monthLabel(curKey)} Starts &amp; Quality Commitments</CardTitle>
          <p className="text-xs text-muted-foreground">Edit each recruiter's monthly starts target and hire quality % target. Updates projections and progress across all tabs.</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6 mb-4 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Team Total Target (Starts)</span>
              <Input
                type="number"
                value={teamTarget}
                min={0}
                onChange={e => setTeamTarget(parseInt(e.target.value) || 0)}
                className="w-24 h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Team Hire Quality Target</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={teamQualityTarget}
                  min={0}
                  max={100}
                  step={0.5}
                  onChange={e => setTeamQualityTarget(parseFloat(e.target.value) || 0)}
                  className="w-20 h-8 text-sm"
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.recruiters.map(r => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-slate-800 flex-1 min-w-[110px]">{r.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Starts:</span>
                  <Input
                    type="number"
                    value={targets[r.id] ?? getMonthEntry(r.months, curKey).target}
                    min={0}
                    onChange={e => setTargets(prev => ({ ...prev, [r.id]: parseInt(e.target.value) || 0 }))}
                    className="w-16 h-7 text-sm text-center"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Quality %:</span>
                  <Input
                    type="number"
                    value={qualityTargets[r.id] ?? getMonthEntry(r.months, curKey).qualityTarget}
                    min={0}
                    max={100}
                    step={0.5}
                    onChange={e => setQualityTargets(prev => ({ ...prev, [r.id]: parseFloat(e.target.value) || 0 }))}
                    className="w-16 h-7 text-sm text-center"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className={saved ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
        >
          {saved ? "✓ Saved!" : "Save Targets"}
        </Button>
      </div>

      {/* Recruiter Incentive Plan */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">💰 Recruiter Incentive Plan — Official 2026</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="font-semibold text-slate-700 mb-1">Starts Pay (uncapped)</div>
            <div className="bg-indigo-50 rounded-lg px-4 py-2 text-indigo-800">
              <span className="text-lg font-bold">$25</span>
              <span className="text-sm"> × Number of CGR Starts = Monthly Starts Pay</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Target: 40 starts/mo = $1,000</div>
          </div>
          <div>
            <div className="font-semibold text-slate-700 mb-2">Hire Quality Bonus Tiers</div>
            <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-3 py-2">Quality Rate (5th Shift ÷ 1st Shift)</th>
                  <th className="text-center px-3 py-2">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { range: "≥ 90%", bonus: "$400", cls: "bg-emerald-50 text-emerald-800" },
                  { range: "85–89.9%", bonus: "$300", cls: "bg-green-50 text-green-800" },
                  { range: "80–84.9%", bonus: "$200", cls: "bg-teal-50 text-teal-800" },
                  { range: "75–79.9%", bonus: "$100", cls: "bg-amber-50 text-amber-800" },
                  { range: "< 75%", bonus: "$0", cls: "bg-red-50 text-red-800" },
                ].map(row => (
                  <tr key={row.range} className={`border-t border-slate-100 ${row.cls}`}>
                    <td className="px-3 py-2 font-medium">{row.range}</td>
                    <td className="px-3 py-2 text-center font-bold">{row.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-xs text-slate-500 mt-1">
              Hire Quality = # caregivers completing 5th shift within 30 days of 1st shift ÷ # caregivers with 1st shift in prior month
            </div>
          </div>
          <div className="border-t border-slate-200 pt-3">
            <div className="font-semibold text-slate-700 mb-1">Total Monthly Pay Formula</div>
            <div className="bg-slate-100 rounded-lg px-4 py-2 font-mono text-xs">
              (Starts × $25) + Quality Bonus Tier = Total Incentive Pay
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Director Incentive Plan */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">🏆 Director Incentive Plan — Official 2026</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="font-semibold text-slate-700 mb-1">Director Pay Formula (Rollup)</div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 font-mono text-xs text-purple-900 space-y-1">
              <div>(Avg CGR Starts Pay ÷ $800) × $1,050</div>
              <div>+ (Avg CGR Quality Pay ÷ $200) × $450</div>
              <div className="border-t border-purple-200 pt-1 font-bold">= Director Monthly Incentive</div>
            </div>
            <div className="text-xs text-slate-500 mt-1">Target: $1,500/mo (uncapped)</div>
          </div>
          <div>
            <div className="font-semibold text-slate-700 mb-1">How it works</div>
            <ul className="space-y-1 text-xs text-slate-600 list-disc pl-4">
              <li><strong>Avg CGR Starts Pay</strong> = average of all recruiters' individual starts pay ($25 × starts each)</li>
              <li><strong>Avg CGR Quality Pay</strong> = average of all recruiters' individual quality tier bonuses</li>
              <li>Director multiplier for starts: <strong>1,050/800 = ×1.3125</strong></li>
              <li>Director multiplier for quality: <strong>450/200 = ×2.25</strong></li>
              <li>No cap — director earns more when the whole team performs above target</li>
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-800">
            <strong>Key insight:</strong> As director, your pay tracks your team. When every recruiter exceeds 40 starts and hits quality tier, your pay scales above $1,500 uncapped.
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
