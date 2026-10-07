import { StepButton } from "@/components/onboarding/step-button";
import { ScreenHeader } from "@/components/screen-header";
import { DepositBreakdownCard } from "@/components/session";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { formatEuro } from "@/constants/deposit";
import { Spacing } from "@/constants/theme";
import { useDepositColors, useTheme } from "@/hooks/use-theme";
import { deleteDeposit, formatDepositDetails, formatLongDate, useDepositHistory } from "@/lib/deposit-history";
import { formatScanTitle, type ScanEntry } from "@/lib/deposit-session";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Alert, Platform, ScrollView, StyleSheet, View } from "react-native";

type ScanGroup = {
  key: string;
  scan: ScanEntry;
  count: number;
  total: number;
};

function groupScans(scans: ScanEntry[]): ScanGroup[] {
  const groups = new Map<string, ScanGroup>();
  for (const scan of scans) {
    const key = `${scan.name}|${scan.volume ?? ""}|${scan.type}`;
    const group = groups.get(key);
    if (group) {
      group.count += 1;
      group.total += scan.amount;
    } else {
      groups.set(key, { key, scan, count: 1, total: scan.amount });
    }
  }
  return [...groups.values()].sort((a, b) => b.total - a.total);
}

function confirmDelete(onConfirm: () => void) {
  const message = "Die Abgabe wird dauerhaft aus dem Verlauf entfernt.";
  if (Platform.OS === "web") {
    if (window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert("Abgabe löschen?", message, [
    { text: "Abbrechen", style: "cancel" },
    { text: "Löschen", style: "destructive", onPress: onConfirm },
  ]);
}

export default function DepositDetailsScreen() {

  const theme = useTheme();
  const depositColors = useDepositColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const history = useDepositHistory();
  const record = history.find((entry) => entry.id === id);
  const scanGroups = useMemo(() => groupScans(record?.scans ?? []), [record]);

  function handleDelete() {
    confirmDelete(() => {
      router.back();
      deleteDeposit(id);
    });
  }

  return (
    <TabScreen title="">
      <ScreenHeader title="Abgabe" />
      {record ?
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <ThemedText style={[styles.caption, { color: theme.textSecondary }]}>{formatLongDate(record.finishedAt)}</ThemedText>
            <ThemedText style={styles.total} adjustsFontSizeToFit numberOfLines={1}>{formatEuro(record.total)}</ThemedText>
            <ThemedText style={[styles.caption, { color: theme.textSecondary }]}>{formatDepositDetails(record)}</ThemedText>
          </View>
          <DepositBreakdownCard summary={record} />
          <ThemedText style={[styles.heading, { color: theme.textSecondary }]}>Gescannt</ThemedText>
          <View style={[styles.list, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
            {scanGroups.map((group, index) => (
              <View key={group.key} style={[styles.row, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.tabBarBorder }]}>
                <View style={[styles.dot, { backgroundColor: depositColors[group.scan.type].foreground }]} />
                <ThemedText style={styles.rowTitle} numberOfLines={1}>{formatScanTitle(group.scan)}</ThemedText>
                <ThemedText style={[styles.rowCount, { color: theme.textSecondary }]}>{group.count} &times;</ThemedText>
                <ThemedText style={styles.rowAmount}>{formatEuro(group.total)}</ThemedText>
              </View>
            ))}
          </View>
          <StepButton label="Abgabe löschen" variant="borderless" onPress={handleDelete} />
        </ScrollView> :
        <ThemedText style={[styles.caption, { color: theme.textSecondary }]}>Diese Abgabe wurde nicht gefunden.</ThemedText>
      }
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.four
  },
  hero: {
    alignItems: "center",
    paddingVertical: Spacing.three
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
  heading: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: Spacing.two
  },
  list: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22
  },
  rowCount: {
    fontSize: 13,
    lineHeight: 18,
    marginRight: Spacing.two
  },
  rowAmount: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 700
  }
});
