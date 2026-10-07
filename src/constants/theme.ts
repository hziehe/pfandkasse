import "@/global.css";
import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    background: "#F3F5EF",
    backgroundElement: "#E3F0E7",
    card: "#FFFFFF",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
    primary: "#1D6B44",
    tabBarBorder: "#E6E6E9",
    tabActive: "#1D6B44",
    tabInactive: "#60646C",
    inverseCard: "#13231A",
    inverseText: "#FFFFFF",
    inverseTextSecondary: "#A7B5AC",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    card: "#1A1B1E",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
    primary: "#4CB37E",
    tabBarBorder: "#2E3135",
    tabActive: "#5FD597",
    tabInactive: "#7C8088",
    inverseCard: "#1C3326",
    inverseText: "#FFFFFF",
    inverseTextSecondary: "#A7B5AC",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export type DepositType = "einweg" | "mehrweg" | "glas" | "kasten";

export const DepositColors = {
  light: {
    einweg: { background: "#FCEBD6", foreground: "#C47A1E" },
    mehrweg: { background: "#E1EAF7", foreground: "#2E5A9C" },
    glas: { background: "#DFF0E5", foreground: "#1D6B44" },
    kasten: { background: "#ECEDEA", foreground: "#3A3D3A" },
  },
  dark: {
    einweg: { background: "#3D2A12", foreground: "#F0B36A" },
    mehrweg: { background: "#18263D", foreground: "#8FB3EA" },
    glas: { background: "#14301F", foreground: "#4CB37E" },
    kasten: { background: "#2E3135", foreground: "#C9CCD1" },
  },
} as const satisfies Record<"light" | "dark", Record<DepositType, { background: string; foreground: string }>>;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
