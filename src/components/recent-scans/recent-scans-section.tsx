import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ScanEntry, useNow } from "@/lib/deposit-session";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { LatestScanCard } from "./latest-scan-card";
import { RecentScanRow } from "./recent-scan-row";

type RecentScansSectionProps = {
  latest: ScanEntry | null;
  previous: ScanEntry[];
  onUndo: () => void;
};
export function RecentScansSection({ latest, previous, onUndo }: RecentScansSectionProps) {

  const theme = useTheme();
  const now = useNow();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText style={styles.heading}>Zuletzt gescannt</ThemedText>
      </View>
      {latest ?
        <LatestScanCard scan={latest} now={now} onUndo={onUndo} /> :
        <ThemedText style={[styles.empty, { color: theme.textSecondary }]}>Scanne deine erste Flasche, um sie hier zu sehen.</ThemedText>
      }
      {previous.length > 0 &&
        <View style={[styles.list, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
          {previous.map((scan, index) => <RecentScanRow key={scan.id} scan={scan} now={now} divider={index > 0} />)}
        </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.four,
    gap: Spacing.three
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700
  },
  link: {
    fontSize: 15,
    lineHeight: 22
  },
  empty: {
    fontSize: 14,
    lineHeight: 20
  },
  list: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three
  }
});
