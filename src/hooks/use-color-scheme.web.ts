import { useThemeOverride } from '@/lib/theme-override';
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useSystemColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }
  return 'light';
}

export function useColorScheme() {
  const override = useThemeOverride();
  const system = useSystemColorScheme();
  return override ?? system;
}
