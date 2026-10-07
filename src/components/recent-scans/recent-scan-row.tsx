import { ThemedText } from "@/components/themed-text";
import { formatEuro } from "@/constants/deposit";
import { Spacing } from "@/constants/theme";
import { useDepositColors, useTheme } from "@/hooks/use-theme";
import { formatRelativeTime, formatScanTitle, ScanEntry } from "@/lib/deposit-session";
import { StyleSheet, View } from "react-native";

type RecentScanRowProps = {
  scan: ScanEntry;
  now: number;
  divider: boolean;
};
export function RecentScanRow({ scan, now, divider }: RecentScanRowProps) {

  const theme = useTheme();
  const depositColors = useDepositColors();

  return (
    <View style={[styles.row, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.tabBarBorder }]}>
      <View style={[styles.dot, { backgroundColor: depositColors[scan.type].foreground }]} />
      <ThemedText style={styles.rowTitle} numberOfLines={1}>{formatScanTitle(scan)}</ThemedText>
      <ThemedText style={[styles.rowTime, { color: theme.textSecondary }]}>{formatRelativeTime(scan.scannedAt, now)}</ThemedText>
      <ThemedText style={styles.rowAmount}>{formatEuro(scan.amount)}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
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
  rowTime: {
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
