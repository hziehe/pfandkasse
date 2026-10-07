import { Colors } from "@/constants/theme";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function AppTabs() {
  
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  return (
    <NativeTabs backgroundColor={colors.background} shadowColor={colors.tabBarBorder} disableIndicator labelVisibilityMode="labeled" rippleColor={colors.backgroundElement} 
    iconColor={{ default: colors.tabInactive, selected: colors.tabActive }} labelStyle={{
        default: { color: colors.tabInactive, fontSize: 12, fontWeight: "500" }, selected: { color: colors.tabActive, fontSize: 12, fontWeight: "700" } }}>
      <NativeTabs.Trigger name="counter">
        <NativeTabs.Trigger.Label>Zähler</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require("@/assets/images/tabIcons/database.png")} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="scan">
        <NativeTabs.Trigger.Label>Scannen</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require("@/assets/images/tabIcons/scan-barcode.png")} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>Verlauf</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require("@/assets/images/tabIcons/clock.png")} renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
