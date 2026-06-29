"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { recruiters } from "@/lib/data";
import { cn } from "@/lib/utils";
import { DollarSign, TrendingUp, Star } from "lucide-react";

const tiers = [
  { label: "Bronze", min: 0, max: 79, bonus: "Base only", color: "text-amber-700", bg: "bg-amber-50" },
  { label: "Silver", min: 80, max: 99, bonus: "+2% bonus", color: "text-slate-500", bg: "bg-slate-50" },
  { label: "Gold", min: 100, max: 119, bonus: "+5% bonus", color: "text-yellow-600", bg: "bg-yellow-50" },
  { label: "Platinum", min: 120, max: 999, bonus: "+8% bonus", color: "text-indigo-600", bg: "bg-indigo-50" },
];

function getTier(pct: number) {
  return tiers.find((t) => pct >= t.min && pct <= t.max) ?? tiers[0];
}

export function IncentivePlan() {
  const totalActual = recruiters.reduce((s, r) => s + r.actual, 0);
  const totalCommitment = recruiters.reduce((s, r) => s + r.commitment, 0);

  return (
    <div className="space-y-6">
      {/* Tier Legend */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Incentive Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tiers.map((tier) => (
              <div key={tier.label} className={cn("rounded-lg p-3 border", tier.bg)}>
                <p className={cn("font-semibold text-sm", tier.color)}>{tier.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tier.max === 999 ? `≥${tier.min}%` : `${tier.min}–${tier.max}%`} attainment
                </p>
                <p className={cn("text-xs font-medium mt-1", tier.color)}>{tier.bonus}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            Team Attainment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium">Team Total: ${totalActual.toLocaleString()} / ${totalCommitment.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {Math.round((totalActual / totalCommitment) * 100)}% overall attainment
              </p>
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="space-y-3">
            {recruiters.map((r) => {
              const pct = Math.round((r.actual / r.commitment) * 100);
              const tier = getTier(pct);
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-28 shrink-0">{r.name}</span>
                  <Progress
                    value={Math.min(pct, 100)}
                    className={cn(
                      "h-2 flex-1",
                      pct >= 120 ? "[&>div]:bg-indigo-500" :
                      pct >= 100 ? "[&>div]:bg-yellow-500" :
                      pct >= 80  ? "[&>div]:bg-slate-400" : "[&>div]:bg-amber-600"
                    )}
                  />
                  <span className="text-xs font-mono w-10 text-right">{pct}%</span>
                  <Badge variant="outline" className={cn("text-xs w-20 justify-center", tier.color)}>
                    {tier.label}
                  </Badge>
                  <span className={cn("text-xs w-20 text-right font-medium", tier.color)}>{tier.bonus}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
