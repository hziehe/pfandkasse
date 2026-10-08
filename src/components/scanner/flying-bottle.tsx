import { AssetImages } from "@/constants/images";
import type { DepositType } from "@/constants/theme";
import { useDepositColors } from "@/hooks/use-theme";
import { useEffect, useRef } from "react";
import { Image, StyleSheet } from "react-native";
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const FLIGHT_DURATION = 650;
const SIZE = 44;
const ARC_OFFSET = 90;

export type Point = { x: number; y: number };

type FlyingBottleProps = {
  from: Point;
  to: Point;
  type: DepositType;
  id: string;
  onArrive: (id: string) => void;
};
export function FlyingBottle({ id, from, to, type, onArrive }: FlyingBottleProps) {

  const colors = useDepositColors()[type];
  const progress = useSharedValue(0);
  const arriveRef = useRef(onArrive);

  useEffect(() => {
    arriveRef.current = onArrive;
  }, [onArrive]);

  useEffect(() => {
    const arrive = () => arriveRef.current(id);
    progress.set(withTiming(1, { duration: FLIGHT_DURATION, easing: Easing.inOut(Easing.cubic) }, (finished) => {
      if (finished) scheduleOnRN(arrive);
    }));
  }, [progress, id]);
  const control = { x: (from.x + to.x) / 2 + ARC_OFFSET, y: from.y - (from.y - to.y) * 0.6 };

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.get();
    const u = 1 - t;
    const x = u * u * from.x + 2 * u * t * control.x + t * t * to.x;
    const y = u * u * from.y + 2 * u * t * control.y + t * t * to.y;
    return {
      opacity: interpolate(t, [0, 0.1, 0.85, 1], [0, 1, 1, 0]),
      transform: [
        { translateX: x - SIZE / 2 },
        { translateY: y - SIZE / 2 },
        { scale: interpolate(t, [0, 0.2, 1], [0.6, 1.3, 0.35]) },
        { rotate: `${interpolate(t, [0, 1], [-25, 20])}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.bottle, { backgroundColor: colors.background, pointerEvents: "none" }, animatedStyle]}>
      <Image resizeMode="contain" source={type === "kasten" ? AssetImages.box : AssetImages.bottle} style={styles.icon} tintColor={colors.foreground} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bottle: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3
  },
  icon: {
    width: 24,
    height: 24
  }
});
