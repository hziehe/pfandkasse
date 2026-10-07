import { getSettings } from "@/lib/settings";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export type HapticKind = "tap" | "success" | "warning";

const FEEDBACK: Record<HapticKind, () => Promise<void>> = {
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
};

export function haptic(kind: HapticKind = "tap") {
  if (Platform.OS === "web" || !getSettings().vibration) return;
  FEEDBACK[kind]().catch(() => {});
}
