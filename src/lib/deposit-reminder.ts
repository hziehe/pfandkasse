import { formatEuro } from "@/constants/deposit";
import { loadSession, summarize, useScans, useSessionLoaded, type ScanEntry } from "@/lib/deposit-session";
import { loadSettings, useSettings, type Settings } from "@/lib/settings";
import type * as NotificationsModule from "expo-notifications";
import { router, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

const REMINDER_ID = "deposit-reminder";
const TEST_ID = "deposit-reminder-test";
const CHANNEL_ID = "deposit-reminder";
const TARGET_PATH = "/submission-preparation";
const DAY_MS = 86_400_000;
const SUPPORTED = Platform.OS !== "web";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Notifications: typeof NotificationsModule = SUPPORTED ? require("expo-notifications") : null!;

export type ReminderPlan = {
  date: Date;
  title: string;
  body: string;
};

if (SUPPORTED) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

function startOfDay(date: Date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function atHour(date: Date, hour: number) {
  const result = new Date(date);
  result.setHours(hour, 0, 0, 0);
  return result;
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function planReminder(scans: ScanEntry[], settings: Settings, now = new Date()): ReminderPlan | null {
  if (!settings.reminderEnabled || scans.length === 0) return null;

  const summary = summarize(scans);
  if (summary.total <= 0 || summary.total < settings.reminderMinAmount) return null;

  const firstScan = new Date(Math.min(...scans.map((scan) => scan.scannedAt)));
  let date = atHour(firstScan, settings.reminderHour);
  date.setDate(date.getDate() + settings.reminderDays);
  if (date <= now) {
    date = atHour(now, settings.reminderHour);
    if (date <= now) date.setDate(date.getDate() + 1);
  }

  const days = Math.round((startOfDay(date).getTime() - startOfDay(firstScan).getTime()) / DAY_MS);
  const items = summary.bottleCount > 0 ? plural(summary.bottleCount, "Flasche", "Flaschen") : plural(summary.crateCount, "Kiste", "Kisten");
  return { date, title: `${formatEuro(summary.total)} Pfand warten auf dich`, body: `${items} seit ${plural(days, "Tag", "Tagen")} gesammelt. Zeit für den Automaten?` };
}

async function ensureChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, { name: "Erinnerung ans Abgeben", importance: Notifications.AndroidImportance.DEFAULT });
}

export async function requestReminderPermission(): Promise<boolean> {
  if (!SUPPORTED) return false;
  try {
    await ensureChannel();
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

async function applyPlan(plan: ReminderPlan | null) {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  if (!plan) return;

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;

  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: { title: plan.title, body: plan.body, data: { url: TARGET_PATH } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: plan.date, channelId: CHANNEL_ID }
  });
}

// --- Development ---
export async function triggerTestReminder(delaySeconds = 5): Promise<boolean> {
  if (!(await requestReminderPermission())) return false;
  const [scans, settings] = await Promise.all([loadSession(), loadSettings()]);
  const plan = planReminder(scans, { ...settings, reminderEnabled: true, reminderMinAmount: 0 });
  await Notifications.scheduleNotificationAsync({
    identifier: TEST_ID,
    content: {
      title: plan?.title ?? `${formatEuro(467)} Pfand warten auf dich`,
      body: plan?.body ?? "26 Flaschen seit 7 Tagen gesammelt. Zeit für den Automaten?",
      data: { url: TARGET_PATH }
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds, channelId: CHANNEL_ID }
  });
  return true;
}

let queue: Promise<void> = Promise.resolve();

export function syncReminder(): Promise<void> {
  if (!SUPPORTED) return Promise.resolve();
  queue = queue.then(async () => {
    const [scans, settings] = await Promise.all([loadSession(), loadSettings()]);
    await applyPlan(planReminder(scans, settings));
  }).catch(() => {});
  return queue;
}

export function useReminderSync() {

  const scans = useScans();
  const settings = useSettings();
  const loaded = useSessionLoaded();

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(syncReminder, 500);
    return () => clearTimeout(timer);
  }, [scans, settings, loaded]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") syncReminder();
    });
    return () => subscription.remove();
  }, []);
}

let handledResponse: string | null = null;

export function useReminderResponse() {

  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!SUPPORTED) return;

    function handle(response: NotificationsModule.NotificationResponse) {
      const { notification } = response;
      if (notification.request.identifier !== REMINDER_ID && notification.request.identifier !== TEST_ID) return;
      if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
      const key = `${notification.request.identifier}:${notification.date}`;
      if (handledResponse === key) return;
      handledResponse = key;
      Notifications.clearLastNotificationResponse();
      if (pathnameRef.current !== TARGET_PATH) router.push(TARGET_PATH);
    }

    const last = Notifications.getLastNotificationResponse();
    if (last) handle(last);
    const subscription = Notifications.addNotificationResponseReceivedListener(handle);
    return () => subscription.remove();
  }, []);
}