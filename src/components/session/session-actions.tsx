import { ThemedText } from "@/components/themed-text";
import { AssetImages } from "@/constants/images";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Image, Pressable, StyleSheet, View } from "react-native";

type SessionActionsProps = {
  onAddCrate: () => void;
  onFinish: () => void;
  finishDisabled?: boolean;
};
export function SessionActions({ onAddCrate, onFinish, finishDisabled = false }: SessionActionsProps) {

  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" onPress={onAddCrate} 
      style={({ pressed }) => [styles.button, styles.secondary, { backgroundColor: theme.card, borderColor: theme.tabBarBorder, opacity: pressed ? 0.7 : 1 }]}>
        <Image resizeMode="contain" source={AssetImages.box} style={styles.icon} tintColor={theme.text} />
        <ThemedText style={styles.label} numberOfLines={1}>Kiste hinzufügen</ThemedText>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: finishDisabled }} disabled={finishDisabled} onPress={onFinish} 
      style={({ pressed }) => [styles.button, { backgroundColor: theme.inverseCard, opacity: finishDisabled ? 0.5 : pressed ? 0.7 : 1 }]}>
        <Image resizeMode="contain" source={AssetImages.check} style={styles.icon} tintColor={theme.inverseText} />
        <ThemedText style={[styles.label, { color: theme.inverseText }]} numberOfLines={1}>Abschließen</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.four
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 14
  },
  secondary: {
    borderWidth: 1
  },
  icon: {
    width: 18,
    height: 18
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700
  }
});
