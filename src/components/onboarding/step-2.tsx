import { Image, type ImageSourcePropType, StyleSheet, View } from "react-native";
import { StepButton, type StepProps } from "./step-button";
import { ThemedText } from "../themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { AssetImages } from "@/constants/images";

const ICON_SIZE = 44;

type Step = {
  label: string;
  title: string;
  description: string;
  icon: ImageSourcePropType;
  highlight?: boolean;
};

const STEPS: Step[] = [
  {
    label: "Schritt 1",
    title: "Zu Hause scannen",
    description: "Barcode jeder Flasche vor die Kamera halten. Ganze Kästen fügst du mit einem Tipp hinzu.",
    icon: AssetImages.scanBarcode,
  },
  {
    label: "Schritt 2",
    title: "Summe im Blick",
    description: "Die App erkennt das Pfand und zählt mit. Du weißt vorher, wie viel Geld im Beutel steckt.",
    icon: AssetImages.database,
  },
  {
    label: "Schritt 3",
    title: "Abgeben und abschließen",
    description: "Nach dem Automaten auf Abschließen tippen. Die Abgabe landet mit Betrag im Verlauf.",
    icon: AssetImages.check,
    highlight: true,
  },
];

export default function Step2({ onNext, onBack, disabled }: StepProps) {

  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>In drei Schritten zum Pfandgeld.</ThemedText>
        <ThemedText style={[styles.description, { color: theme.textSecondary }]}>So sieht eine Abgabe mit Pfandkasse aus.</ThemedText>
        <View style={styles.steps}>
          {STEPS.map((step, index) => {
            const isLast = index === STEPS.length - 1;
            return (
              <View key={step.label} style={styles.step}>
                <View style={styles.timeline}>
                  <View style={[styles.iconBox, { backgroundColor: step.highlight ? theme.primary : "#14281D" }]}>
                    <Image source={step.icon} style={styles.icon} tintColor="#fff" />
                  </View>
                  {!isLast && <View style={[styles.line, { backgroundColor: theme.tabBarBorder }]} />}
                </View>
                <View style={[styles.stepText, !isLast && styles.stepSpacing]}>
                  <ThemedText style={[styles.stepLabel, { color: theme.primary }]}>{step.label.toUpperCase()}</ThemedText>
                  <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
                  <ThemedText style={[styles.stepDescription, { color: theme.textSecondary }]}>{step.description}</ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.row}>
        <StepButton label="Zurück" variant="secondary" onPress={onBack} disabled={disabled} style={styles.narrow} />
        <StepButton label="Weiter" onPress={onNext} disabled={disabled} style={styles.wide} />
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
  steps: {
    marginTop: Spacing.five
  },
  step: {
    flexDirection: "row",
    gap: Spacing.three
  },
  timeline: {
    alignItems: "center",
    width: ICON_SIZE
  },
  iconBox: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain"
  },
  line: {
    flex: 1,
    width: 2
  },
  stepText: {
    flex: 1,
    paddingTop: Spacing.one
  },
  stepSpacing: {
    paddingBottom: Spacing.six
  },
  stepLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "bold",
    letterSpacing: 0.5
  },
  stepTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "bold"
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: Spacing.half
  },
  row: {
    flexDirection: "row",
    gap: Spacing.three
  },
  narrow: {
    flex: 1
  },
  wide: {
    flex: 2
  }
})
