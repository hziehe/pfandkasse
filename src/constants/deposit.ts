import type { DepositType } from "./theme";

export type DepositInfo = {
  type: DepositType;
  label: string;
  shortLabel: string;
  description: string;
  amount: number;
};

export const DEPOSIT_TYPES: DepositInfo[] = [
  { type: "einweg", label: "Einweg", shortLabel: "Einweg", description: "PET-Flaschen und Dosen mit DPG-Logo", amount: 25 },
  { type: "mehrweg", label: "Mehrweg", shortLabel: "Mehrweg", description: "PET-Mehrweg und Saftflaschen", amount: 15 },
  { type: "glas", label: "Mehrweg Glas", shortLabel: "Glas", description: "Bier- und Wasserflaschen aus Glas", amount: 8 },
  { type: "kasten", label: "Kasten", shortLabel: "Kisten", description: "Leerer Kasten, Flaschen zählen extra", amount: 150 },
];

export function getDepositInfo(type: DepositType): DepositInfo {
  return DEPOSIT_TYPES.find((deposit) => deposit.type === type)!;
}

export function formatEuro(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}
