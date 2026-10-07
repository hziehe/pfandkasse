import { Alert } from "@/components/alert";
import { StepButton } from "@/components/onboarding/step-button";
import { ScreenHeader } from "@/components/screen-header";
import { DepositBreakdownCard } from "@/components/session";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { formatEuro } from "@/constants/deposit";
import { AssetImages } from "@/constants/images";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { saveDeposit } from "@/lib/deposit-history";
import { useDepositSession, type SessionSummary } from "@/lib/deposit-session";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function SubmissionPreparationScreen() {

  const theme = useTheme();
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
      <DepositBreakdownCard summary={summary} style={styles.card} />
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
    marginBottom: Spacing.three
  },
  actions: {
    gap: Spacing.three,
    marginTop: "auto"
  }
});
