import { ScreenHeader } from "@/components/screen-header";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { resetCameraPermissionChoice } from "@/lib/camera-permission";
import { seedDemoSession } from "@/lib/deposit-session";
import { resetOnboardingCompleted } from "@/lib/onboarding";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function SettingsScreen() {

  const theme = useTheme();
  const [resetting, setResetting] = useState(false);

  async function resetOnboarding() {
    setResetting(true);
    try {
      await resetOnboardingCompleted();
      await resetCameraPermissionChoice();
      router.replace("/onboarding");
    } finally {
      setResetting(false);
    }
  }

  return (
    <TabScreen title="">
      <ScreenHeader title="Einstellungen" />
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={seedDemoSession} style={({ pressed }) =>
        [styles.button, { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText style={styles.buttonText}>
            Demo-Daten zurücksetzen
          </ThemedText>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={resetting} onPress={resetOnboarding} style={({ pressed }) =>
        [styles.button, { backgroundColor: theme.backgroundElement, opacity: pressed || resetting ? 0.7 : 1 }]}>
          <ThemedText style={styles.buttonText}>
            Onboarding zurücksetzen
          </ThemedText>
        </Pressable>
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: "auto",
    gap: Spacing.three,
    marginBottom: Spacing.five
  },
  button: {
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: "center"
  },
  buttonText: {
    fontWeight: 600
  }
});
