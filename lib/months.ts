import { TeamData, MonthEntry } from "./types";

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function parseMonthKey(key: string): { y: number; m: number } {
  const [y, m] = key.split("-").map(Number);
  return { y, m };
}

export function monthLabel(key: string): string {
  const { y, m } = parseMonthKey(key);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export function monthShort(key: string): string {
  const { m } = parseMonthKey(key);
  return MONTH_NAMES[m - 1].slice(0, 3);
}

export function daysInMonth(key: string): number {
  const { y, m } = parseMonthKey(key);
  return new Date(y, m, 0).getDate();
}

export function nextMonthKey(key: string): string {
  let { y, m } = parseMonthKey(key);
  m += 1;
  if (m > 12) { m = 1; y += 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function prevMonthKey(key: string): string {
  let { y, m } = parseMonthKey(key);
  m -= 1;
  if (m < 1) { m = 12; y -= 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function emptyMonthEntry(target = 0): MonthEntry {
  return { starts: 0, quality: 0, target };
}

export function getMonthEntry(months: Record<string, MonthEntry>, key: string): MonthEntry {
  return months[key] ?? emptyMonthEntry();
}

/** Closes out the current month and opens the next one, carrying targets forward. */
export function startNextMonth(data: TeamData): TeamData {
  const { settings, recruiters } = data;
  const curKey = settings.currentMonthKey;
  const newKey = nextMonthKey(curKey);

  const alreadyTracked = settings.months.some(m => m.key === newKey);
  const months = alreadyTracked
    ? settings.months
    : [...settings.months, { key: newKey, totalDays: daysInMonth(newKey) }];

  const updatedRecruiters = recruiters.map(r => {
    const priorTarget = r.months[curKey]?.target ?? 0;
    const existing = r.months[newKey];
    return {
      ...r,
      months: {
        ...r.months,
        [newKey]: existing ?? emptyMonthEntry(priorTarget),
      },
    };
  });

  return {
    ...data,
    settings: {
      ...settings,
      months,
      currentMonthKey: newKey,
      currentDay: 1,
    },
    recruiters: updatedRecruiters,
    lastUpdated: new Date().toISOString(),
  };
}
