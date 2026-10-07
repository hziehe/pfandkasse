import { useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { StepButton, type StepProps } from "./step-button";
import { ThemedText } from "../themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { AssetImages } from "@/constants/images";
import { setCameraPermissionChoice } from "@/lib/camera-permission";

const BULLETS = [
  "Liest nur Barcodes, speichert keine Fotos",
  "Nur aktiv, solange der Scanner offen ist",
];

export default function Step4({ onFinish, disabled }: StepProps) {

  const theme = useTheme();
  const [, requestPermission] = useCameraPermissions();
  const [requesting, setRequesting] = useState(false);

  const allowCamera = async () => {
    setRequesting(true);
    try {
      const { granted } = await requestPermission();
      await setCameraPermissionChoice(granted ? "granted" : "denied");
    } finally {
      setRequesting(false);
      onFinish();
    }
  };

  const skipCamera = async () => {
    setRequesting(true);
    try {
      await setCameraPermissionChoice("skipped");
    } finally {
      setRequesting(false);
      onFinish();
    }
  };

  return (
    <View style={styles.container}>
      <Image source={AssetImages.hero4} style={styles.image} />
      <View style={styles.content}>
        <ThemedText style={styles.title}>Kamera für den Barcode-Scan.</ThemedText>
        <ThemedText style={[styles.description, { color: theme.textSecondary }]}>Ohne Kamera kann Pfandkasse keine Flaschen erkennen. Du kannst sie jederzeit in den Einstellungen deines Handys wieder entziehen</ThemedText>
        <View style={styles.bulletList}>
          {BULLETS.map((bullet) => (
            <View key={bullet} style={styles.bullet}>
              <View style={[styles.check, { borderColor: theme.primary }]} />
              <ThemedText style={styles.bulletText}>{bullet}</ThemedText>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.column}>
        <StepButton label="Kamera erlauben" onPress={allowCamera} disabled={disabled || requesting} />
        <StepButton label="Später" variant="borderless" onPress={skipCamera} disabled={disabled || requesting} />
      </View>
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
  bulletList: {
    alignSelf: "stretch",
    gap: Spacing.two,
    marginTop: Spacing.five
  },
  bullet: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three
  },
  check: {
    width: 7,
    height: 13,
    marginLeft: 3,
    marginBottom: 3,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: "45deg" }]
  },
  bulletText: {
    flex: 1,
    fontSize: 15
  },
  row: {
    flexDirection: "row",
    gap: Spacing.three
  },
  column: { 
    gap: Spacing.three
  },
  image: {
    zIndex: 1,
    marginTop: Spacing.five,
    width: "100%",
    height: 200,
    resizeMode: "contain"
  }
});