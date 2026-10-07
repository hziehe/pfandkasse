import { ThemedText } from "@/components/themed-text";
import { formatEuro } from "@/constants/deposit";
import { AssetImages } from "@/constants/images";
import { Spacing } from "@/constants/theme";
import { useDepositColors, useTheme } from "@/hooks/use-theme";
import type { SessionSummary } from "@/lib/deposit-session";
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type DepositBreakdownCardProps = {
  summary: SessionSummary;
  style?: StyleProp<ViewStyle>;
};
export function DepositBreakdownCard({ summary, style }: DepositBreakdownCardProps) {

  const theme = useTheme();
  const depositColors = useDepositColors();

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }, style]}>
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
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500
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
  }
});
