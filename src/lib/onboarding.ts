import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "onboarding_completed_v1";

export async function isOnboardingCompleted(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) === "true";
}

export async function setOnboardingCompleted(): Promise<void> {
  await AsyncStorage.setItem(KEY, "true");
}

export async function resetOnboardingCompleted(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
