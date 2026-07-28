export interface MonthEntry {
  starts: number;   // starts to date (or final starts once month is closed out)
  quality: number;  // hire quality % (5th shift in 30 days)
  target: number;   // this recruiter's starts commitment for that month
  qualityTarget: number; // this recruiter's hire quality % commitment for that month
}

export interface Recruiter {
  id: string;
  name: string;
  // Map of month key ("YYYY-MM") -> that month's data for this recruiter
  months: Record<string, MonthEntry>;
}

export interface MonthMeta {
  key: string;       // "2026-07"
  totalDays: number; // business/calendar days in that month used for pacing
}

export interface TeamSettings {
  months: MonthMeta[];      // all tracked months, oldest -> newest
  currentMonthKey: string;  // key of the month currently in progress
  currentDay: number;       // day-of-month counter for the current month
  teamTarget: number;       // team starts target for the current month
  teamQualityTarget: number; // team hire quality % target for the current month
}

export interface TeamData {
  settings: TeamSettings;
  recruiters: Recruiter[];
  lastUpdated: string;
}
