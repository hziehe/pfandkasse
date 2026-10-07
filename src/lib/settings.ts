import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

const KEY = "settings_v1";

export type Settings = {
  sound: boolean;
  vibration: boolean;
  autoAdd: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  sound: true,
  vibration: true,
  autoAdd: false,
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

export function getSettings(): Settings {
  load();
  return settings;
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, () => settings, () => settings);
}
