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

export function useDepositHistory(): DepositRecord[] {
  return useSyncExternalStore(subscribe, () => records, () => records);
}
