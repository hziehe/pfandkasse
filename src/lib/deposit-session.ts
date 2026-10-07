import { DEPOSIT_TYPES, getDepositInfo } from "@/constants/deposit";
import type { DepositType } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const KEY = "deposit_session_v1";

export type ScanEntry = {
  id: string;
  name: string;
  volume?: number;
  type: DepositType;
  amount: number;
  scannedAt: number;
};

export type NewScan = Pick<ScanEntry, "name" | "volume" | "type"> & { amount?: number; scannedAt?: number };

export type DepositBreakdown = {
  type: DepositType;
  label: string;
  unitAmount: number;
  count: number;
  total: number;
  share: number;
};

export type SessionSummary = {
  total: number;
  bottleCount: number;
  crateCount: number;
  breakdown: DepositBreakdown[];
};

let entries: ScanEntry[] = [];
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function load() {
  loading ??= AsyncStorage.getItem(KEY).then((value) => {
      const stored: ScanEntry[] = value ? JSON.parse(value) : [];
      entries = [...stored, ...entries];
      loaded = true;
      emit();
    }).catch(() => {
      loaded = true;
      emit();
    });
  return loading;
}

function commit(next: ScanEntry[]) {
  entries = next;
  emit();
  AsyncStorage.setItem(KEY, JSON.stringify(entries)).catch(() => {});
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  load();
  return () => listeners.delete(listener);
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function toEntry(scan: NewScan): ScanEntry {
  return {
    id: createId(),
    name: scan.name,
    volume: scan.volume,
    type: scan.type,
    amount: scan.amount ?? getDepositInfo(scan.type).amount,
    scannedAt: scan.scannedAt ?? Date.now(),
  };
}

export function addScan(scan: NewScan): ScanEntry {
  const entry = toEntry(scan);
  commit([...entries, entry]);
  return entry;
}

export function addScans(scans: NewScan[]): ScanEntry[] {
  const added = scans.map(toEntry);
  commit([...entries, ...added]);
  return added;
}

export function undoLastScan(): ScanEntry | null {
  const last = getLatestScan(entries);
  if (!last) return null;
  commit(entries.filter((entry) => entry.id !== last.id));
  return last;
}

export function removeScan(id: string) {
  commit(entries.filter((entry) => entry.id !== id));
}

export function clearSession(): ScanEntry[] {
  const finished = entries;
  commit([]);
  return finished;
}

export function getScans(): ScanEntry[] {
  return entries;
}

export async function loadSession(): Promise<ScanEntry[]> {
  await load();
  return entries;
}

export function getLatestScan(scans: ScanEntry[]): ScanEntry | null {
  let latest: ScanEntry | null = null;
  for (const scan of scans) {
    if (!latest || scan.scannedAt >= latest.scannedAt) latest = scan;
  }
  return latest;
}

export function sortByNewest(scans: ScanEntry[]): ScanEntry[] {
  return [...scans].sort((a, b) => b.scannedAt - a.scannedAt);
}

export function summarize(scans: ScanEntry[]): SessionSummary {
  const total = scans.reduce((sum, scan) => sum + scan.amount, 0);
  const breakdown: DepositBreakdown[] = [];

  for (const deposit of DEPOSIT_TYPES) {
    const ofType = scans.filter((scan) => scan.type === deposit.type);
    if (ofType.length === 0) continue;
    const typeTotal = ofType.reduce((sum, scan) => sum + scan.amount, 0);
    breakdown.push({
      type: deposit.type,
      label: deposit.shortLabel,
      unitAmount: deposit.amount,
      count: ofType.length,
      total: typeTotal,
      share: total > 0 ? typeTotal / total : 0,
    });
  }

  const bottleCount = scans.filter((scan) => scan.type !== "kasten").length;
  const crateCount = scans.length - bottleCount;
  return { total, bottleCount, crateCount, breakdown };
}

export function formatVolume(liters: number) {
  return `${String(liters).replace(".", ",")} l`;
}

export function formatScanTitle(scan: Pick<ScanEntry, "name" | "volume">) {
  return scan.volume ? `${scan.name} ${formatVolume(scan.volume)}` : scan.name;
}

export function formatRelativeTime(timestamp: number, now = Date.now()) {
  const minutes = Math.floor((now - timestamp) / 60_000);
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "gestern" : `vor ${days} Tagen`;
}

export function useScans(): ScanEntry[] {
  return useSyncExternalStore(subscribe, () => entries, () => entries);
}

export function useSessionLoaded(): boolean {
  return useSyncExternalStore(subscribe, () => loaded, () => loaded);
}

export function useDepositSession() {
  const scans = useScans();
  return useMemo(() => {
    const sorted = sortByNewest(scans);
    return {
      scans: sorted,
      summary: summarize(scans),
      latest: sorted[0] ?? null,
      previous: sorted.slice(1),
    };
  }, [scans]);
}

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

// --- Entwicklung ---
export function seedDemoSession() {
  const now = Date.now();
  const min = 60_000;
  const demo: NewScan[] = [
    ...Array.from({ length: 13 }, (_, i): NewScan => ({ name: "Cola", volume: 0.5, type: "einweg", scannedAt: now - (40 - i) * min })),
    ...Array.from({ length: 2 }, (_, i): NewScan => ({ name: "Apfelschorle", volume: 1, type: "mehrweg", scannedAt: now - (25 - i) * min })),
    ...Array.from({ length: 8 }, (_, i): NewScan => ({ name: "Pils", volume: 0.5, type: "glas", scannedAt: now - (20 - i) * min })),
    { name: "Saftschorle", volume: 0.5, type: "mehrweg", scannedAt: now - 5 * min },
    { name: "Pils", volume: 0.5, type: "glas", scannedAt: now - 3 * min },
    { name: "Bierkasten", type: "kasten", scannedAt: now - 10 * min },
    { name: "Mineralwasser", volume: 1.5, type: "einweg", scannedAt: now },
  ];
  commit(
    demo.map((scan) => ({
      id: createId(),
      name: scan.name,
      volume: scan.volume,
      type: scan.type,
      amount: getDepositInfo(scan.type).amount,
      scannedAt: scan.scannedAt!,
    })),
  );
}
