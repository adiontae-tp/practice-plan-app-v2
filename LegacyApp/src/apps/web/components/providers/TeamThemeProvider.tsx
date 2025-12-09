'use client';

import { useEffect, useMemo } from 'react';
import { useAppStore } from '@ppa/store';

const DEFAULT_PRIMARY = '#356793';
const DEFAULT_SECONDARY = '#EF7B8F';

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '53 103 147';
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
}

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
  
  return `${r} ${g} ${b}`;
}

function generateColorScale(baseHex: string): Record<string, string> {
  return {
    '0': '255 255 255',
    '50': adjustBrightness(baseHex, 90),
    '100': adjustBrightness(baseHex, 80),
    '200': adjustBrightness(baseHex, 60),
    '300': adjustBrightness(baseHex, 40),
    '400': adjustBrightness(baseHex, 20),
    '500': hexToRgb(baseHex),
    '600': adjustBrightness(baseHex, -10),
    '700': adjustBrightness(baseHex, -20),
    '800': adjustBrightness(baseHex, -30),
    '900': adjustBrightness(baseHex, -40),
    '950': adjustBrightness(baseHex, -50),
  };
}

interface TeamThemeProviderProps {
  children: React.ReactNode;
}

export function TeamThemeProvider({ children }: TeamThemeProviderProps) {
  const team = useAppStore((state) => state.team);
  const subscription = useAppStore((state) => state.subscription);
  const tierOverride = useAppStore((state) => state.tierOverride);
  
  const effectiveTier = tierOverride ?? subscription.tier;
  const canCustomize = effectiveTier === 'organization';

  const primaryColor = canCustomize && team?.primaryColor ? team.primaryColor : DEFAULT_PRIMARY;
  const secondaryColor = canCustomize && team?.secondaryColor ? team.secondaryColor : DEFAULT_SECONDARY;
  const fontUrl = canCustomize && team?.fontUrl ? team.fontUrl : null;
  const fontName = canCustomize && team?.fontName ? team.fontName : null;

  const primaryScale = useMemo(() => generateColorScale(primaryColor), [primaryColor]);
  const secondaryScale = useMemo(() => generateColorScale(secondaryColor), [secondaryColor]);

  useEffect(() => {
    if (!fontUrl || !fontName) return;

    const fontId = 'team-custom-font';
    let existingStyle = document.getElementById(fontId);
    
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleElement = document.createElement('style');
    styleElement.id = fontId;
    styleElement.textContent = `
      @font-face {
        font-family: "${fontName}";
        src: url("${fontUrl}") format("truetype");
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `;
    document.head.appendChild(styleElement);

    document.documentElement.style.setProperty('--team-font', `"${fontName}", sans-serif`);

    return () => {
      const styleToRemove = document.getElementById(fontId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
      document.documentElement.style.removeProperty('--team-font');
    };
  }, [fontUrl, fontName]);

  useEffect(() => {
    const root = document.documentElement;
    
    Object.entries(primaryScale).forEach(([shade, value]) => {
      root.style.setProperty(`--color-primary-${shade}`, value);
    });
    
    Object.entries(secondaryScale).forEach(([shade, value]) => {
      root.style.setProperty(`--color-secondary-${shade}`, value);
    });

    root.style.setProperty('--team-primary', primaryColor);
    root.style.setProperty('--team-secondary', secondaryColor);
    root.style.setProperty('--team-logo', team?.logoUrl ? `url(${team.logoUrl})` : 'none');

    return () => {
      const defaultPrimaryScale = generateColorScale(DEFAULT_PRIMARY);
      const defaultSecondaryScale = generateColorScale(DEFAULT_SECONDARY);
      
      Object.entries(defaultPrimaryScale).forEach(([shade, value]) => {
        root.style.setProperty(`--color-primary-${shade}`, value);
      });
      Object.entries(defaultSecondaryScale).forEach(([shade, value]) => {
        root.style.setProperty(`--color-secondary-${shade}`, value);
      });
    };
  }, [primaryScale, secondaryScale, primaryColor, secondaryColor, team?.logoUrl]);

  return <>{children}</>;
}
