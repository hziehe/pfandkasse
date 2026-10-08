import { ThemedText } from "@/components/themed-text";
import { formatEuro } from "@/constants/deposit";
import { AssetImages } from "@/constants/images";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { summarizeHistory, useDepositHistory } from "@/lib/deposit-history";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

function formatDay(timestamp: number) {
  const date = new Date(timestamp);
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.`;
}

function SuccessBadge() {
  const theme = useTheme();
  const ring = useSharedValue(0);
  const badge = useSharedValue(0);
  const check = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    ring.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    badge.value = withDelay(100, withSpring(1, { damping: 10, stiffness: 160 }));
    check.value = withDelay(300, withSpring(1, { damping: 8, stiffness: 200 }));
    pulse.value = withDelay(350, withSequence(
      withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 0 }),
      withDelay(150, withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }))
    ));
  }, [ring, badge, check, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value,
    transform: [{ scale: 0.6 + ring.value * 0.4 }]
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badge.value }]
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: Math.min(check.value, 1),
    transform: [{ scale: check.value }, { rotate: `${(1 - check.value) * -45}deg` }]
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value === 0 ? 0 : 0.5 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.9 }]
  }));

  return (
    <View style={styles.badgeContainer}>
      <Animated.View style={[styles.pulse, { borderColor: theme.primary }, pulseStyle]} />
      <Animated.View style={[styles.badgeRing, ringStyle]}>
        <Animated.View style={[styles.badge, { backgroundColor: theme.primary }, badgeStyle]}>
          <Animated.Image resizeMode="contain" source={AssetImages.check} style={[styles.badgeIcon, checkStyle]} tintColor={theme.inverseText} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function enter(index: number) {
  return FadeInDown.delay(450 + index * 90).duration(450).easing(Easing.bezier(0.33, 1, 0.68, 1));
}

export default function SubmissionSavedScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const history = useDepositHistory();
  const record = history.find((entry) => entry.id === id);

  const { monthTotal, total: allTimeTotal } = summarizeHistory(history);

  return (
    <View style={[styles.container, { backgroundColor: theme.inverseCard }]}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <SuccessBadge />
          <Animated.View entering={enter(0)}>
            <ThemedText style={[styles.title, { color: theme.inverseTextSecondary }]}>Abgabe gespeichert</ThemedText>
          </Animated.View>
          {record &&
            <>
              <Animated.View entering={enter(1)} style={styles.totalWrapper}>
                <ThemedText style={[styles.total, { color: theme.inverseText }]} adjustsFontSizeToFit numberOfLines={1}>
                  {formatEuro(record.total)}
                </ThemedText>
              </Animated.View>
              <Animated.View entering={enter(2)}>
                <ThemedText style={[styles.caption, { color: theme.inverseTextSecondary }]}>
                  {record.bottleCount} {record.bottleCount === 1 ? "Flasche" : "Flaschen"}
                  {record.crateCount > 0 && ` und ${record.crateCount} ${record.crateCount === 1 ? "Kiste" : "Kisten"}`}
                  {` am ${formatDay(record.finishedAt)} abgegeben und im Verlauf gespeichert.`}
                </ThemedText>
              </Animated.View>
            </>
          }
          <Animated.View entering={enter(3)} style={styles.stats}>
            <View style={styles.stat}>
              <ThemedText style={[styles.statLabel, { color: theme.inverseTextSecondary }]}>Diesen Monat</ThemedText>
              <ThemedText style={[styles.statValue, { color: theme.inverseText }]}>{formatEuro(monthTotal)}</ThemedText>
            </View>
            <View style={styles.stat}>
              <ThemedText style={[styles.statLabel, { color: theme.inverseTextSecondary }]}>Seit Start</ThemedText>
              <ThemedText style={[styles.statValue, { color: theme.inverseText }]}>{formatEuro(allTimeTotal)}</ThemedText>
            </View>
          </Animated.View>
        </View>
        <Animated.View entering={enter(4)} style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={() => router.dismissTo("/counter")}
            style={({ pressed }) => [styles.button, { backgroundColor: theme.inverseText, opacity: pressed ? 0.7 : 1 }]}>
            <ThemedText style={[styles.buttonText, { color: theme.inverseCard }]}>Neue Abgabe starten</ThemedText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.dismissTo("/history")}
            style={({ pressed }) => [styles.button, styles.outlineButton, { opacity: pressed ? 0.7 : 1 }]}>
            <ThemedText style={[styles.buttonText, { color: theme.inverseText }]}>Zum Verlauf</ThemedText>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center"
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  badgeContainer: {
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.four
  },
  pulse: {
    position: "absolute",
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2
  },
  badgeRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center"
  },
  badge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center"
  },
  badgeIcon: {
    width: 36,
    height: 36
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500
  },
  totalWrapper: {
    alignSelf: "stretch",
    alignItems: "center"
  },
  total: {
    fontSize: 52,
    lineHeight: 64,
    fontWeight: 700,
    letterSpacing: -1,
    marginTop: Spacing.two
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    textAlign: "center",
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four
  },
  stats: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.five,
    alignSelf: "stretch"
  },
  stat: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)"
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 500
  },
  statValue: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
    marginTop: Spacing.one
  },
  actions: {
    gap: Spacing.two
  },
  button: {
    paddingVertical: Spacing.three,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)"
  },
  buttonText: {
    fontWeight: 600
  }
});
