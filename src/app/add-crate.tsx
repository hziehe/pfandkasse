import { StepButton } from "@/components/onboarding/step-button";
import { ScreenHeader } from "@/components/screen-header";
import { Stepper } from "@/components/stepper";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { CRATE_PRESETS, getFullCrateAmount, type CratePreset } from "@/constants/crates";
import { formatEuro } from "@/constants/deposit";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { addScans, type NewScan } from "@/lib/deposit-session";
import { haptic } from "@/lib/haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const MAX_CRATES = 99;

function formatCrateVolume(liters: number) {
  const value = Number.isInteger(liters) ? liters.toFixed(1) : String(liters);
  return `${value.replace(".", ",")} l`;
}

function fillLabel(bottles: number, capacity: number) {
  if (bottles === capacity) return "Voll";
  if (bottles === 0) return "Leer";
  return "Teilweise";
}

export default function AddCrateScreen() {

  const theme = useTheme();
  const [preset, setPreset] = useState<CratePreset>(CRATE_PRESETS[0]);
  const [bottles, setBottles] = useState(preset.bottles);
  const [crates, setCrates] = useState(1);

  const totalBottles = bottles * crates;
  const crateTotal = crates * preset.crateAmount;
  const bottleTotal = totalBottles * preset.bottleAmount;
  const total = crateTotal + bottleTotal;

  function selectPreset(next: CratePreset) {
    setPreset(next);
    setBottles(next.bottles);
  }

  function handleAdd() {
    const now = Date.now();
    const scans: NewScan[] = [];
    for (let i = 0; i < crates; i++) {
      scans.push({ name: preset.crateName, type: "kasten", amount: preset.crateAmount, scannedAt: now });
      for (let j = 0; j < bottles; j++) {
        scans.push({ name: preset.name, volume: preset.volume, type: preset.bottleType, amount: preset.bottleAmount, scannedAt: now });
      }
    }
    addScans(scans);
    haptic("success");
    router.back();
  }

  return (
    <TabScreen title="">
      <ScreenHeader title="Kiste hinzufügen" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {CRATE_PRESETS.map((item) => {
            const selected = item.id === preset.id;
            return (
              <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => selectPreset(item)} style={({ pressed }) => [styles.preset, {
                backgroundColor: selected ? theme.backgroundElement : theme.card,
                borderColor: selected ? theme.primary : theme.tabBarBorder,
                borderWidth: selected ? 1.5 : 1,
                opacity: pressed ? 0.7 : 1
              }]}>
                <ThemedText style={styles.presetTitle} numberOfLines={1}>
                  {item.bottles > 0 ? `${item.name} ${item.bottles} × ${formatCrateVolume(item.volume)}` : item.name}
                </ThemedText>
                <ThemedText style={[styles.presetDetail, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.material} · {formatEuro(getFullCrateAmount(item))}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.tabBarBorder }]}>
          {preset.bottles > 0 && <>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <ThemedText style={styles.label}>Flaschen im Kasten</ThemedText>
                <ThemedText style={[styles.detail, { color: theme.textSecondary }]}>
                  {fillLabel(bottles, preset.bottles)} · {bottles} von {preset.bottles}
                </ThemedText>
              </View>
              <Stepper label="Flaschen" value={bottles} min={0} max={preset.bottles} onChange={setBottles} />
            </View>
            <View style={[styles.divider, { backgroundColor: theme.tabBarBorder }]} />
          </>}
          <View style={styles.row}>
            <ThemedText style={[styles.label, styles.rowText]}>Anzahl Kästen</ThemedText>
            <Stepper label="Kästen" value={crates} min={1} max={MAX_CRATES} onChange={setCrates} />
          </View>
        </View>
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryText}>{crates} &times; Kastenpfand à {formatEuro(preset.crateAmount)}</ThemedText>
            <ThemedText style={styles.summaryAmount}>{formatEuro(crateTotal)}</ThemedText>
          </View>
          {totalBottles > 0 &&
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryText}>
                {totalBottles} {totalBottles === 1 ? "Flasche" : "Flaschen"} à {formatEuro(preset.bottleAmount)}
              </ThemedText>
              <ThemedText style={styles.summaryAmount}>{formatEuro(bottleTotal)}</ThemedText>
            </View>
          }
        </View>
      </ScrollView>
      <StepButton label={`${formatEuro(total)} hinzufügen`} onPress={handleAdd} style={styles.addButton} />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1
  },
  scrollContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.three
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two
  },
  preset: {
    flexBasis: "47%",
    flexGrow: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two + Spacing.one,
    borderRadius: 12
  },
  presetTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700
  },
  presetDetail: {
    fontSize: 11,
    lineHeight: 16
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three
  },
  rowText: {
    flex: 1
  },
  label: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 700
  },
  detail: {
    fontSize: 12,
    lineHeight: 16
  },
  divider: {
    height: StyleSheet.hairlineWidth
  },
  summary: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.one
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.three
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 18
  },
  summaryAmount: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 700
  },
  addButton: {
    marginTop: Spacing.two,
    borderRadius: 14,
    paddingVertical: Spacing.three + Spacing.one
  }
});
