"use client";
import { TeamData } from "@/lib/types";
import { getProjectedEOM, getProjectedPayout, getActualPayout, getQualityBadgeClass, getQualityColor } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface Props { data: TeamData; }

function QualityBadge({ q }: { q: number }) {
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold border ${getQualityBadgeClass(q)}`}>
      {q >= 80 ? "🟢" : q >= 75 ? "🟡" : "🔴"} {q.toFixed(1)}%
    </span>
  );
}

export function TeamPerformanceTab({ data }: Props) {
  const { settings, recruiters } = data;

  const enriched = recruiters.map(r => {
    const juneProj   = getProjectedEOM(r.juneStartsTD, settings.currentDay, settings.totalDays);
    const mayPayout  = getActualPayout(r.mayStarts, r.mayQuality);
    const juneEst    = getProjectedPayout(juneProj, r.juneQuality);
    const aprPayout  = getActualPayout(r.aprilStarts, r.aprilQuality);
    return { ...r, juneProj, mayPayout, juneEst, aprPayout };
  }).sort((a,b) => b.juneStartsTD - a.juneStartsTD);

  const totals = {
    aprilStarts:  recruiters.reduce((s,r) => s + r.aprilStarts, 0),
    mayStarts:    recruiters.reduce((s,r) => s + r.mayStarts, 0),
    juneTD:       recruiters.reduce((s,r) => s + r.juneStartsTD, 0),
    juneProj:     enriched.reduce((s,r) => s + r.juneProj, 0),
    mayPayout:    enriched.reduce((s,r) => s + r.mayPayout, 0),
    juneEst:      enriched.reduce((s,r) => s + r.juneEst, 0),
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-500" />
            Full Team — April / May / June Comparison
          </CardTitle>
          <p className="text-xs text-muted-foreground">Quality color-coded: 🟢 ≥80% · 🟡 75–79% · 🔴 &lt;75%</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b bg-slate-50 text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left px-4 py-2 sticky left-0 bg-slate-50 font-medium">Recruiter</th>
                  {/* April */}
                  <th className="text-center px-2 py-2 font-medium border-l text-slate-500">Apr Starts</th>
                  <th className="text-center px-2 py-2 font-medium text-slate-500">Apr Quality</th>
                  <th className="text-center px-2 py-2 font-medium text-slate-500">Apr Payout</th>
                  {/* May */}
                  <th className="text-center px-2 py-2 font-medium border-l text-blue-600">May Starts</th>
                  <th className="text-center px-2 py-2 font-medium text-blue-600">May Quality</th>
                  <th className="text-center px-2 py-2 font-medium text-blue-600">May Payout</th>
                  {/* June */}
                  <th className="text-center px-2 py-2 font-medium border-l text-indigo-700 bg-indigo-50/50">Jun TD</th>
                  <th className="text-center px-2 py-2 font-medium text-indigo-700 bg-indigo-50/50">Jun Proj.</th>
                  <th className="text-center px-2 py-2 font-medium text-indigo-700 bg-indigo-50/50">Jun Quality</th>
                  <th className="text-center px-2 py-2 font-medium text-indigo-700 bg-indigo-50/50">Jun Est. Payout</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((r, i) => (
                  <tr key={r.id} className={`border-b last:border-0 hover:bg-slate-50/40 transition-colors ${i === 0 ? "bg-yellow-50/30" : ""}`}>
                    <td className="px-4 py-2.5 font-medium text-slate-800 sticky left-0 bg-white">
                      {i === 0 && "🏆 "}{r.name}
                    </td>
                    {/* April */}
                    <td className="px-2 py-2.5 text-center text-slate-500 border-l">{r.aprilStarts}</td>
                    <td className="px-2 py-2.5 text-center"><QualityBadge q={r.aprilQuality} /></td>
                    <td className="px-2 py-2.5 text-center text-slate-500 text-xs">${r.aprPayout}</td>
                    {/* May */}
                    <td className="px-2 py-2.5 text-center font-medium text-blue-700 border-l">{r.mayStarts}</td>
                    <td className="px-2 py-2.5 text-center"><QualityBadge q={r.mayQuality} /></td>
                    <td className="px-2 py-2.5 text-center font-semibold text-blue-700">${r.mayPayout}</td>
                    {/* June */}
                    <td className="px-2 py-2.5 text-center font-bold text-indigo-700 border-l bg-indigo-50/20">{r.juneStartsTD}</td>
                    <td className={`px-2 py-2.5 text-center font-bold bg-indigo-50/20 ${r.juneProj >= r.juneTarget ? "text-emerald-600" : "text-red-600"}`}>{r.juneProj}</td>
                    <td className="px-2 py-2.5 text-center bg-indigo-50/20"><QualityBadge q={r.juneQuality} /></td>
                    <td className="px-2 py-2.5 text-center font-bold text-indigo-700 bg-indigo-50/20">${r.juneEst}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-sm">
                  <td className="px-4 py-2 text-slate-700 sticky left-0 bg-slate-100">TEAM TOTAL</td>
                  <td className="px-2 py-2 text-center text-slate-600 border-l">{totals.aprilStarts}</td>
                  <td className="px-2 py-2 text-center text-slate-500 text-xs">—</td>
                  <td className="px-2 py-2 text-center text-slate-600">${totals.mayPayout.toLocaleString()}</td>
                  <td className="px-2 py-2 text-center text-blue-700 border-l">{totals.mayStarts}</td>
                  <td className="px-2 py-2 text-center text-slate-500 text-xs">—</td>
                  <td className="px-2 py-2 text-center text-blue-700">${totals.mayPayout.toLocaleString()}</td>
                  <td className="px-2 py-2 text-center text-indigo-700 border-l">{totals.juneTD}</td>
                  <td className="px-2 py-2 text-center text-indigo-700">{totals.juneProj}</td>
                  <td className="px-2 py-2 text-center text-slate-500 text-xs">—</td>
                  <td className="px-2 py-2 text-center text-indigo-700">${totals.juneEst.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
