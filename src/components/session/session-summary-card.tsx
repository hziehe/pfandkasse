import { DepositDonut } from "@/components/session/deposit-donut";
import { ThemedText } from "@/components/themed-text";
import { DEPOSIT_TYPES, formatEuro } from "@/constants/deposit";
import { Spacing } from "@/constants/theme";
import { useDepositColors, useTheme } from "@/hooks/use-theme";
import type { DepositBreakdown, SessionSummary } from "@/lib/deposit-session";
import { StyleSheet, View } from "react-native";

type SessionSummaryCardProps = {
  summary: SessionSummary;
};
export function SessionSummaryCard({ summary }: SessionSummaryCardProps) {

  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
      <DepositDonut breakdown={summary.breakdown}>
        <ThemedText style={styles.total} adjustsFontSizeToFit numberOfLines={1}>{formatEuro(summary.total)}</ThemedText>
        <ThemedText style={[styles.bottles, { color: theme.textSecondary }]}>
          {summary.bottleCount} {summary.bottleCount === 1 ? "Flasche" : "Flaschen"}
        </ThemedText>
        {summary.crateCount > 0 &&
          <ThemedText style={[styles.bottles, { color: theme.textSecondary }]}>
            {summary.crateCount} {summary.crateCount === 1 ? "Kiste" : "Kisten"}
          </ThemedText>
        }
      </DepositDonut>
      <View style={styles.legendArea}>
        {/* Unsichtbare Legende mit allen Pfandarten: hält die Card immer auf voller Höhe. */}
        <View style={[styles.legend, styles.placeholder]} pointerEvents="none" aria-hidden importantForAccessibility="no-hide-descendants">
          {PLACEHOLDER_ROWS.map((entry) => <LegendRow key={entry.type} entry={entry} />)}
        </View>
        <View style={[styles.legend, styles.overlay]}>
          {summary.breakdown.length === 0 &&
            <ThemedText style={[styles.empty, { color: theme.textSecondary }]}>Noch keine Flaschen gescannt</ThemedText>
          }
          {summary.breakdown.map((entry) => <LegendRow key={entry.type} entry={entry} />)}
        </View>
      </View>
    </View>
  );
}

const PLACEHOLDER_ROWS: DepositBreakdown[] = DEPOSIT_TYPES.map((deposit) => ({
  type: deposit.type,
  label: deposit.shortLabel,
  unitAmount: deposit.amount,
  count: 0,
  total: 0,
  share: 0,
}));

function LegendRow({ entry }: { entry: DepositBreakdown }) {

  const theme = useTheme();
  const depositColors = useDepositColors();

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: depositColors[entry.type].foreground }]} />
      <View style={styles.rowText}>
        <ThemedText style={styles.label}>{entry.label}</ThemedText>
        <ThemedText style={[styles.detail, { color: theme.textSecondary }]}>
          {entry.count} &times; {formatEuro(entry.unitAmount)}
        </ThemedText>
      </View>
      <ThemedText style={styles.amount}>{formatEuro(entry.total)}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
    padding: Spacing.four,
    borderRadius: 25,
    borderWidth: StyleSheet.hairlineWidth
  },
  total: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 700,
    paddingHorizontal: Spacing.four
  },
  bottles: {
    fontSize: 13,
    lineHeight: 18
  },
  legendArea: {
    flex: 1
  },
  legend: {
    gap: Spacing.three
  },
  placeholder: {
    opacity: 0
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center"
  },
  empty: {
    fontSize: 14,
    lineHeight: 20
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginTop: 7
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
  amount: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 700
  }
});
