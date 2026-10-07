import { Image, StyleSheet, View } from "react-native";
import { StepButton, type StepProps } from "./step-button";
import { Alert } from "../alert";
import { Spacing } from "@/constants/theme";
import { AssetImages } from "@/constants/images";
import { ThemedText } from "../themed-text";
import { useDepositColors, useTheme } from "@/hooks/use-theme";
import { DEPOSIT_TYPES, formatEuro } from "@/constants/deposit";

export default function Step3({ onNext, onBack, disabled }: StepProps) {

  const theme = useTheme();
  const depositColors = useDepositColors();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Diese Pfandarten kennt die App.</ThemedText>
        <ThemedText style={[styles.description, { color: theme.textSecondary }]}>Die Farben begegnen dir überall in der App wieder.</ThemedText>
        <View style={styles.list}>
          {DEPOSIT_TYPES.map((deposit) => {
            
            const colors = depositColors[deposit.type];
            return (
              <View key={deposit.type} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
                <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                  <Image source={deposit.type === "kasten" ? AssetImages.box : AssetImages.bottle} style={[styles.icon, { tintColor: colors.foreground }]} />
                </View>
                <View style={styles.cardText}>
                  <ThemedText style={styles.cardTitle}>{deposit.label}</ThemedText>
                  <ThemedText style={[styles.cardDescription, { color: theme.textSecondary }]}>{deposit.description}</ThemedText>
                </View>
                <ThemedText style={styles.amount}>{formatEuro(deposit.amount)}</ThemedText>
              </View>
            );
          })}
        </View>
        <Alert>
          Kennt die App eine Flasche noch nicht wählst du die Pfandart einmal selbst. Beim nächsten Scan weiß sie es.
        </Alert>
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
  row: {
    flexDirection: "row",
    gap: Spacing.three
  },
  narrow: {
    flex: 1
  },
  wide: {
    flex: 2
  },
  list: {
    gap: Spacing.two + Spacing.one,
    marginVertical: Spacing.four
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain"
  },
  cardText: {
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "bold"
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold"
  }
})
