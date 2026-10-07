import { ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { StyleSheet, Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  type?: "default" | "subtitle";
  themeColor?: ThemeColor;
};
export function ThemedText({ style, type = "default", themeColor, ...rest }: ThemedTextProps) {

  const theme = useTheme();
  return <Text style={[{ color: theme[themeColor ?? "text"] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600
  }
});