import { useSyncExternalStore } from "react";

export type ThemeOverride = "light" | "dark" | null;

let override: ThemeOverride = null;
const listeners = new Set<() => void>();

export function setThemeOverride(value: ThemeOverride) {
  override = value;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useThemeOverride(): ThemeOverride {
  return useSyncExternalStore(subscribe, () => override, () => override);
}
