import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

const KEY = "settings_v1";

export const REMINDER_DAY_OPTIONS = [3, 7, 14] as const;
export const REMINDER_MIN_AMOUNT_OPTIONS = [0, 300, 500, 1000] as const;
export const REMINDER_HOUR_OPTIONS = [9, 18, 20] as const;

export type Settings = {
  sound: boolean;
  vibration: boolean;
  autoAdd: boolean;
  reminderEnabled: boolean;
  reminderDays: (typeof REMINDER_DAY_OPTIONS)[number];
  reminderMinAmount: (typeof REMINDER_MIN_AMOUNT_OPTIONS)[number];
  reminderHour: (typeof REMINDER_HOUR_OPTIONS)[number];
};

const DEFAULT_SETTINGS: Settings = {
  sound: true,
  vibration: true,
  autoAdd: false,
  reminderEnabled: false,
  reminderDays: 7,
  reminderMinAmount: 300,
  reminderHour: 18,
};

let settings: Settings = DEFAULT_SETTINGS;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function load() {
  loading ??= AsyncStorage.getItem(KEY).then((value) => {
      const stored: Partial<Settings> = value ? JSON.parse(value) : {};
      settings = { ...DEFAULT_SETTINGS, ...stored };
      emit();
    }).catch(() => {});
  return loading;
}

function commit(next: Settings) {
  settings = next;
  emit();
  AsyncStorage.setItem(KEY, JSON.stringify(settings)).catch(() => {});
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  load();
  return () => listeners.delete(listener);
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  commit({ ...settings, [key]: value });
}

export function resetSettings() {
  commit(DEFAULT_SETTINGS);
}

export async function loadSettings(): Promise<Settings> {
  await load();
  return settings;
}

export function getSettings(): Settings {
  load();
  return settings;
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, () => settings, () => settings);
}
