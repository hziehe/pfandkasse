import { ThemedText } from "@/components/themed-text";
import { formatEuro } from "@/constants/deposit";
import { AssetImages } from "@/constants/images";
import { Spacing, type DepositType } from "@/constants/theme";
import { useDepositColors, useTheme } from "@/hooks/use-theme";
import { Image, StyleSheet, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

type ScanToastProps = {
  title: string;
  amount: number;
  type: DepositType;
};
export function ScanToast({ title, amount, type }: ScanToastProps) {

  const theme = useTheme();
  const colors = useDepositColors()[type];

  return (
    <Animated.View entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(200)} accessibilityLiveRegion="polite" accessibilityRole="alert"
    style={[styles.toast, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.background }]}>
        <Image resizeMode="contain" source={type === "kasten" ? AssetImages.box : AssetImages.bottle} style={styles.icon} tintColor={colors.foreground} />
      </View>
      <View style={styles.text}>
        <ThemedText style={styles.title} numberOfLines={1}>{title}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>Hinzugefügt</ThemedText>
      </View>
      <ThemedText style={[styles.amount, { color: theme.primary }]}>+{formatEuro(amount)}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingLeft: Spacing.two,
    paddingRight: Spacing.three,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.18)"
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    width: 20,
    height: 20
  },
  text: {
    flex: 1
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 700
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400
  },
  amount: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
    fontVariant: ["tabular-nums"]
  }
});
