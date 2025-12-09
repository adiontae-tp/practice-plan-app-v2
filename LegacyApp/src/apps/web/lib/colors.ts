/**
 * Color constants for web app
 * Extracted from @ppa/ui/branding to avoid importing React Native code
 */
export const COLORS = {
  // Brand colors
  primary: '#356793',
  secondary: '#EF7B8F',
  tertiary: '#E78128',

  // Status colors
  error: '#E63535',
  success: '#348352',
  warning: '#E77828',
  info: '#0DA6F2',

  // UI colors
  background: '#E0E0E0',
  white: '#FFFFFF',
  black: '#121212',

  // Text colors
  textDark: '#262627',
  textSecondary: '#737373',
  textMuted: '#8C8C8C',

  // Border/outline
  border: '#D3D3D3',
  borderLight: '#E6E6E6',
} as const;
