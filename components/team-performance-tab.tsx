"use client";
import { Fragment } from "react";
import { TeamData } from "@/lib/types";
import { getMonthEntry, monthShort } from "@/lib/months";
import { getProjectedEOM, getProjectedPayout, getActualPayout, getQualityBadgeClass } from "@/lib/calculations";
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
  const curKey = settings.currentMonthKey;
  const curTotalDays = settings.months.find(m => m.key === curKey)?.totalDays ?? settings.currentDay;
  const monthKeys = [...settings.months].sort((a, b) => a.key.localeCompare(b.key)).map(m => m.key);
  const historicalKeys = monthKeys.filter(k => k !== curKey);

  const enriched = recruiters.map(r => {
    const curEntry = getMonthEntry(r.months, curKey);
    const curProj  = getProjectedEOM(curEntry.starts, settings.currentDay, curTotalDays);
    const curEst   = getProjectedPayout(curProj, curEntry.quality);
    return { ...r, curEntry, curProj, curEst };
  }).sort((a, b) => b.curEntry.starts - a.curEntry.starts);

  const totals = {
    curTD:   recruiters.reduce((s, r) => s + getMonthEntry(r.months, curKey).starts, 0),
    curProj: enriched.reduce((s, r) => s + r.curProj, 0),
    curEst:  enriched.reduce((s, r) => s + r.curEst, 0),
    historical: Object.fromEntries(historicalKeys.map(k => [
      k,
      {
        starts:  recruiters.reduce((s, r) => s + getMonthEntry(r.months, k).starts, 0),
        payout:  recruiters.reduce((s, r) => {
          const e = getMonthEntry(r.months, k);
          return s + getActualPayout(e.starts, e.quality);
        }, 0),
      },
    ])),
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-500" />
            Full Team — Month-over-Month Comparison
          </CardTitle>
          <p className="text-xs text-muted-foreground">Quality color-coded: 🟢 ≥80% · 🟡 75–79% · 🔴 &lt;75%</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b bg-slate-50 text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left px-4 py-2 sticky left-0 bg-slate-50 font-medium">Recruiter</th>
                  {historicalKeys.map(k => (
                    <Fragment key={k}>
                      <th className="text-center px-2 py-2 font-medium border-l text-slate-500">{monthShort(k)} Starts</th>
                      <th className="text-center px-2 py-2 font-medium text-slate-500">{monthShort(k)} Quality</th>
                      <th className="text-center px-2 py-2 font-medium text-slate-500">{monthShort(k)} Payout</th>
                    </Fragment>
                  ))}
                  <th className="text-center px-2 py-2 font-medium border-l text-indigo-700 bg-indigo-50/50">{monthShort(curKey)} TD</th>
                  <th className="text-center px-2 py-2 font-medium text-indigo-700 bg-indigo-50/50">{monthShort(curKey)} Proj.</th>
                  <th className="text-center px-2 py-2 font-medium text-indigo-700 bg-indigo-50/50">{monthShort(curKey)} Quality</th>
                  <th className="text-center px-2 py-2 font-medium text-indigo-700 bg-indigo-50/50">{monthShort(curKey)} Est. Payout</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((r, i) => (
                  <tr key={r.id} className={`border-b last:border-0 hover:bg-slate-50/40 transition-colors ${i === 0 ? "bg-yellow-50/30" : ""}`}>
                    <td className="px-4 py-2.5 font-medium text-slate-800 sticky left-0 bg-white">
                      {i === 0 && "🏆 "}{r.name}
                    </td>
                    {historicalKeys.map(k => {
                      const e = getMonthEntry(r.months, k);
                      const payout = getActualPayout(e.starts, e.quality);
                      return (
                        <Fragment key={k}>
                          <td className="px-2 py-2.5 text-center text-slate-500 border-l">{e.starts}</td>
                          <td className="px-2 py-2.5 text-center"><QualityBadge q={e.quality} /></td>
                          <td className="px-2 py-2.5 text-center text-slate-500 text-xs">${payout}</td>
                        </Fragment>
                      );
                    })}
                    <td className="px-2 py-2.5 text-center font-bold text-indigo-700 border-l bg-indigo-50/20">{r.curEntry.starts}</td>
                    <td className={`px-2 py-2.5 text-center font-bold bg-indigo-50/20 ${r.curProj >= r.curEntry.target ? "text-emerald-600" : "text-red-600"}`}>{r.curProj}</td>
                    <td className="px-2 py-2.5 text-center bg-indigo-50/20"><QualityBadge q={r.curEntry.quality} /></td>
                    <td className="px-2 py-2.5 text-center font-bold text-indigo-700 bg-indigo-50/20">${r.curEst}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-sm">
                  <td className="px-4 py-2 text-slate-700 sticky left-0 bg-slate-100">TEAM TOTAL</td>
                  {historicalKeys.map(k => (
                    <Fragment key={k}>
                      <td className="px-2 py-2 text-center text-slate-600 border-l">{totals.historical[k].starts}</td>
                      <td className="px-2 py-2 text-center text-slate-500 text-xs">—</td>
                      <td className="px-2 py-2 text-center text-slate-600">${totals.historical[k].payout.toLocaleString()}</td>
                    </Fragment>
                  ))}
                  <td className="px-2 py-2 text-center text-indigo-700 border-l">{totals.curTD}</td>
                  <td className="px-2 py-2 text-center text-indigo-700">{totals.curProj}</td>
                  <td className="px-2 py-2 text-center text-slate-500 text-xs">—</td>
                  <td className="px-2 py-2 text-center text-indigo-700">${totals.curEst.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
