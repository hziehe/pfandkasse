import { ThemedText } from "@/components/themed-text";
import { formatEuro, getDepositInfo } from "@/constants/deposit";
import { AssetImages } from "@/constants/images";
import { Spacing } from "@/constants/theme";
import { useDepositColors, useTheme } from "@/hooks/use-theme";
import { formatRelativeTime, formatScanTitle, ScanEntry } from "@/lib/deposit-session";
import { Image, Pressable, StyleSheet, View } from "react-native";

type LatestScanCardProps = {
  scan: ScanEntry;
  now: number;
  onUndo: () => void;
};
export function LatestScanCard({ scan, now, onUndo }: LatestScanCardProps) {

  const theme = useTheme();
  const colors = useDepositColors()[scan.type];

  return (
    <View style={[styles.latest, { backgroundColor: theme.inverseCard }]}>
      <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
        <Image source={scan.type === "kasten" ? AssetImages.box : AssetImages.bottle} style={[styles.icon, { tintColor: colors.foreground }]} />
      </View>
      <View style={styles.latestText}>
        <ThemedText style={[styles.latestTitle, { color: theme.inverseText }]}>{formatScanTitle(scan)}</ThemedText>
        <ThemedText style={[styles.latestDetail, { color: theme.inverseTextSecondary }]}>
          {getDepositInfo(scan.type).label} · +{formatEuro(scan.amount)} · {formatRelativeTime(scan.scannedAt, now)}
        </ThemedText>
      </View>
      <Pressable accessibilityRole="button" onPress={onUndo} style={({ pressed }) => [styles.undo, { opacity: pressed ? 0.7 : 1 }]}>
        <Image source={AssetImages.undo} style={[styles.undoIcon, { tintColor: theme.inverseText }]} />
        <ThemedText style={[styles.undoText, { color: theme.inverseText }]}>Rückgängig</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  latest: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 20
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: "contain"
  },
  latestText: {
    flex: 1
  },
  latestTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 700
  },
  latestDetail: {
    fontSize: 13,
    lineHeight: 18
  },
  undo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two + Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)"
  },
  undoIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain"
  },
  undoText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700
  }
});
