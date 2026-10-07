import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Image, Pressable, StyleSheet, type ImageSourcePropType, type StyleProp, type ViewStyle } from "react-native";

export type StepProps = {
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  disabled: boolean;
};

type StepButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "borderless";
  icon?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
};
export function StepButton({ label, onPress, disabled, variant = "primary", icon, style }: StepButtonProps) {

  const theme = useTheme();
  const isPrimary = variant === "primary";

  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button,
        variant === "primary" && { backgroundColor: theme.primary },
        variant === "secondary" && [styles.secondaryButton, { borderColor: theme.primary }], 
        variant === "borderless" && styles.borderless, { opacity: pressed ? 0.7 : 1 }, style ]}>
      {icon && <Image source={icon} style={[styles.icon, { tintColor: isPrimary ? "#ffffff" : theme.primary }]} />}
      <ThemedText style={[styles.buttonText, !isPrimary && { color: theme.primary }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.three,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: "contain"
  },
  secondaryButton: {
    borderWidth: 1.5
  },
  borderless: {
    borderWidth: 0,
    backgroundColor: "transparent"
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: 600
  },
});