"use client";
import { useState } from "react";
import { TeamData } from "@/lib/types";
import { saveData } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  data: TeamData;
  onUpdate: (data: TeamData) => void;
}

export function CommitmentsTab({ data, onUpdate }: Props) {
  const [targets, setTargets] = useState<Record<string, number>>(
    Object.fromEntries(data.recruiters.map(r => [r.id, r.juneTarget]))
  );
  const [teamTarget, setTeamTarget] = useState(data.settings.teamTarget);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const updated: TeamData = {
      ...data,
      settings: { ...data.settings, teamTarget },
      recruiters: data.recruiters.map(r => ({
        ...r,
        juneTarget: targets[r.id] ?? r.juneTarget,
      })),
      lastUpdated: new Date().toISOString(),
    };
    saveData(updated);
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">

      {/* Individual targets */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">🎯 June Starts Commitments</CardTitle>
          <p className="text-xs text-muted-foreground">Edit each recruiter's monthly starts target. Updates projections across all tabs.</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
            <span className="text-sm font-semibold text-slate-700 w-40">Team Total Target</span>
            <Input
              type="number"
              value={teamTarget}
              min={0}
              onChange={e => setTeamTarget(parseInt(e.target.value) || 0)}
              className="w-24 h-8 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.recruiters.map(r => (
              <div key={r.id} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-slate-800 flex-1">{r.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Target:</span>
                  <Input
                    type="number"
                    value={targets[r.id] ?? r.juneTarget}
                    min={0}
                    onChange={e => setTargets(prev => ({ ...prev, [r.id]: parseInt(e.target.value) || 0 }))}
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
