import { TeamData } from "./types";

const STORAGE_KEY = "ta-dashboard-v3";

export const defaultData: TeamData = {
  settings: {
    year: 2026,
    totalDays: 30,
    teamTarget: 260,
    currentDay: 23,
  },
  recruiters: [
    //                           ── June ──        ── May ──          ── April ──
    { id:"1",  name:"Beatriz Kiene", juneTarget:35, juneStartsTD:31, juneQuality:75.0, mayStarts:31, mayQuality:74.0, aprilStarts:24, aprilQuality:71.0 },
    { id:"2",  name:"Julie",         juneTarget:32, juneStartsTD:24, juneQuality:73.5, mayStarts:24, mayQuality:71.0, aprilStarts:19, aprilQuality:68.0 },
    { id:"3",  name:"Monica",        juneTarget:28, juneStartsTD:19, juneQuality:76.5, mayStarts:21, mayQuality:74.0, aprilStarts:17, aprilQuality:71.0 },
    { id:"4",  name:"Nixzarindani",  juneTarget:27, juneStartsTD:18, juneQuality:81.0, mayStarts:21, mayQuality:79.0, aprilStarts:17, aprilQuality:75.0 },
    { id:"5",  name:"Angelica",      juneTarget:20, juneStartsTD:18, juneQuality:90.9, mayStarts:18, mayQuality:88.0, aprilStarts:14, aprilQuality:84.0 },
    { id:"6",  name:"Brandy",        juneTarget:10, juneStartsTD:15, juneQuality:66.7, mayStarts:12, mayQuality:65.0, aprilStarts:10, aprilQuality:63.0 },
    { id:"7",  name:"Jose",          juneTarget:23, juneStartsTD:11, juneQuality:84.2, mayStarts:18, mayQuality:82.0, aprilStarts:14, aprilQuality:78.0 },
    { id:"8",  name:"Kasey",         juneTarget:25, juneStartsTD:11, juneQuality:71.4, mayStarts:21, mayQuality:70.0, aprilStarts:17, aprilQuality:67.0 },
    { id:"9",  name:"Chris",         juneTarget:23, juneStartsTD:8,  juneQuality:71.4, mayStarts:21, mayQuality:70.0, aprilStarts:17, aprilQuality:67.0 },
    { id:"10", name:"Brittany",      juneTarget:22, juneStartsTD:6,  juneQuality:94.7, mayStarts:19, mayQuality:78.9, aprilStarts:15, aprilQuality:74.0 },
    { id:"11", name:"Bianca",        juneTarget:15, juneStartsTD:2,  juneQuality:87.5, mayStarts:8,  mayQuality:83.0, aprilStarts:6,  aprilQuality:79.0 },
  ],
  lastUpdated: "2026-06-23",
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

// Aliases used by new tab components
export const loadData = loadTeamData;
export const saveData = saveTeamData;
