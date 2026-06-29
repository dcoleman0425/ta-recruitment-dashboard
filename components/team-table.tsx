"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Recruiter } from "@/lib/data";
import { cn } from "@/lib/utils";

interface TeamTableProps {
  recruiters: Recruiter[];
}

const statusConfig = {
  exceeding: { label: "Exceeding", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "on-track": { label: "On Track", className: "bg-blue-100 text-blue-700 border-blue-200" },
  "at-risk": { label: "At Risk", className: "bg-red-100 text-red-700 border-red-200" },
};

export function TeamTable({ recruiters }: TeamTableProps) {
  const [search, setSearch] = useState("");

  const filtered = recruiters.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or region..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Recruiter</TableHead>
              <TableHead className="font-semibold">Region</TableHead>
              <TableHead className="font-semibold text-right">Commitment</TableHead>
              <TableHead className="font-semibold text-right">Actual</TableHead>
              <TableHead className="font-semibold w-40">Progress</TableHead>
              <TableHead className="font-semibold text-center">Interviews</TableHead>
              <TableHead className="font-semibold text-center">Offers</TableHead>
              <TableHead className="font-semibold text-center">Hires</TableHead>
              <TableHead className="font-semibold text-center">Pipeline</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => {
              const pct = Math.min(Math.round((r.actual / r.commitment) * 100), 150);
              return (
                <TableRow key={r.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.region}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    ${r.commitment.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono text-sm font-semibold",
                      r.actual >= r.commitment ? "text-emerald-600" : "text-red-500"
                    )}
                  >
                    ${r.actual.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={Math.min(pct, 100)}
                        className={cn(
                          "h-2",
                          pct >= 100 ? "[&>div]:bg-emerald-500" : pct >= 80 ? "[&>div]:bg-amber-400" : "[&>div]:bg-red-400"
                        )}
                      />
                      <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">{r.interviews}</TableCell>
                  <TableCell className="text-center text-sm">{r.offers}</TableCell>
                  <TableCell className="text-center text-sm font-semibold">{r.hires}</TableCell>
                  <TableCell className="text-center text-sm">{r.pipeline}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", statusConfig[r.status].className)}
                    >
                      {statusConfig[r.status].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
