import { useDepositColors, useTheme } from "@/hooks/use-theme";
import type { DepositBreakdown } from "@/lib/deposit-session";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const GAP = 3;

type DepositDonutProps = {
  breakdown: DepositBreakdown[];
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
};
export function DepositDonut({ breakdown, size = 140, strokeWidth = 14, children }: DepositDonutProps) {

  const theme = useTheme();
  const depositColors = useDepositColors();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const segments = breakdown.filter((entry) => entry.share > 0);
  const gap = segments.length > 1 ? GAP : 0;

  const arcs = segments.map((entry, index) => {
    const offset = segments.slice(0, index).reduce((sum, previous) => sum + previous.share * circumference, 0);
    return { type: entry.type, length: Math.max(entry.share * circumference - gap, 0), offset };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        {arcs.length === 0 &&
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.backgroundSelected} strokeWidth={strokeWidth} fill="none" />
        }
        {arcs.map((arc) =>
          <Circle key={arc.type} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={depositColors[arc.type].foreground}
          strokeWidth={strokeWidth} strokeDasharray={`${arc.length} ${circumference}`} strokeDashoffset={-arc.offset} />
        )}
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center"
  }
});
