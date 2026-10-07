import { ScreenHeader } from "@/components/screen-header";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { DEPOSIT_TYPES, formatEuro } from "@/constants/deposit";
import { AssetImages } from "@/constants/images";
import { BottomTabInset, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { resetCameraPermissionChoice } from "@/lib/camera-permission";
import { clearHistory, historyToCsv, loadHistory } from "@/lib/deposit-history";
import { clearSession, loadSession, seedDemoSession } from "@/lib/deposit-session";
import { resetOnboardingCompleted } from "@/lib/onboarding";
import { haptic } from "@/lib/haptics";
import { clearProducts } from "@/lib/product-catalog";
import { resetSettings, setSetting, useSettings, type Settings } from "@/lib/settings";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Fragment, useState, type ReactNode } from "react";
import { Alert, Image, Platform, Pressable, ScrollView, Share, StyleSheet, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCANNER_OPTIONS: { key: keyof Settings; label: string; hint: string }[] = [
  { key: "sound", label: "Ton beim Scannen", hint: "Kurzer Piepton bei Treffer" },
  { key: "vibration", label: "Vibration", hint: "Haptisches Feedback" },
  { key: "autoAdd", label: "Automatisch hinzufügen", hint: "Ohne Bestätigung zählen" },
];

function confirmDeleteAll(onConfirm: () => void) {
  const title = "Alle Daten löschen?";
  const message = "Aktuelle Zählung, Verlauf und gespeicherte Produkte werden unwiderruflich gelöscht.";
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Abbrechen", style: "cancel" },
    { text: "Löschen", style: "destructive", onPress: onConfirm },
  ]);
}

async function deleteAllData() {
  await loadSession();
  clearSession();
  await Promise.all([clearHistory(), clearProducts()]);
  resetSettings();
  haptic("warning");
}

async function exportHistory() {
  const history = await loadHistory();
  if (history.length === 0) {
    Alert.alert("Kein Verlauf", "Es gibt noch keine abgeschlossenen Abgaben zum Exportieren.");
    return;
  }
  await Share.share({ title: "Pfandkasse-Verlauf.csv", message: historyToCsv(history) });
}

function Section({ title, children }: { title: string; children: ReactNode }) {

  const theme = useTheme();

  return (
    <View style={styles.section}>
      <ThemedText themeColor="textSecondary" style={styles.sectionTitle}>{title}</ThemedText>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
        {children}
      </View>
    </View>
  );
}

function Divider() {

  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.tabBarBorder }]} />;
}

export default function SettingsScreen() {

  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettings();
  const [resetting, setResetting] = useState(false);

  async function resetOnboarding() {
    setResetting(true);
    try {
      await resetOnboardingCompleted();
      await resetCameraPermissionChoice();
      router.replace("/onboarding");
    } finally {
      setResetting(false);
    }
  }

  return (
    <TabScreen title="">
      <ScreenHeader title="Einstellungen" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Section title="Pfandsätze">
          {DEPOSIT_TYPES.map((deposit, index) =>
            <Fragment key={deposit.type}>
              {index > 0 && <Divider />}
              <View style={styles.row}>
                <ThemedText style={styles.rowLabel}>{deposit.type === "kasten" ? "Kasten (leer)" : deposit.label}</ThemedText>
                <ThemedText style={styles.rowValue}>{formatEuro(deposit.amount)}</ThemedText>
              </View>
            </Fragment>
          )}
        </Section>
        <Section title="Scanner">
          {SCANNER_OPTIONS.map((option, index) =>
            <Fragment key={option.key}>
              {index > 0 && <Divider />}
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <ThemedText style={styles.rowLabel}>{option.label}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.rowHint}>{option.hint}</ThemedText>
                </View>
                <Switch accessibilityLabel={option.label} value={settings[option.key]} onValueChange={(value) => { setSetting(option.key, value); haptic("tap"); }}
                trackColor={{ false: theme.backgroundSelected, true: theme.primary }} thumbColor="#FFFFFF" ios_backgroundColor={theme.backgroundSelected} />
              </View>
            </Fragment>
          )}
        </Section>
        <Section title="Daten">
          <Pressable accessibilityRole="button" onPress={exportHistory} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
            <ThemedText style={styles.rowLabel}>Verlauf als CSV exportieren</ThemedText>
            <Image source={AssetImages.left} style={[styles.chevron, { tintColor: theme.textSecondary }]} />
          </Pressable>
        </Section>
        <Pressable accessibilityRole="button" onPress={() => confirmDeleteAll(deleteAllData)}
        style={({ pressed }) => [styles.dangerButton, { backgroundColor: theme.card, borderColor: theme.danger, opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText style={[styles.dangerText, { color: theme.danger }]}>Alle Daten löschen</ThemedText>
        </Pressable>
        {__DEV__ &&
          <Section title="Entwicklung">
            <Pressable accessibilityRole="button" onPress={seedDemoSession} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
              <ThemedText style={styles.rowLabel}>Demo-Daten zurücksetzen</ThemedText>
            </Pressable>
            <Divider />
            <Pressable accessibilityRole="button" disabled={resetting} onPress={resetOnboarding} style={({ pressed }) => [styles.row, { opacity: pressed || resetting ? 0.6 : 1 }]}>
              <ThemedText style={styles.rowLabel}>Onboarding zurücksetzen</ThemedText>
            </Pressable>
          </Section>
        }
      </ScrollView>
      <ThemedText themeColor="textSecondary" style={[styles.footer, { marginBottom: insets.bottom - BottomTabInset }]}>
        Pfandkasse {Constants.expoConfig?.version} · Daten bleiben auf diesem Gerät
      </ThemedText>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1
  },
  scrollContent: {
    gap: Spacing.four,
    paddingBottom: Spacing.four
  },
  section: {
    gap: Spacing.two
  },
  sectionTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one
  },
  rowText: {
    flex: 1
  },
  rowLabel: {
    fontSize: 15,
    lineHeight: 20
  },
  rowHint: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400
  },
  rowValue: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
    fontVariant: ["tabular-nums"]
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.three
  },
  chevron: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    transform: [{ rotate: "180deg" }]
  },
  dangerButton: {
    paddingVertical: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center"
  },
  dangerText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700
  },
  footer: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    paddingTop: Spacing.three
  }
});
