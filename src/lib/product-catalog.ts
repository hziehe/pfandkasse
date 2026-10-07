import type { DepositType } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "product_catalog_v1";
const OFF_URL = "https://world.openfoodfacts.org/api/v2/product";
const OFF_FIELDS = "product_name,product_name_de,product_quantity,product_quantity_unit,packaging_tags,packaging_materials_tags,packaging_shapes_tags,labels_tags";
const OFF_TIMEOUT = 4000;
const OFF_USER_AGENT = "Pfandkasse/1.0 (h.ziehe99@gmail.com)";
const OFF_RATE_WINDOW = 60_000;
const OFF_RATE_LIMIT = 10;
const OFF_BLOCK_DURATION = 2 * 60_000;

export type BottleType = Exclude<DepositType, "kasten">;

export type Product = {
  ean: string;
  name: string;
  volume?: number;
  type: BottleType;
};

export type ProductMatch =
  | { source: "catalog"; product: Product }
  | { source: "openfoodfacts"; product: Omit<Product, "type"> & { type?: BottleType } };

type OffProduct = {
  product_name?: string;
  product_name_de?: string;
  product_quantity?: number | string;
  product_quantity_unit?: string;
  packaging_tags?: string[];
  packaging_materials_tags?: string[];
  packaging_shapes_tags?: string[];
  labels_tags?: string[];
};

type OffLookup =
  | { status: "found"; match: ProductMatch }
  | { status: "missing" }
  | { status: "failed" };

let products: Record<string, Product> = {};
let loading: Promise<void> | null = null;
const remoteLookups = new Map<string, Promise<OffLookup>>();
const requestTimes: number[] = [];
let blockedUntil = 0;

function load() {
  loading ??= AsyncStorage.getItem(KEY).then((value) => {
      const stored: Record<string, Product> = value ? JSON.parse(value) : {};
      products = { ...stored, ...products };
    }).catch(() => {});
  return loading;
}

export async function findProduct(ean: string): Promise<ProductMatch | null> {
  await load();
  const product = products[ean];
  if (product) return { source: "catalog", product };

  let lookup = remoteLookups.get(ean);
  if (!lookup) {
    if (!reserveRequest()) return null;
    lookup = fetchOpenFoodFacts(ean);
    remoteLookups.set(ean, lookup);
    lookup.then((result) => result.status === "failed" && remoteLookups.delete(ean));
  }
  const result = await lookup;
  return result.status === "found" ? result.match : null;
}

function reserveRequest() {
  const now = Date.now();
  if (now < blockedUntil) return false;
  while (requestTimes.length > 0 && now - requestTimes[0] >= OFF_RATE_WINDOW) requestTimes.shift();
  if (requestTimes.length >= OFF_RATE_LIMIT) return false;
  requestTimes.push(now);
  return true;
}

export function saveProduct(product: Product) {
  products = { ...products, [product.ean]: product };
  AsyncStorage.setItem(KEY, JSON.stringify(products)).catch(() => {});
}

async function fetchOpenFoodFacts(ean: string): Promise<OffLookup> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OFF_TIMEOUT);
  try {
    const response = await fetch(`${OFF_URL}/${encodeURIComponent(ean)}?fields=${OFF_FIELDS}`, {
      signal: controller.signal,
      headers: { "User-Agent": OFF_USER_AGENT },
    });
    if (response.status === 429) {
      blockedUntil = Date.now() + OFF_BLOCK_DURATION;
      return { status: "failed" };
    }
    if (response.status === 404) return { status: "missing" };
    if (!response.ok) return { status: "failed" };
    const json: { status?: number; product?: OffProduct } = await response.json();
    if (json.status !== 1 || !json.product) return { status: "missing" };

    const off = json.product;
    const name = stripVolume(off.product_name_de || off.product_name || "");
    if (!name) return { status: "missing" };
    return {
      status: "found",
      match: {
        source: "openfoodfacts",
        product: { ean, name, volume: toLiters(off.product_quantity, off.product_quantity_unit), type: guessBottleType(off) },
      },
    };
  } catch {
    return { status: "failed" };
  } finally {
    clearTimeout(timer);
  }
}

function stripVolume(name: string) {
  return name.replace(/\s*\d+(?:[.,]\d+)?\s*(?:l|liter|ml|cl)\b\.?/gi, "").replace(/\s{2,}/g, " ").trim();
}

function toLiters(quantity: number | string | undefined, unit: string | undefined): number | undefined {
  const value = Number(quantity);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  switch (unit?.toLowerCase()) {
    case "ml": return Math.round(value) / 1000;
    case "cl": return Math.round(value * 10) / 1000;
    case "l": return value;
    default: return undefined;
  }
}

function guessBottleType(off: OffProduct): BottleType | undefined {
  const tags = [...(off.packaging_tags ?? []), ...(off.packaging_materials_tags ?? []), ...(off.packaging_shapes_tags ?? []), ...(off.labels_tags ?? [])].join(" ");
  const glass = /glass|glas/.test(tags);
  if (/einwegpfand|einweg/.test(tags)) return "einweg";
  if (/mehrweg|returnable/.test(tags)) return glass ? "glas" : "mehrweg";
  if (glass) return "glas";
  if (/\b(aluminium|can|dose|pet|plastic|kunststoff)/.test(tags)) return "einweg";
  return undefined;
}

export function formatEan(ean: string) {
  if (ean.length === 13) return `${ean.slice(0, 1)} ${ean.slice(1, 7)} ${ean.slice(7)}`;
  if (ean.length === 8) return `${ean.slice(0, 4)} ${ean.slice(4)}`;
  return ean;
}

export function parseVolume(text: string): number | undefined {
  const value = Number.parseFloat(text.replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}
