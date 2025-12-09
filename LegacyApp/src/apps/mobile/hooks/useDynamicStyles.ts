import { useMemo } from 'react';
import { useTeamTheme } from '@/contexts/TeamThemeContext';
import { COLORS } from '@ppa/ui/branding';

export function useDynamicHeaderStyle() {
  const { colors, canCustomize } = useTeamTheme();

  return useMemo(() => ({
    backgroundColor: canCustomize ? colors.primary : COLORS.primary,
    tintColor: COLORS.white,
  }), [colors.primary, canCustomize]);
}

export function useDynamicTabBarStyle() {
  const { colors, canCustomize } = useTeamTheme();

  return useMemo(() => ({
    activeTintColor: canCustomize ? colors.primary : COLORS.tabActive,
    inactiveTintColor: COLORS.tabInactive,
  }), [colors.primary, canCustomize]);
}
