import { StepButton } from "@/components/onboarding/step-button";
import { ThemedText } from "@/components/themed-text";
import { formatEuro, getDepositInfo } from "@/constants/deposit";
import { AssetImages } from "@/constants/images";
import { Spacing } from "@/constants/theme";
import { useDepositColors, useTheme } from "@/hooks/use-theme";
import { formatScanTitle } from "@/lib/deposit-session";
import { formatEan, parseVolume, type BottleType, type Product, type ProductMatch } from "@/lib/product-catalog";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

const BOTTLE_TYPES: { type: BottleType; label: string; hint: string; material: string }[] = [
  { type: "einweg", label: "Einwegpfand", hint: "DPG-Logo auf dem Etikett", material: "PET / Dose" },
  { type: "mehrweg", label: "Mehrwegpfand", hint: "Mehrweg-Zeichen auf dem Etikett", material: "PET" },
  { type: "glas", label: "Glaspfand", hint: "Mehrwegflasche aus Glas", material: "Glas" },
];

function getBottleType(type: BottleType) {
  return BOTTLE_TYPES.find((item) => item.type === type)!;
}

function formatVolumeInput(volume: number | undefined) {
  return volume ? String(volume).replace(".", ",") : "";
}

type ScanResultSheetProps = {
  ean: string;
  match: ProductMatch | null;
  loading: boolean;
  onAdd: (product: Product) => void;
  onDiscard: () => void;
};
export function ScanResultSheet({ ean, match, loading, onAdd, onDiscard }: ScanResultSheetProps) {

  const theme = useTheme();
  const depositColors = useDepositColors();
  const initial = match?.product;
  const [editing, setEditing] = useState(!loading && !initial?.type);
  const [type, setType] = useState<BottleType>(initial?.type ?? "einweg");
  const [name, setName] = useState(initial?.name ?? "");
  const [volume, setVolume] = useState(formatVolumeInput(initial?.volume));
  const [wasLoading, setWasLoading] = useState(loading);

  if (wasLoading !== loading) {
    setWasLoading(loading);
    setEditing(!loading && !initial?.type);
    setType(initial?.type ?? "einweg");
    setName(initial?.name ?? "");
    setVolume(formatVolumeInput(initial?.volume));
  }

  const colors = depositColors[type];
  const bottleType = getBottleType(type);
  const draft: Product = { ean, name: name.trim(), volume: parseVolume(volume), type };
  const canAdd = !loading && draft.name !== "";

  function cancelEditing() {
    if (!initial?.type) {
      onDiscard();
      return;
    }
    setType(initial.type);
    setName(initial.name);
    setVolume(formatVolumeInput(initial.volume));
    setEditing(false);
  }

  function renderStatus() {
    if (loading) {
      return <ThemedText style={[styles.statusText, { color: theme.textSecondary }]}>Suche Produkt …</ThemedText>;
    }
    if (match?.source === "catalog") {
      return (
        <View style={styles.status}>
          <Image resizeMode="contain" source={AssetImages.check} style={styles.statusIcon} tintColor={theme.primary} />
          <ThemedText style={[styles.statusText, { color: theme.primary }]}>Erkannt</ThemedText>
        </View>
      );
    }
    if (match?.source === "openfoodfacts") {
      return <ThemedText style={[styles.statusText, { color: depositColors.mehrweg.foreground }]}>Vorschlag</ThemedText>;
    }
    return <ThemedText style={[styles.statusText, { color: depositColors.einweg.foreground }]}>Neue Flasche</ThemedText>;
  }

  const inputStyle = [styles.input, { backgroundColor: theme.background, borderColor: theme.tabBarBorder, color: theme.text }];

  return (
    <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOutDown.duration(200)} style={[styles.sheet, { backgroundColor: theme.card }]}>
      <View style={[styles.handle, { backgroundColor: theme.tabBarBorder }]} />

      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: loading ? theme.background : colors.background }]}>
          {loading ? <ActivityIndicator color={theme.textSecondary} /> : <Image resizeMode="contain" source={AssetImages.bottle} style={styles.icon} tintColor={colors.foreground} />}
        </View>
        <View style={styles.headerText}>
          {renderStatus()}
          <ThemedText style={styles.title} numberOfLines={1}>
            {loading ? `EAN ${formatEan(ean)}` : draft.name ? formatScanTitle(draft) : "Unbekannte Flasche"}
          </ThemedText>
          {!loading &&
            <ThemedText style={[styles.detail, { color: theme.textSecondary }]} numberOfLines={1}>
              EAN {formatEan(ean)} · {bottleType.material}
            </ThemedText>
          }
        </View>
      </View>

      {loading ? null : editing ?
        <View style={styles.form}>
          <View style={styles.inputRow}>
            <TextInput value={name} onChangeText={setName} placeholder="Name, z. B. Mineralwasser" placeholderTextColor={theme.textSecondary} style={[inputStyle, styles.nameInput]} autoFocus={!initial?.name} returnKeyType="done" />
            <TextInput value={volume} onChangeText={setVolume} placeholder="Liter" placeholderTextColor={theme.textSecondary} style={[inputStyle, styles.volumeInput]} keyboardType="decimal-pad" />
          </View>
          <View style={styles.typeRow}>
            {BOTTLE_TYPES.map((item) => {
              const selected = item.type === type;
              const itemColors = depositColors[item.type];
              return (
                <Pressable key={item.type} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => setType(item.type)} style={({ pressed }) => [styles.typeOption, {
                  backgroundColor: selected ? itemColors.background : theme.background,
                  borderColor: selected ? itemColors.foreground : theme.tabBarBorder,
                  opacity: pressed ? 0.7 : 1
                }]}>
                  <ThemedText style={[styles.typeLabel, { color: selected ? itemColors.foreground : theme.text }]}>
                    {getDepositInfo(item.type).shortLabel}
                  </ThemedText>
                  <ThemedText style={[styles.typeAmount, { color: selected ? itemColors.foreground : theme.textSecondary }]}>
                    {formatEuro(getDepositInfo(item.type).amount)}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View> :
        <View style={[styles.deposit, { backgroundColor: theme.background }]}>
          <View style={styles.depositText}>
            <View style={[styles.chip, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.chipText, { color: colors.foreground }]}>{bottleType.label}</ThemedText>
            </View>
            <ThemedText style={[styles.detail, { color: theme.textSecondary }]}>{bottleType.hint}</ThemedText>
          </View>
          <ThemedText style={styles.amount}>+{formatEuro(getDepositInfo(type).amount)}</ThemedText>
        </View>
      }
      <View style={styles.actions}>
        <StepButton label={loading || (editing && !initial?.type) ? "Verwerfen" : editing ? "Abbrechen" : "Korrigieren"} variant="secondary" onPress={loading ? onDiscard : editing ? cancelEditing : () => setEditing(true)} style={styles.narrow} />
        <StepButton label="Hinzufügen" onPress={() => onAdd(draft)} disabled={!canAdd} style={[styles.wide, !canAdd && styles.disabled]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: Spacing.three,
    padding: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three
  },
  iconBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    width: 22,
    height: 22
  },
  headerText: {
    flex: 1
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one
  },
  statusIcon: {
    width: 12,
    height: 12
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 700
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700
  },
  detail: {
    fontSize: 12,
    lineHeight: 16
  },
  form: {
    gap: Spacing.two
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.two
  },
  input: {
    fontSize: 15,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth
  },
  nameInput: {
    flex: 1
  },
  volumeInput: {
    width: 80
  },
  typeRow: {
    flexDirection: "row",
    gap: Spacing.two
  },
  typeOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: 1
  },
  typeLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700
  },
  typeAmount: {
    fontSize: 12,
    lineHeight: 16
  },
  deposit: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16
  },
  depositText: {
    flex: 1,
    alignItems: "flex-start",
    gap: Spacing.one
  },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 6
  },
  chipText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: 700
  },
  amount: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
    fontVariant: ["tabular-nums"]
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.two + Spacing.one
  },
  narrow: {
    flex: 1
  },
  wide: {
    flex: 1.4
  },
  disabled: {
    opacity: 0.5
  }
});
