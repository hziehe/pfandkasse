import { Colors, DepositColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function useResolvedScheme() {
  const scheme = useColorScheme();
  return scheme === 'unspecified' || !scheme ? 'light' : scheme;
}

export function useTheme() {
  return Colors[useResolvedScheme()];
}

export function useDepositColors() {
  return DepositColors[useResolvedScheme()];
}
