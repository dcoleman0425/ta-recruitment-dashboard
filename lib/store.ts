import { TeamData } from "./types";

const STORAGE_KEY = "ta-dashboard-v4";

const NAMES: { id: string; name: string; juneTarget: number; juneStarts: number; juneQuality: number; mayStarts: number; mayQuality: number; aprilStarts: number; aprilQuality: number }[] = [
  { id: "1",  name: "Beatriz Kiene", juneTarget: 35, juneStarts: 35, juneQuality: 76.0, mayStarts: 31, mayQuality: 74.0, aprilStarts: 24, aprilQuality: 71.0 },
  { id: "2",  name: "Julie",         juneTarget: 32, juneStarts: 30, juneQuality: 74.0, mayStarts: 24, mayQuality: 71.0, aprilStarts: 19, aprilQuality: 68.0 },
  { id: "3",  name: "Monica",        juneTarget: 28, juneStarts: 24, juneQuality: 77.0, mayStarts: 21, mayQuality: 74.0, aprilStarts: 17, aprilQuality: 71.0 },
  { id: "4",  name: "Nixzarindani",  juneTarget: 27, juneStarts: 23, juneQuality: 81.5, mayStarts: 21, mayQuality: 79.0, aprilStarts: 17, aprilQuality: 75.0 },
  { id: "5",  name: "Angelica",      juneTarget: 20, juneStarts: 22, juneQuality: 91.0, mayStarts: 18, mayQuality: 88.0, aprilStarts: 14, aprilQuality: 84.0 },
  { id: "6",  name: "Brandy",        juneTarget: 10, juneStarts: 19, juneQuality: 67.0, mayStarts: 12, mayQuality: 65.0, aprilStarts: 10, aprilQuality: 63.0 },
  { id: "7",  name: "Jose",          juneTarget: 23, juneStarts: 20, juneQuality: 84.5, mayStarts: 18, mayQuality: 82.0, aprilStarts: 14, aprilQuality: 78.0 },
  { id: "8",  name: "Kasey",         juneTarget: 25, juneStarts: 21, juneQuality: 72.0, mayStarts: 21, mayQuality: 70.0, aprilStarts: 17, aprilQuality: 67.0 },
  { id: "9",  name: "Chris",         juneTarget: 23, juneStarts: 20, juneQuality: 72.0, mayStarts: 21, mayQuality: 70.0, aprilStarts: 17, aprilQuality: 67.0 },
  { id: "10", name: "Brittany",      juneTarget: 22, juneStarts: 20, juneQuality: 92.0, mayStarts: 19, mayQuality: 78.9, aprilStarts: 15, aprilQuality: 74.0 },
  { id: "11", name: "Bianca",        juneTarget: 15, juneStarts: 12, juneQuality: 86.0, mayStarts: 8,  mayQuality: 83.0, aprilStarts: 6,  aprilQuality: 79.0 },
];

export const defaultData: TeamData = {
  settings: {
    months: [
      { key: "2026-04", totalDays: 30 },
      { key: "2026-05", totalDays: 31 },
      { key: "2026-06", totalDays: 30 },
      { key: "2026-07", totalDays: 31 },
    ],
    currentMonthKey: "2026-07",
    currentDay: 1,
    teamTarget: 260,
  },
  recruiters: NAMES.map(p => ({
    id: p.id,
    name: p.name,
    months: {
      "2026-04": { starts: p.aprilStarts, quality: p.aprilQuality, target: p.juneTarget },
      "2026-05": { starts: p.mayStarts,   quality: p.mayQuality,   target: p.juneTarget },
      "2026-06": { starts: p.juneStarts,  quality: p.juneQuality,  target: p.juneTarget },
      "2026-07": { starts: 0,             quality: 0,              target: p.juneTarget },
    },
  })),
  lastUpdated: "2026-07-01",
};

export function loadTeamData(): TeamData {
  if (typeof window === "undefined") return defaultData;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as TeamData;
  } catch {}
  return defaultData;
}

export function saveTeamData(data: TeamData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

// Aliases used by tab components
export const loadData = loadTeamData;
export const saveData = saveTeamData;
