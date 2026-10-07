import type { DepositType } from "@/constants/theme";
import { getDepositInfo } from "@/constants/deposit";
import { clearSession, summarize, type ScanEntry, type SessionSummary } from "@/lib/deposit-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

const KEY = "deposit_history_v1";

export type DepositRecord = SessionSummary & {
  id: string;
  finishedAt: number;
  scans: ScanEntry[];
};

let records: DepositRecord[] = [];
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function load() {
  loading ??= AsyncStorage.getItem(KEY).then((value) => {
      const stored: DepositRecord[] = value ? JSON.parse(value) : [];
      records = [...records, ...stored];
      emit();
    }).catch(() => {});
  return loading;
}

function commit(next: DepositRecord[]) {
  records = next;
  emit();
  AsyncStorage.setItem(KEY, JSON.stringify(records)).catch(() => {});
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  load();
  return () => listeners.delete(listener);
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Speichert die aktuelle Abgabe im Verlauf und startet den Zähler neu. */
export function saveDeposit(): DepositRecord | null {
  const scans = clearSession();
  if (scans.length === 0) return null;
  const record: DepositRecord = {
    id: createId(),
    finishedAt: Date.now(),
    scans,
    ...summarize(scans),
  };
  commit([record, ...records]);
  return record;
}

export function getDeposit(id: string): DepositRecord | null {
  return records.find((record) => record.id === id) ?? null;
}

export function deleteDeposit(id: string) {
  commit(records.filter((record) => record.id !== id));
}

export async function clearHistory() {
  await load();
  commit([]);
}

export async function loadHistory(): Promise<DepositRecord[]> {
  await load();
  return records;
}

export function useDepositHistory(): DepositRecord[] {
  return useSyncExternalStore(subscribe, () => records, () => records);
}

const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export function getMonthName(timestamp: number) {
  return MONTHS[new Date(timestamp).getMonth()];
}

export function formatWeekdayShort(timestamp: number) {
  return WEEKDAYS[new Date(timestamp).getDay()].slice(0, 2);
}

export function formatDayOfMonth(timestamp: number) {
  return String(new Date(timestamp).getDate()).padStart(2, "0");
}

/** "Samstag, 3. Oktober" */
export function formatLongDate(timestamp: number) {
  const date = new Date(timestamp);
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()}. ${MONTHS[date.getMonth()]}`;
}

export function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatCrates(count: number) {
  return `${count} ${count === 1 ? "Kasten" : "Kästen"}`;
}

export function formatBottles(count: number) {
  return `${count} ${count === 1 ? "Flasche" : "Flaschen"}`;
}

/** "18:05 · 2 Kästen · 40 Flaschen" */
export function formatDepositDetails(record: DepositRecord) {
  return [
    formatTime(record.finishedAt),
    record.crateCount > 0 && formatCrates(record.crateCount),
    (record.bottleCount > 0 || record.crateCount === 0) && formatBottles(record.bottleCount),
  ].filter(Boolean).join(" · ");
}

function formatCsvDate(timestamp: number) {
  const date = new Date(timestamp);
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

function csvCell(value: string) {
  return /[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function historyToCsv(list: DepositRecord[]) {
  const header = ["Datum", "Uhrzeit", "Produkt", "Volumen (l)", "Pfandart", "Pfand (€)"];
  const rows = [...list].sort((a, b) => a.finishedAt - b.finishedAt).flatMap((record) =>
    record.scans.map((scan) => [
      formatCsvDate(record.finishedAt),
      formatTime(record.finishedAt),
      scan.name,
      scan.volume ? String(scan.volume).replace(".", ",") : "",
      getDepositInfo(scan.type).label,
      (scan.amount / 100).toFixed(2).replace(".", ","),
    ]),
  );
  return [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
}

export type DepositFilter ="alle" | "einweg" | "mehrweg";

const FILTER_TYPES: Record<Exclude<DepositFilter, "alle">, DepositType[]> = {
  einweg: ["einweg"],
  mehrweg: ["mehrweg", "glas", "kasten"],
};

export function matchesFilter(record: DepositRecord, filter: DepositFilter) {
  if (filter === "alle") return true;
  return record.breakdown.some((entry) => FILTER_TYPES[filter].includes(entry.type));
}

export type DepositGroup = {
  key: string;
  title: string;
  currentWeek: boolean;
  records: DepositRecord[];
};

function startOfWeek(now: number) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date.getTime();
}

export function groupDeposits(list: DepositRecord[], now = Date.now()): DepositGroup[] {
  const weekStart = startOfWeek(now);
  const groups: DepositGroup[] = [];
  for (const record of [...list].sort((a, b) => b.finishedAt - a.finishedAt)) {
    const currentWeek = record.finishedAt >= weekStart;
    const date = new Date(record.finishedAt);
    const key = currentWeek ? "week" : `${date.getFullYear()}-${date.getMonth()}`;
    let group = groups.at(-1);
    if (group?.key !== key) {
      group = { key, title: currentWeek ? "Diese Woche" : `${MONTHS[date.getMonth()]} ${date.getFullYear()}`, currentWeek, records: [] };
      groups.push(group);
    }
    group.records.push(record);
  }
  return groups;
}

export type HistoryStats = {
  monthTotal: number;
  monthCount: number;
  total: number;
  bottleCount: number;
};

export function summarizeHistory(list: DepositRecord[], now = Date.now()): HistoryStats {
  const today = new Date(now);
  const month = list.filter((record) => {
    const date = new Date(record.finishedAt);
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
  });
  return {
    monthTotal: month.reduce((sum, record) => sum + record.total, 0),
    monthCount: month.length,
    total: list.reduce((sum, record) => sum + record.total, 0),
    bottleCount: list.reduce((sum, record) => sum + record.bottleCount, 0),
  };
}
