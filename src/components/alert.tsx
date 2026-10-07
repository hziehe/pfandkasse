import type { ReactNode } from "react";
import { Image, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from "react-native";
import { Colors, Spacing } from "@/constants/theme";
import { AssetImages } from "@/constants/images";
import { ThemedText } from "./themed-text";

type AlertProps = {
  children: ReactNode;
  icon?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
};

export function Alert({ children, icon = AssetImages.alert, style }: AlertProps) {
  return (
    <View style={[styles.alert, style]}>
      <Image source={icon} style={styles.icon} />
      <ThemedText style={styles.text}>{children}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: "row",
    gap: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 0.25,
    borderColor: Colors.light.primary
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    tintColor: Colors.light.primary,
    padding: 5
  },
  text: {
    color: Colors.light.primary,
    fontSize: 14,
    flex: 1
  }
});
