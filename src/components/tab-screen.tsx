import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AssetImages } from "@/constants/images";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { router, useFocusEffect, usePathname, type Href } from "expo-router";
import { useCallback, type ReactNode } from "react";
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const TAB_ORDER: Href[] = ["/counter", "/scan", "/history"];
const SLIDE_DURATION = 250;
const SLIDE_DISTANCE = 0.35;
const EDGE_WIDTH = 24;
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 500;

let lastTabIndex: number | null = null;

function goToTab(index: number) {
  const target = TAB_ORDER[index];
  if (target) {
    router.navigate(target);
  }
}

function edgeSwipe(direction: 1 | -1, onSwipe: () => void) {
  return Gesture.Pan().runOnJS(true).activeOffsetX(direction * 10).failOffsetY([-20, 20]).onEnd((event) => {
    if (event.translationX * direction > SWIPE_DISTANCE || event.velocityX * direction > SWIPE_VELOCITY) {
      onSwipe();
    }
  });
}

type TabScreenProps = {
  title: string;
  fullBleed?: boolean;
  children?: ReactNode;
};
export function TabScreen({ title, fullBleed = false, children }: TabScreenProps) {

  const theme = useTheme();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const index = TAB_ORDER.findIndex((tab) => tab === pathname);

  useFocusEffect(
    useCallback(() => {
      const previous = lastTabIndex;
      lastTabIndex = index;
      if (previous === null || previous === index || index === -1) return;
      const direction = index > previous ? 1 : -1;
      const timing = { duration: SLIDE_DURATION, easing: Easing.out(Easing.cubic)};
      translateX.set(direction * width * SLIDE_DISTANCE);
      opacity.set(0);
      translateX.set(withTiming(0, timing));
      opacity.set(withTiming(1, timing));
    }, [index, width, translateX, opacity]),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateX: translateX.get() }],
  }));

  const isTab = index !== -1;
  const swipeFromLeft = edgeSwipe(1, () => goToTab(index - 1));
  const swipeFromRight = edgeSwipe(-1, () => goToTab(index + 1));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={[styles.safeArea, fullBleed && styles.safeAreaFullBleed]} edges={fullBleed ? [] : ["top", "left", "right"]}>
        <View style={styles.content}>
          <Animated.View style={[styles.content, animatedStyle]}>
            {title !== "" && <ThemedText type="subtitle" style={styles.title}>
              {title}
            </ThemedText>}
            <ThemedView style={styles.content}>{children}</ThemedView>
          </Animated.View>
          {isTab && !fullBleed &&
            <Pressable accessibilityRole="button" accessibilityLabel="Einstellungen" hitSlop={8} onPress={() => router.push("/settings")}
            style={({ pressed }) => [styles.settings, { backgroundColor: theme.card, borderColor: theme.tabBarBorder, opacity: pressed ? 0.7 : 1 }]}>
              <Image source={AssetImages.settings} style={[styles.settingsIcon, { tintColor: theme.text }]} />
            </Pressable>
          }
        </View>
      </SafeAreaView>
      {isTab && 
        <>
          <GestureDetector gesture={swipeFromLeft}>
            <View style={[styles.edge, styles.edgeLeft]} />
          </GestureDetector>
          <GestureDetector gesture={swipeFromRight}>
            <View style={[styles.edge, styles.edgeRight]} />
          </GestureDetector>
        </>
      }
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    overflow: "hidden"
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three
  },
  safeAreaFullBleed: {
    paddingHorizontal: 0,
    paddingBottom: BottomTabInset
  },
  title: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three
  },
  content: {
    flex: 1,
  },
  settings: {
    position: "absolute",
    top: Spacing.three + Spacing.two,
    right: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center"
  },
  settingsIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain"
  },
  edge: {
    position: "absolute",
    top: 0,
    bottom: BottomTabInset,
    width: EDGE_WIDTH
  },
  edgeLeft: {
    left: 0
  },
  edgeRight: {
    right: 0
  },
});