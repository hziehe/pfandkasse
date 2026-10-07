import { useThemeOverride } from '@/lib/theme-override';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useSystemColorScheme() {
  return useRNColorScheme();
}

export function useColorScheme() {
  const override = useThemeOverride();
  const system = useRNColorScheme();
  return override ?? system;
}
