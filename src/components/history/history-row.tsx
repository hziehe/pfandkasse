import { ThemedText } from "@/components/themed-text";
import { formatEuro } from "@/constants/deposit";
import { AssetImages } from "@/constants/images";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatDayOfMonth, formatDepositDetails, formatLongDate, formatWeekdayShort, type DepositRecord } from "@/lib/deposit-history";
import { Image, Pressable, StyleSheet, View } from "react-native";

type HistoryRowProps = {
  record: DepositRecord;
  highlighted: boolean;
  divider: boolean;
  onPress: () => void;
};
export function HistoryRow({ record, highlighted, divider, onPress }: HistoryRowProps) {

  const theme = useTheme();

  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={({ pressed }) => [styles.row, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.tabBarBorder }, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={[styles.date, { backgroundColor: highlighted ? theme.backgroundElement : theme.background }]}>
        <ThemedText style={[styles.weekday, { color: highlighted ? theme.primary : theme.textSecondary }]}>{formatWeekdayShort(record.finishedAt)}</ThemedText>
        <ThemedText style={[styles.day, highlighted && { color: theme.primary }]}>{formatDayOfMonth(record.finishedAt)}</ThemedText>
      </View>
      <View style={styles.text}>
        <ThemedText style={styles.title} numberOfLines={1}>{formatLongDate(record.finishedAt)}</ThemedText>
        <ThemedText style={[styles.details, { color: theme.textSecondary }]} numberOfLines={1}>{formatDepositDetails(record)}</ThemedText>
      </View>
      <ThemedText style={styles.amount}>{formatEuro(record.total)}</ThemedText>
      <Image resizeMode="contain" source={AssetImages.left} style={styles.chevron} tintColor={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.three
  },
  date: {
    width: 40,
    paddingVertical: Spacing.one,
    borderRadius: 10,
    alignItems: "center"
  },
  weekday: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 600
  },
  day: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: 700
  },
  text: {
    flex: 1
  },
  title: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 600
  },
  details: {
    fontSize: 12,
    lineHeight: 16
  },
  amount: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 700
  },
  chevron: {
    width: 16,
    height: 16,
    marginLeft: -Spacing.two,
    transform: [{ rotate: "180deg" }]
  }
});
