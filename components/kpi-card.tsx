"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  color?: "default" | "green" | "red" | "blue" | "amber";
}

const colorMap = {
  default: "text-muted-foreground",
  green: "text-emerald-600",
  red: "text-red-500",
  blue: "text-blue-600",
  amber: "text-amber-600",
};

const bgMap = {
  default: "bg-muted/40",
  green: "bg-emerald-50 dark:bg-emerald-900/20",
  red: "bg-red-50 dark:bg-red-900/20",
  blue: "bg-blue-50 dark:bg-blue-900/20",
  amber: "bg-amber-50 dark:bg-amber-900/20",
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trendLabel,
  color = "default",
}: KpiCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", bgMap[color])}>
          <Icon className={cn("h-4 w-4", colorMap[color])} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", colorMap[color])}>{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        {trendLabel && (
          <p className={cn("text-xs font-medium mt-1", colorMap[color])}>{trendLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
