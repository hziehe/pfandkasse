import { Colors, Spacing } from "@/constants/theme";
import { AssetImages } from "@/constants/images";
import { Image, StyleSheet, View } from "react-native";
import { StepButton, type StepProps } from "./step-button";
import { ThemedText } from "../themed-text";
import { useTheme } from "@/hooks/use-theme";

export default function Step1({ onNext, disabled }: StepProps) {

  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Image resizeMode="contain" source={AssetImages.hero} style={styles.image} />
      <View style={styles.content}>
        <ThemedText style={styles.title}>Wissen, was im Pfandbeutel steckt.</ThemedText>
        <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
          Scanne jede Flasche, bevor du zum Automaten gehst. Pfandkasse zählt
          mit und du weißt schon vorher, wie viel Pfand du zurückbekommst.
        </ThemedText>
        <View style={styles.bulletList}>
          <View style={[styles.row, styles.bulletPoint]}>
            <Image resizeMode="contain" source={AssetImages.scanBarcode} style={styles.imageSmall} />
            <ThemedText style={styles.bulletText}>
              Einweg, Mehrweg, Glas und Kästen zählen
            </ThemedText>
          </View>
          <View style={[styles.row, styles.bulletPoint]}>
            <Image resizeMode="contain" source={AssetImages.wifiOff} style={styles.imageSmall} />
            <ThemedText style={styles.bulletText}>Funktioniert komplett offline</ThemedText>
          </View>
          <View style={[styles.row, styles.bulletPoint]}>
            <Image resizeMode="contain" source={AssetImages.clock} style={styles.imageSmall} />
            <ThemedText style={styles.bulletText}>Alle Abgaben im Verlauf</ThemedText>
          </View>
        </View>
      </View>
      <StepButton label="Los geht's" onPress={onNext} disabled={disabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    zIndex: 99,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10
  },
  title: {
    fontSize: Spacing.five,
    lineHeight: 40,
    fontWeight: "bold"
  },
  description: {
    fontSize: 16,
    marginTop: Spacing.two
  },
  row: {
    flexDirection: "row",
    gap: Spacing.three
  },
  image: {
    zIndex: 1,
    marginTop: Spacing.six,
    width: "100%",
    height: 200
  },
  imageSmall: {
    width: 35,
    height: 35,
    color: "#000",
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: Colors.light.primary,
    padding: 5,
    borderRadius: 10
  },
  bulletList: {
    alignSelf: "stretch",
    gap: 25,
    marginTop: 25
  },
  bulletPoint: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10
  },
  bulletText: {
    fontSize: 15,
    flexShrink: 1
  }
});
