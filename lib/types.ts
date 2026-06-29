export interface Recruiter {
  id: string;
  name: string;
  // June commitment
  juneTarget: number;
  // Historical actuals (completed months)
  aprilStarts: number;
  aprilQuality: number; // %
  mayStarts: number;
  mayQuality: number;   // %
  // June current — updated daily via Upload Stats
  juneStartsTD: number;
  juneQuality: number;  // % hire quality (5th shift in 30 days)
}

export interface TeamSettings {
  year: number;
  totalDays: number;   // 30 for June
  teamTarget: number;  // 260
  currentDay: number;
}

export interface TeamData {
  settings: TeamSettings;
  recruiters: Recruiter[];
  lastUpdated: string;
}
