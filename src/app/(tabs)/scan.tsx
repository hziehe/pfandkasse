import { StepButton } from "@/components/onboarding/step-button";
import { FlyingBottle, ScanResultSheet, ScanToast, type Point } from "@/components/scanner";
import { TabScreen } from "@/components/tab-screen";
import { ThemedText } from "@/components/themed-text";
import { formatEuro } from "@/constants/deposit";
import { AssetImages } from "@/constants/images";
import { Spacing, type DepositType } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { setCameraPermissionChoice } from "@/lib/camera-permission";
import { addScan, formatScanTitle, useDepositSession } from "@/lib/deposit-session";
import { haptic } from "@/lib/haptics";
import { findCatalogProduct, findProduct, saveProduct, type Product, type ProductMatch } from "@/lib/product-catalog";
import { getSettings } from "@/lib/settings";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Linking, Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BARCODE_TYPES = ["ean13", "ean8", "upc_a", "upc_e"] as const;
const RESCAN_GAP = 2000;
const TOAST_DURATION = 2200;
const OVERLAY_TEXT = "#FFFFFF";
const OVERLAY_SURFACE = "#00000073";
const OVERLAY_BORDER = "#ffffff4d";

type ScanResult = {
  id: number;
  ean: string;
  match: ProductMatch | null;
  loading: boolean;
};

type AddedScan = {
  id: string;
  title: string;
  amount: number;
  type: DepositType;
};

type Flight = AddedScan & { from: Point; to: Point };

function centerOf({ nativeEvent: { layout } }: LayoutChangeEvent): Point {
  return { x: layout.x + layout.width / 2, y: layout.y + layout.height / 2 };
}

export default function ScanScreen() {

  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { summary } = useDepositSession();
  const [permission, requestPermission] = useCameraPermissions();
  const [focused, setFocused] = useState(false);
  const [torch, setTorch] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  const busy = useRef(false);
  const lastHandled = useRef<{ ean: string; at: number } | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [toast, setToast] = useState<AddedScan | null>(null);
  const [topBarHeight, setTopBarHeight] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const frameCenter = useRef<Point | null>(null);
  const pillCenter = useRef<Point | null>(null);
  const pillScale = useSharedValue(1);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pillScale.get() }],
  }));

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        setFocused(false);
        setTorch(false);
      };
    }, []),
  );

  function showToast(added: AddedScan) {
    clearTimeout(toastTimer.current);
    setToast(added);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION);
  }

  function countProduct(product: Product) {
    const entry = addScan({ name: product.name, volume: product.volume, type: product.type });
    closeResult(product.ean);
    const added: AddedScan = { id: entry.id, title: formatScanTitle(entry), amount: entry.amount, type: entry.type };
    const from = frameCenter.current;
    const to = pillCenter.current;
    if (from && to) {
      setFlights((current) => [...current, { ...added, from, to }]);
    } else {
      haptic("success");
      showToast(added);
    }
  }

  async function handleScanned({ data }: BarcodeScanningResult) {
    const { autoAdd } = getSettings();
    const last = lastHandled.current;
    const now = Date.now();
    if (last?.ean === data && now - last.at < RESCAN_GAP) {
      last.at = now;
      return;
    }
    if (busy.current) return;
    busy.current = true;
    if (autoAdd) {
      const known = await findCatalogProduct(data);
      if (known) {
        countProduct(known);
        return;
      }
    }
    haptic("tap");
    const id = Date.now();
    setResult({ id, ean: data, match: null, loading: true });
    const match = await findProduct(data);
    setResult((current) => current?.id === id ? { ...current, match, loading: false } : current);
  }

  function closeResult(ean: string) {
    lastHandled.current = { ean, at: Date.now() };
    busy.current = false;
    setResult(null);
  }

  function handleAdd(product: Product) {
    saveProduct(product);
    countProduct(product);
  }

  function handleArrive(id: string) {
    const flight = flights.find((item) => item.id === id);
    if (!flight) return;
    setFlights((current) => current.filter((item) => item.id !== id));
    pillScale.set(withSequence(withTiming(1.12, { duration: 90 }), withSpring(1, { damping: 8, stiffness: 300 })));
    haptic("success");
    showToast(flight);
  }

  function handleClose() {
    if (result) {
      closeResult(result.ean);
    } else {
      router.navigate("/counter");
    }
  }

  async function handleRequestPermission() {
    if (permission && !permission.canAskAgain) {
      Linking.openSettings();
      return;
    }
    const { granted } = await requestPermission();
    await setCameraPermissionChoice(granted ? "granted" : "denied");
  }

  const granted = permission?.granted ?? false;

  return (
    <TabScreen title="" fullBleed>
      {focused && <StatusBar style="light" />}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.camera, { backgroundColor: theme.inverseCard }]}>
          {granted && focused && <CameraView style={StyleSheet.absoluteFill} facing="back" enableTorch={torch} barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }} onBarcodeScanned={result ? undefined : handleScanned} />}
          <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two }]} onLayout={(event) => setTopBarHeight(event.nativeEvent.layout.height)}>
            <View style={styles.topBarSide}>
              <Pressable accessibilityRole="button" accessibilityLabel={result ? "Scan verwerfen" : "Scanner schließen"} hitSlop={8} onPress={handleClose}
              style={({ pressed }) => [styles.roundButton, { opacity: pressed ? 0.7 : 1 }]}>
                <Image source={AssetImages.close} style={[styles.buttonIcon, { tintColor: OVERLAY_TEXT }]} />
              </Pressable>
            </View>
            <Animated.View style={[styles.pill, pillStyle]} onLayout={(event) => { pillCenter.current = centerOf(event); }}>
              <ThemedText style={styles.pillText} numberOfLines={1}>Summe: {formatEuro(summary.total)} · {summary.bottleCount} Fl.</ThemedText>
            </Animated.View>
            <View style={[styles.topBarSide, styles.topBarRight]}>
              <Pressable accessibilityRole="switch" accessibilityLabel="Taschenlampe" accessibilityState={{ checked: torch }} disabled={!granted} hitSlop={4}
              onPress={() => setTorch((on) => !on)} style={({ pressed }) => [styles.roundButton, torch && { backgroundColor: OVERLAY_TEXT }, { opacity: !granted ? 0.4 : pressed ? 0.7 : 1 }]}>
                <Image source={AssetImages.flashlight} style={[styles.buttonIcon, { tintColor: torch ? theme.inverseCard : OVERLAY_TEXT }]} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Einstellungen" hitSlop={4} onPress={() => router.push("/settings")}
              style={({ pressed }) => [styles.roundButton, { opacity: pressed ? 0.7 : 1 }]}>
                <Image source={AssetImages.settings} style={[styles.buttonIcon, { tintColor: OVERLAY_TEXT }]} />
              </Pressable>
            </View>
          </View>
          <View style={[styles.center, { paddingBottom: result ? sheetHeight : 0 }]} pointerEvents="box-none">
            {granted ?
              <>
                <Image source={AssetImages.scanTemplate} style={styles.frame} onLayout={(event) => { frameCenter.current = centerOf(event); }} />
                <ThemedText style={styles.hint}>Barcode im Rahmen halten</ThemedText>
                <Pressable accessibilityRole="button" onPress={() => router.push("/add-crate")} style={({ pressed }) => [styles.crateButton, { opacity: pressed ? 0.7 : 1 }]}>
                  <Image source={AssetImages.box} style={styles.crateIcon} />
                  <ThemedText style={styles.crateText}>Ganzen Kasten hinzufügen</ThemedText>
                </Pressable>
              </> :
              permission &&
              <View style={styles.permission}>
                <ThemedText style={styles.permissionTitle}>Kamera-Zugriff benötigt</ThemedText>
                <ThemedText style={styles.permissionText}>
                  Pfandkasse liest nur Barcodes und speichert keine Fotos.
                </ThemedText>
                <StepButton label={permission.canAskAgain ? "Kamera erlauben" : "Einstellungen öffnen"} onPress={handleRequestPermission} style={styles.permissionButton} />
              </View>
            }
          </View>
          {result &&
            <View style={styles.sheetContainer} onLayout={(event) => setSheetHeight(event.nativeEvent.layout.height)}>
              <ScanResultSheet key={result.id} ean={result.ean} match={result.match} loading={result.loading} onAdd={handleAdd} onDiscard={() => closeResult(result.ean)} />
            </View>
          }

          {flights.map((flight) => <FlyingBottle key={flight.id} id={flight.id} from={flight.from} to={flight.to} type={flight.type} onArrive={handleArrive} />)}
          {toast &&
            <View style={[styles.toastContainer, { top: topBarHeight }]} pointerEvents="none">
              <ScanToast key={toast.id} title={toast.title} amount={toast.amount} type={toast.type} />
            </View>
          }
        </View>
      </KeyboardAvoidingView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  camera: {
    flex: 1,
    overflow: "hidden"
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    zIndex: 1
  },
  topBarSide: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.two
  },
  topBarRight: {
    justifyContent: "flex-end"
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: OVERLAY_SURFACE
  },
  buttonIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain"
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    backgroundColor: OVERLAY_SURFACE
  },
  pillText: {
    color: OVERLAY_TEXT,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 700,
    fontVariant: ["tabular-nums"]
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four
  },
  frame: {
    width: "80%",
    maxWidth: 320,
    aspectRatio: 270 / 170,
    resizeMode: "contain"
  },
  hint: {
    color: OVERLAY_TEXT,
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowRadius: 4
  },
  crateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two + Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: OVERLAY_BORDER,
    backgroundColor: OVERLAY_SURFACE
  },
  crateIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    tintColor: OVERLAY_TEXT
  },
  crateText: {
    color: OVERLAY_TEXT,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700
  },
  permission: {
    alignItems: "center",
    gap: Spacing.two
  },
  permissionTitle: {
    color: OVERLAY_TEXT,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700
  },
  permissionText: {
    color: OVERLAY_TEXT,
    opacity: 0.75,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  },
  permissionButton: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four
  },
  toastContainer: {
    position: "absolute",
    left: Spacing.three,
    right: Spacing.three,
    zIndex: 2
  },
  sheetContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0
  }
});
