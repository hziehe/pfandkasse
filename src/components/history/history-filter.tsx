import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { DepositFilter } from "@/lib/deposit-history";
import { Pressable, StyleSheet, View } from "react-native";

const FILTERS: { value: DepositFilter; label: string }[] = [
  { value: "alle", label: "Alle" },
  { value: "einweg", label: "Einweg" },
  { value: "mehrweg", label: "Mehrweg" },
];

type HistoryFilterProps = {
  value: DepositFilter;
  onChange: (value: DepositFilter) => void;
};
export function HistoryFilter({ value, onChange }: HistoryFilterProps) {

  const theme = useTheme();

  return (
    <View style={styles.filters} accessibilityRole="tablist">
      {FILTERS.map((filter) => {
        const selected = filter.value === value;
        return (
          <Pressable key={filter.value} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => onChange(filter.value)} style={({ pressed }) => [styles.chip, selected ?
              { backgroundColor: theme.inverseCard, borderColor: theme.inverseCard } : { backgroundColor: theme.card, borderColor: theme.tabBarBorder }, { opacity: pressed ? 0.7 : 1 }]}>
            <ThemedText style={[styles.label, selected && { color: theme.inverseText }]}>{filter.label}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    gap: Spacing.two
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 600
  }
});
