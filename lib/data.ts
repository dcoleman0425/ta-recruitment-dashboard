export interface Recruiter {
  id: string;
  name: string;
  startDate: string;
  region: string;
  commitment: number;
  actual: number;
  interviews: number;
  offers: number;
  hires: number;
  pipeline: number;
  status: "on-track" | "at-risk" | "exceeding";
}

export interface DailyEntry {
  date: string;
  totalActual: number;
  newPipeline: number;
  interviews: number;
  offers: number;
  hires: number;
}

export const recruiters: Recruiter[] = [
  {
    id: "1",
    name: "Kasey M.",
    startDate: "2026-05-01",
    region: "Bay Area",
    commitment: 25000,
    actual: 28500,
    interviews: 42,
    offers: 18,
    hires: 12,
    pipeline: 31,
    status: "exceeding",
  },
  {
    id: "2",
    name: "Maria T.",
    startDate: "2025-01-15",
    region: "LA / SoCal",
    commitment: 30000,
    actual: 27200,
    interviews: 38,
    offers: 15,
    hires: 9,
    pipeline: 24,
    status: "at-risk",
  },
  {
    id: "3",
    name: "James R.",
    startDate: "2024-09-10",
    region: "Central Valley",
    commitment: 28000,
    actual: 31000,
    interviews: 51,
    offers: 22,
    hires: 14,
    pipeline: 38,
    status: "exceeding",
  },
  {
    id: "4",
    name: "Priya S.",
    startDate: "2025-03-20",
    region: "Sacramento",
    commitment: 22000,
    actual: 22000,
    interviews: 29,
    offers: 11,
    hires: 8,
    pipeline: 19,
    status: "on-track",
  },
  {
    id: "5",
    name: "Destiny W.",
    startDate: "2025-06-01",
    region: "Bay Area",
    commitment: 20000,
    actual: 18500,
    interviews: 24,
    offers: 9,
    hires: 6,
    pipeline: 16,
    status: "at-risk",
  },
  {
    id: "6",
    name: "Carlos M.",
    startDate: "2024-11-05",
    region: "San Diego",
    commitment: 27000,
    actual: 27800,
    interviews: 44,
    offers: 19,
    hires: 11,
    pipeline: 28,
    status: "on-track",
  },
  {
    id: "7",
    name: "Tanya B.",
    startDate: "2025-02-10",
    region: "Inland Empire",
    commitment: 24000,
    actual: 25500,
    interviews: 36,
    offers: 14,
    hires: 10,
    pipeline: 22,
    status: "exceeding",
  },
  {
    id: "8",
    name: "Derek H.",
    startDate: "2025-07-01",
    region: "SF / Peninsula",
    commitment: 18000,
    actual: 15200,
    interviews: 19,
    offers: 7,
    hires: 4,
    pipeline: 12,
    status: "at-risk",
  },
  {
    id: "9",
    name: "Lena P.",
    startDate: "2024-08-20",
    region: "East Bay",
    commitment: 26000,
    actual: 24800,
    interviews: 40,
    offers: 16,
    hires: 10,
    pipeline: 21,
    status: "on-track",
  },
  {
    id: "10",
    name: "Omar A.",
    startDate: "2025-04-15",
    region: "Fresno / Central",
    commitment: 21000,
    actual: 20500,
    interviews: 27,
    offers: 10,
    hires: 7,
    pipeline: 17,
    status: "on-track",
  },
];

export const weeklyTrend: DailyEntry[] = [
  { date: "Jun 2", totalActual: 195000, newPipeline: 28, interviews: 31, offers: 12, hires: 7 },
  { date: "Jun 9", totalActual: 208000, newPipeline: 34, interviews: 38, offers: 15, hires: 9 },
  { date: "Jun 16", totalActual: 219000, newPipeline: 31, interviews: 36, offers: 14, hires: 8 },
  { date: "Jun 23", totalActual: 231000, newPipeline: 38, interviews: 42, offers: 18, hires: 10 },
];

export const monthlyGoal = 260000;
export const teamGoal = 241000;
