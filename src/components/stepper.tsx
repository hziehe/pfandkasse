import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Pressable, StyleSheet, View } from "react-native";

type StepperProps = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
};
export function Stepper({ value, min, max, onChange, label }: StepperProps) {

  const theme = useTheme();

  function renderButton(symbol: string, next: number, disabled: boolean, action: string) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={`${label} ${action}`} accessibilityState={{ disabled }} disabled={disabled} hitSlop={4} 
      onPress={() => onChange(next)} style={({ pressed }) => [styles.button, { backgroundColor: theme.card, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 }]}>
        <ThemedText style={styles.symbol}>{symbol}</ThemedText>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderButton("−", value - 1, value <= min, "verringern")}
      <ThemedText style={styles.value}>{value}</ThemedText>
      {renderButton("+", value + 1, value >= max, "erhöhen")}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.one,
    borderRadius: 12
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  symbol: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 500
  },
  value: {
    minWidth: 44,
    textAlign: "center",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 700,
    fontVariant: ["tabular-nums"]
  }
});
