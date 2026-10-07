import { Alert } from "@/components/alert";
import { StepButton } from "@/components/onboarding/step-button";
import { ScreenHeader } from "@/components/screen-header";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { formatEuro } from "@/constants/deposit";
import { AssetImages } from "@/constants/images";
import { Spacing } from "@/constants/theme";
import { useDepositColors, useTheme } from "@/hooks/use-theme";
import { saveDeposit } from "@/lib/deposit-history";
import { useDepositSession, type SessionSummary } from "@/lib/deposit-session";
import { router } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";

export default function SubmissionPreparationScreen() {

  const theme = useTheme();
  const depositColors = useDepositColors();
  const session = useDepositSession();
  const [savedSummary, setSavedSummary] = useState<SessionSummary | null>(null);
  const summary = savedSummary ?? session.summary;

  function handleSave() {
    setSavedSummary(session.summary);
    const record = saveDeposit();
    if (record) {
      router.replace({ pathname: "/submission-saved", params: { id: record.id } });
    }
  }

  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  const details = [
    `${summary.bottleCount} ${summary.bottleCount === 1 ? "Flasche" : "Flaschen"}`,
    summary.crateCount > 0 && `${summary.crateCount} ${summary.crateCount === 1 ? "Kiste" : "Kisten"}`,
    `heute, ${today}`
  ].filter(Boolean).join(" · ");

  return (
    <TabScreen title="">
      <ScreenHeader title="Abgabe abschließen" />
      <View style={styles.hero}>
        <ThemedText style={[styles.caption, { color: theme.textSecondary }]}>Das bekommst du zurück</ThemedText>
        <ThemedText style={styles.total} adjustsFontSizeToFit numberOfLines={1}>{formatEuro(summary.total)}</ThemedText>
        <ThemedText style={[styles.caption, { color: theme.textSecondary }]}>{details}</ThemedText>
      </View>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
        {summary.breakdown.length === 0 && <ThemedText style={[styles.caption, { color: theme.textSecondary }]}>Noch keine Flaschen gescannt</ThemedText>}
        {summary.breakdown.map((entry) => {
          const colors = depositColors[entry.type];
          return (
            <View key={entry.type} style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                <Image source={entry.type === "kasten" ? AssetImages.box : AssetImages.bottle} style={[styles.icon, { tintColor: colors.foreground }]} />
              </View>
              <View style={styles.rowText}>
                <ThemedText style={styles.label}>{entry.label}</ThemedText>
                <ThemedText style={[styles.detail, { color: theme.textSecondary }]}>
                  {entry.count} &times; {formatEuro(entry.unitAmount)}
                </ThemedText>
              </View>
              <ThemedText style={styles.label}>{formatEuro(entry.total)}</ThemedText>
            </View>
          );
        })}
        <View style={[styles.divider, { backgroundColor: theme.tabBarBorder }]} />
        <View style={styles.row}>
          <ThemedText style={[styles.label, styles.rowText]}>Gesamt</ThemedText>
          <ThemedText style={[styles.label, { color: theme.primary }]}>{formatEuro(summary.total)}</ThemedText>
        </View>
      </View>
      <Alert>
        Gib die Flaschen am Automaten ab und speichere danach. Die Abgabe landet im Verlauf und der Zähler startet neu.
      </Alert>
      <View style={styles.actions}>
        <StepButton label="Abgabe speichern" icon={AssetImages.check} onPress={handleSave} disabled={summary.breakdown.length === 0 || savedSummary !== null} />
        <StepButton label="Weiter scannen" variant="borderless" onPress={() => router.dismissTo("/counter")} />
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingVertical: Spacing.four
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500
  },
  total: {
    fontSize: 52,
    lineHeight: 64,
    fontWeight: 700,
    letterSpacing: -1
  },
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain"
  },
  rowText: {
    flex: 1
  },
  label: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 700
  },
  detail: {
    fontSize: 12,
    lineHeight: 16
  },
  divider: {
    height: StyleSheet.hairlineWidth
  },
  actions: {
    gap: Spacing.three,
    marginTop: "auto"
  }
});
