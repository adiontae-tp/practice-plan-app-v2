import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useData } from './DataContext';
import { useAppStore } from '@ppa/store';
import { COLORS } from '@ppa/ui/branding';

interface TeamThemeColors {
  primary: string;
  secondary: string;
  primaryDark: string;
  primaryLight: string;
  logoUrl: string | null;
}

interface TeamThemeContextType {
  colors: TeamThemeColors;
  canCustomize: boolean;
}

const DEFAULT_PRIMARY = '#356793';
const DEFAULT_SECONDARY = '#EF7B8F';

function adjustBrightness(hex: string, percent: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);

  if (percent > 0) {
    r = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));
  } else {
    r = Math.max(0, Math.round(r * (1 + percent / 100)));
    g = Math.max(0, Math.round(g * (1 + percent / 100)));
    b = Math.max(0, Math.round(b * (1 + percent / 100)));
  }

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const TeamThemeContext = createContext<TeamThemeContextType>({
  colors: {
    primary: DEFAULT_PRIMARY,
    secondary: DEFAULT_SECONDARY,
    primaryDark: adjustBrightness(DEFAULT_PRIMARY, -20),
    primaryLight: adjustBrightness(DEFAULT_PRIMARY, 40),
    logoUrl: null,
  },
  canCustomize: false,
});

export function useTeamTheme() {
  return useContext(TeamThemeContext);
}

interface TeamThemeProviderProps {
  children: ReactNode;
}

export function TeamThemeProvider({ children }: TeamThemeProviderProps) {
  const { team } = useData();
  const subscription = useAppStore((state) => state.subscription);
  const tierOverride = useAppStore((state) => state.tierOverride);

  const effectiveTier = tierOverride ?? subscription.tier;
  const canCustomize = effectiveTier === 'organization';

  const colors = useMemo<TeamThemeColors>(() => {
    const primary = canCustomize && team?.primaryColor ? team.primaryColor : DEFAULT_PRIMARY;
    const secondary = canCustomize && team?.secondaryColor ? team.secondaryColor : DEFAULT_SECONDARY;

    return {
      primary,
      secondary,
      primaryDark: adjustBrightness(primary, -20),
      primaryLight: adjustBrightness(primary, 40),
      logoUrl: canCustomize && team?.logoUrl ? team.logoUrl : null,
    };
  }, [canCustomize, team?.primaryColor, team?.secondaryColor, team?.logoUrl]);

  const value = useMemo(() => ({ colors, canCustomize }), [colors, canCustomize]);

  return (
    <TeamThemeContext.Provider value={value}>
      {children}
    </TeamThemeContext.Provider>
  );
}
