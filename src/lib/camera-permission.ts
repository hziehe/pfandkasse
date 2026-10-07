import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "camera_permission_v1";

export type CameraPermissionChoice = "granted" | "denied" | "skipped";

export async function getCameraPermissionChoice(): Promise<CameraPermissionChoice | null> {
  const value = await AsyncStorage.getItem(KEY);
  return value === "granted" || value === "denied" || value === "skipped" ? value : null;
}

export async function setCameraPermissionChoice(choice: CameraPermissionChoice): Promise<void> {
  await AsyncStorage.setItem(KEY, choice);
}

export async function resetCameraPermissionChoice(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
