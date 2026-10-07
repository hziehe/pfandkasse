import { ThemedText } from "@/components/themed-text";
import { AssetImages } from "@/constants/images";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/counter");
  }
}

type ScreenHeaderProps = {
  title: string;
};
export function ScreenHeader({ title }: ScreenHeaderProps) {

  const theme = useTheme();

  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Zurück" hitSlop={8} onPress={goBack} style={({ pressed }) => [styles.backButton, { backgroundColor: theme.card, borderColor: theme.tabBarBorder, opacity: pressed ? 0.7 : 1 }]}>
        <Image source={AssetImages.left} style={[styles.backIcon, { tintColor: theme.text }]} />
      </Pressable>
      <ThemedText type="subtitle">{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center"
  },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain"
  }
});
