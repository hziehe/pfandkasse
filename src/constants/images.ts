import { Asset } from "expo-asset";

export const AssetImages = {
  hero: require("@/assets/images/onboarding/onboarding-step-1.png"),
  scanBarcode: require("@/assets/images/tabIcons/scan-barcode.png"),
  wifiOff: require("@/assets/images/onboarding/wifi-off.png"),
  clock: require("@/assets/images/tabIcons/clock.png"),
  database: require("@/assets/images/tabIcons/database.png"),
  check: require("@/assets/images/onboarding/check.png"),
  alert: require("@/assets/images/onboarding/circle-alert.png"),
  bottle: require("@/assets/images/onboarding/bottle.png"),
  box: require("@/assets/images/onboarding/cuboid.png"),
  hero4: require("@/assets/images/onboarding/onboarding-step-4.png"),
  settings: require("@/assets/images/settings.png"),
  left: require("@/assets/images/chevron-left.png"),
  undo: require("@/assets/images/undo-2.png"),
  scanTemplate: require("@/assets/images/scan-template.png"),
  close: require("@/assets/images/x.png"),
  flashlight: require("@/assets/images/flashlight.png")
} as const;

export function preloadAssetImages() {
  return Asset.loadAsync(Object.values(AssetImages));
}
