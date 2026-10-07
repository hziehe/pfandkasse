import type { DepositType } from "./theme";

export type CratePreset = {
  id: string;
  name: string;
  crateName: string;
  material: string;
  bottles: number;
  volume: number;
  bottleType: DepositType;
  bottleAmount: number;
  crateAmount: number;
};

export const CRATE_PRESETS: CratePreset[] = [
  { id: "bier-20-05", name: "Bier", crateName: "Bierkasten", material: "Glas", bottles: 20, volume: 0.5, bottleType: "glas", bottleAmount: 8, crateAmount: 150 },
  { id: "bier-24-033", name: "Bier", crateName: "Bierkasten", material: "Glas", bottles: 24, volume: 0.33, bottleType: "glas", bottleAmount: 8, crateAmount: 150 },
  { id: "bier-20-033", name: "Bier", crateName: "Bierkasten", material: "Glas", bottles: 20, volume: 0.33, bottleType: "glas", bottleAmount: 8, crateAmount: 150 },
  { id: "buegel-20-05", name: "Bügel", crateName: "Bügelkasten", material: "Bügelflaschen", bottles: 20, volume: 0.5, bottleType: "mehrweg", bottleAmount: 15, crateAmount: 150 },
  { id: "wasser-12-07", name: "Wasser", crateName: "Wasserkasten", material: "Glas", bottles: 12, volume: 0.7, bottleType: "mehrweg", bottleAmount: 15, crateAmount: 150 },
  { id: "wasser-12-075", name: "Wasser", crateName: "Wasserkasten", material: "Glas", bottles: 12, volume: 0.75, bottleType: "mehrweg", bottleAmount: 15, crateAmount: 150 },
  { id: "wasser-12-1", name: "Wasser", crateName: "Wasserkasten", material: "PET-Mehrweg", bottles: 12, volume: 1, bottleType: "mehrweg", bottleAmount: 15, crateAmount: 150 },
  { id: "limo-24-033", name: "Limo", crateName: "Limokasten", material: "Glas", bottles: 24, volume: 0.33, bottleType: "mehrweg", bottleAmount: 15, crateAmount: 150 },
  { id: "limo-12-1", name: "Limo", crateName: "Limokasten", material: "PET-Mehrweg", bottles: 12, volume: 1, bottleType: "mehrweg", bottleAmount: 15, crateAmount: 150 },
  { id: "limo-12-1-glas", name: "Limo", crateName: "Limokasten", material: "Glas", bottles: 12, volume: 1, bottleType: "mehrweg", bottleAmount: 15, crateAmount: 150 },
  { id: "saft-6-1", name: "Saft", crateName: "Saftkasten", material: "Glas", bottles: 6, volume: 1, bottleType: "mehrweg", bottleAmount: 15, crateAmount: 150 },
  { id: "leer", name: "Leere Kiste", crateName: "Leere Kiste", material: "Ohne Flaschen", bottles: 0, volume: 0, bottleType: "mehrweg", bottleAmount: 0, crateAmount: 150 }
];

export function getFullCrateAmount(preset: CratePreset) {
  return preset.crateAmount + preset.bottles * preset.bottleAmount;
}
