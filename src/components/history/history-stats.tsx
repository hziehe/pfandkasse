import { ThemedText } from "@/components/themed-text";
import { formatEuro } from "@/constants/deposit";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatBottles, getMonthName, type HistoryStats as Stats } from "@/lib/deposit-history";
import { StyleSheet, View } from "react-native";

type HistoryStatsProps = {
  stats: Stats;
  now: number;
};
export function HistoryStats({ stats, now }: HistoryStatsProps) {

  const theme = useTheme();

  return (
    <View style={styles.stats}>
      <View style={[styles.card, { backgroundColor: theme.inverseCard, borderColor: theme.inverseCard }]}>
        <ThemedText style={[styles.label, { color: theme.inverseTextSecondary }]}>{getMonthName(now)}</ThemedText>
        <ThemedText style={[styles.value, { color: theme.inverseText }]} adjustsFontSizeToFit numberOfLines={1}>{formatEuro(stats.monthTotal)}</ThemedText>
        <ThemedText style={[styles.label, { color: theme.inverseTextSecondary }]}>
          {stats.monthCount} {stats.monthCount === 1 ? "Abgabe" : "Abgaben"}
        </ThemedText>
      </View>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Seit Start</ThemedText>
        <ThemedText style={styles.value} adjustsFontSizeToFit numberOfLines={1}>{formatEuro(stats.total)}</ThemedText>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>{formatBottles(stats.bottleCount)}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
    gap: Spacing.two
  },
  card: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 500
  },
  value: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: 700,
    letterSpacing: -0.5,
    marginVertical: Spacing.one
  }
});
