import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { DepositGroup } from "@/lib/deposit-history";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { HistoryRow } from "./history-row";

type HistorySectionProps = {
  group: DepositGroup;
};
export function HistorySection({ group }: HistorySectionProps) {

  const theme = useTheme();

  return (
    <View style={styles.section}>
      <ThemedText style={[styles.heading, { color: theme.textSecondary }]}>{group.title}</ThemedText>
      <View style={[styles.list, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
        {group.records.map((record, index) => 
          <HistoryRow key={record.id} record={record} highlighted={group.currentWeek} divider={index > 0} onPress={() => router.push({ pathname: "/deposit-details", params: { id: record.id } })} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two
  },
  heading: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  list: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three
  }
});
