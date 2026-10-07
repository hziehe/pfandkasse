import { Step1, Step2, Step3, Step4, type StepProps } from "@/components/onboarding";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { setOnboardingCompleted } from "@/lib/onboarding";
import { router } from "expo-router";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { Animated, BackHandler, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

const STEPS: ComponentType<StepProps>[] = [Step1, Step2, Step3, Step4];
const STEP_DELAY_MS = 300;

const COLORS = {
  bg: "#F1F5EF",
  primary: "#1F6B47",
  primarySoft: "#1F6B4722",
  dotInactive: "#C9D3CC",
  title: "#16251C",
  text: "#5B6B61",
};

export default function OnboardingScreen() {

  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const isLast = index === STEPS.length - 1;
  const CurrentStep = STEPS[index];

  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);

  useEffect(() => {
    Animated.timing(scrollX, { toValue: index * width, duration: 250, useNativeDriver: false }).start();
  }, [index, width, scrollX]);

  async function finish() {
    setSaving(true);
    try {
      await setOnboardingCompleted();
      router.replace("/counter");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!locked) return;
    const timeout = setTimeout(() => { 
      lockedRef.current = false; 
      setLocked(false); 
    }, STEP_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [locked]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (index > 0) back();
      return true;
    });
    return () => sub.remove();
  }, [index]);

  function goTo(update: (i: number) => number) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);
    setIndex(update);
  }

  function next() {
    goTo((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function back() {
    goTo((i) => Math.max(i - 1, 0));
  }

  return (
    <TabScreen title="">
      <View style={styles.header}>
        <View style={styles.dots}>
          {STEPS.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({ inputRange, outputRange: [6, 22, 6], extrapolate: "clamp" });
            const backgroundColor = scrollX.interpolate({ inputRange, outputRange: [ COLORS.dotInactive, COLORS.primary, COLORS.dotInactive ], extrapolate: "clamp" });
            return <Animated.View key={i} style={[styles.dot, { width: dotWidth, backgroundColor }]} />;
          })}
        </View>
        {!isLast && <Pressable accessibilityRole="button" disabled={saving} onPress={finish} hitSlop={12}>
            <ThemedText style={styles.skip}>Überspringen</ThemedText>
          </Pressable>}
      </View>
      <View style={styles.step}>
        <CurrentStep onNext={next} onBack={back} onFinish={finish} disabled={saving || locked} />
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  dots: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 5
  },
  dot: { 
    height: 6, 
    borderRadius: 3 
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  skip: { 
    fontSize: 14, 
    fontWeight: 500, 
    color: COLORS.primary 
  },
  step: { 
    flex: 1 
  }
});