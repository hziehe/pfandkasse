import { ThemedText } from "@/components/themed-text";
import { formatEuro } from "@/constants/deposit";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatBottles, getMonthName, type HistoryStats as Stats } from "@/lib/deposit-history";
import { StyleSheet, View } from "react-native";

function valueFontSize(length: number) {
  if (length <= 8) return 26;
  if (length <= 9) return 22;
  if (length <= 10) return 19;
  return 16;
}

type HistoryStatsProps = {
  stats: Stats;
  now: number;
};
export function HistoryStats({ stats, now }: HistoryStatsProps) {

  const theme = useTheme();
  const monthTotal = formatEuro(stats.monthTotal);
  const total = formatEuro(stats.total);
  const fontSize = valueFontSize(Math.max(monthTotal.length, total.length));
  const valueSize = { fontSize, lineHeight: Math.round(fontSize * 1.3) };

  return (
    <View style={styles.stats}>
      <View style={[styles.card, { backgroundColor: theme.inverseCard, borderColor: theme.inverseCard }]}>
        <ThemedText style={[styles.label, { color: theme.inverseTextSecondary }]}>{getMonthName(now)}</ThemedText>
        <ThemedText style={[styles.value, valueSize, { color: theme.inverseText }]} numberOfLines={1}>{monthTotal}</ThemedText>
        <ThemedText style={[styles.label, { color: theme.inverseTextSecondary }]}>
          {stats.monthCount} {stats.monthCount === 1 ? "Abgabe" : "Abgaben"}
        </ThemedText>
      </View>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Seit Start</ThemedText>
        <ThemedText style={[styles.value, valueSize]} numberOfLines={1}>{total}</ThemedText>
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
    fontWeight: 700,
    letterSpacing: -0.5,
    marginVertical: Spacing.one
  }
});
